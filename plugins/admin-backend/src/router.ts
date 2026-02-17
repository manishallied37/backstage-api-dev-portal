import { HttpAuthService } from '@backstage/backend-plugin-api';
import { InputError } from '@backstage/errors';
import { z } from 'zod';
import express from 'express';
import Router from 'express-promise-router';
import { todoListServiceRef } from './services/TodoListService';
import ldap from 'ldapjs';
import {
  PolicyQueryUser
} from '@backstage/plugin-permission-node';

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

  // async function assertSuperUser(
  //   req: express.Request,
  //   httpAuthParam: HttpAuthService,
  // ) {
  //   const credentials = await httpAuthParam.credentials(req, {
  //     allow: ['user'],
  //   });

  //   const principal = credentials.principal;

  //   if (!principal || principal.type !== 'user') {
  //     throw new InputError('Not authorized');
  //   }

  //   const ownershipRefs =
  //     (principal as any).ownershipEntityRefs ??
  //     (principal as any).claims?.ent ??
  //     [];
  //   console.log('GROUPS:', ownershipRefs);

  //   const isSuperUser = ownershipRefs.some((g: string) =>
  //     g.endsWith('/superusers'),
  //   );

  //   if (!isSuperUser) {
  //     throw new InputError('Superuser access required');
  //   }
  // }

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

  router.post('/ldap/test', async (req, res) => {
    // await assertSuperUser(req, httpAuth);
    const { dn, password, url } = req.body;

    const client = ldap.createClient({ url });

    try {
      await new Promise<void>((resolve, reject) => {
        client.bind(dn, password, err => {
          if (err) reject(err);
          else resolve();
        });
      });

      client.unbind();
      return res.json({ success: true });
    } catch (error: any) {
      return res.json({
        success: false,
        error: error.message,
      });
    }
  });

  router.post('/ldap/check-ou', async (req, res) => {
    // await assertSuperUser(req, httpAuth);
    const { url, bindDn, bindPassword, ouDn } = req.body;
    const client = ldap.createClient({ url });

    try {
      await new Promise<void>((resolve, reject) => {
        client.bind(bindDn, bindPassword, bindErr => {
          if (bindErr) {
            reject(bindErr);
            return;
          }
          resolve();
        });
      });

      const exists = await new Promise<boolean>((resolve, reject) => {
        const searchCallback = (
          searchErr: Error | null,
          searchRes: ldap.SearchCallbackResponse
        ): void => {
          if (searchErr) {
            reject(searchErr);
            return;
          }

          let found = false;

          searchRes.on('searchEntry', () => {
            found = true;
          });

          searchRes.on('error', searchResErr => {
            reject(searchResErr);
          });

          searchRes.on('end', () => {
            resolve(found);
          });
        };

        client.search(ouDn, { scope: 'base' }, searchCallback);
      });

      client.unbind();
      return res.json({ exists });

    } catch (error: any) {
      client.unbind();
      return res.status(500).json({ exists: false, error: error.message });
    }
  });


  router.post('/ldap/create', async (req, res) => {
    // await assertSuperUser(req, httpAuth);
    const { url, bindDn, bindPassword, userDn, attributes } = req.body;

    const client = ldap.createClient({ url });

    try {
      await new Promise<void>((resolve, reject) => {
        client.bind(bindDn, bindPassword, err => {
          if (err) reject(err);
          else resolve();
        });
      });

      const entry: any = { ...attributes };
      if (!entry.objectClass || entry.objectClass.length === 0) {
        entry.objectClass = ['inetOrgPerson', 'organizationalPerson', 'person', 'top'];
      }

      await new Promise<void>((resolve, reject) => {
        client.add(userDn, entry, err => {
          if (err) reject(err);
          else resolve();
        });
      });

      client.unbind();
      return res.json({ success: true, dn: userDn });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}
