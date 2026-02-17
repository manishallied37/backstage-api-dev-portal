import { HttpAuthService } from '@backstage/backend-plugin-api';
import { InputError } from '@backstage/errors';
import { z } from 'zod';
import express from 'express';
import Router from 'express-promise-router';
import { todoListServiceRef } from './services/TodoListService';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import fs from 'fs';
import yaml from 'yaml';
import path from 'path';

export async function createRouter({
  httpAuth,
  todoList,
}: {
  httpAuth: HttpAuthService;
  todoList: typeof todoListServiceRef.T;
}): Promise<express.Router> {
  const router = Router();
  router.use(express.json());

  const todoSchema = z.object({
    title: z.string(),
    entityRef: z.string().optional(),
  });

  router.post('/todos', async (req, res) => {
    const parsed = todoSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new InputError(parsed.error.toString());
    }

    const result = await todoList.createTodo(parsed.data, {
      credentials: await httpAuth.credentials(req, { allow: ['user'] }),
    });

    res.status(201).json(result);
  });

  router.get('/todos', async (_req, res) => {
    res.json(await todoList.listTodos());
  });

  router.get('/todos/:id', async (req, res) => {
    res.json(await todoList.getTodo({ id: req.params.id }));
  });

  const saveSchema = z.object({
    dbDetails: z.object({
      host: z.string(),
      port: z.coerce.number(),
      database: z.string(),
      user: z.string(),
      password: z.string(),
    }),
    superUser: z.object({
      username: z.string(),
      password: z.string().min(6),
      email: z.string()
    }),
  });

  const testDbSchema = z.object({
    host: z.string(),
    port: z.coerce.number(),
    database: z.string(),
    user: z.string(),
    password: z.string(),
  });

  router.post('/test-db', async (req, res) => {
    const parsed = testDbSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: parsed.error.toString(),
      });
    }

    const { host, port, database, user, password } = parsed.data;

    const pool = new Pool({
      host,
      port,
      database,
      user,
      password,
      connectionTimeoutMillis: 5000,
    });

    try {
      await pool.query('SELECT 1');

      await pool.query(`
      CREATE TABLE IF NOT EXISTS api_users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(100) DEFAULT 'user',
        is_registered BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

      await pool.end();

      res.status(200).json({
        success: true,
        message: 'Database connected and table verified/created'
      });

    } catch (error: any) {
      await pool.end();
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  });

  router.post('/save-db', async (req, res) => {
    const parsed = saveSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new InputError(parsed.error.toString());
    }

    const { dbDetails, superUser } = parsed.data;
    const { host, port, database, user, password } = dbDetails;

    const pool = new Pool({
      host,
      port,
      database,
      user,
      password,
    });

    try {
      const configPath = path.resolve(__dirname, '../../../app-config.local.yaml');
      console.log("Resolved path:", configPath);

      const passwordHash = await bcrypt.hash(superUser.password, 12);

      await pool.query(
        `INSERT INTO api_users (username, email, password_hash, is_registered, role)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (username)
       DO UPDATE SET is_registered = true, role = 'superuser'`,
        [superUser.username, superUser.email, passwordHash, true, 'superuser']
      );

      await pool.end();

      const file = fs.readFileSync(configPath, 'utf8');
      const existingConfig = yaml.parse(file) ?? {};

      existingConfig.backend = {
        ...(existingConfig.backend ?? {}),
        database: {
          client: 'pg',
          connection: {
            host,
            port,
            user,
            password,
            database,
          },
        },
      };

      const updatedYaml = yaml.stringify(existingConfig);

      fs.writeFileSync(configPath, updatedYaml, 'utf8');

      res.status(200).json({
        success: true,
        message: 'Setup completed successfully',
      });

    } catch (error: any) {
      await pool.end();
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  });

  router.get('/status', async (req, res) => {
    try {
      const configPath = path.resolve(process.cwd(), 'app-config.local.yaml');

      if (!fs.existsSync(configPath)) {
        return res.json({
          setupComplete: false,
          reason: 'CONFIG_NOT_FOUND',
        });
      }

      const file = fs.readFileSync(configPath, 'utf8');
      const existingConfig = yaml.parse(file);

      const dbConfig = existingConfig?.backend?.database?.connection;

      if (!dbConfig) {
        return res.json({
          setupComplete: false,
          reason: 'DB_CONFIG_NOT_FOUND',
        });
      }

      const { host, port, database, user, password } = dbConfig;

      const pool = new Pool({
        host,
        port: Number(port),
        database,
        user,
        password,
      });

      const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'api_users'
      );
    `);

      const tableExists = tableCheck.rows[0].exists;

      if (!tableExists) {
        await pool.end();
        return res.json({
          setupComplete: false,
          reason: 'TABLE_NOT_FOUND',
        });
      }

      const result = await pool.query(
        `SELECT id FROM api_users WHERE is_registered = true LIMIT 1`
      );

      await pool.end();

      return res.json({
        setupComplete: result.rows.length > 0,
      });

    } catch (error: any) {
      return res.status(500).json({
        setupComplete: false,
        error: 'DB_CONNECTION_FAILED',
      });
    }
  });

  return router;
}