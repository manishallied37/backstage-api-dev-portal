import { Pool } from 'pg';
import { Config } from '@backstage/config';

let pool: Pool | undefined;

export const tryGetDbPool = (config: Config): Pool | undefined => {
    try {
        const dbConfig = config.getOptionalConfig('backend.database.connection');

        if (!dbConfig) {
            return undefined;
        }

        if (!pool) {
            pool = new Pool({
                host: dbConfig.getString('host'),
                port: dbConfig.getNumber('port'),
                user: dbConfig.getString('user'),
                password: dbConfig.getString('password'),
                database: dbConfig.getString('database'),
            });
        }

        return pool;

    } catch (err) {
        console.error('DB Config Error:', err);
        return undefined;
    }
};