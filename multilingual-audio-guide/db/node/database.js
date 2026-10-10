import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
export const dbRoot = fileURLToPath(new URL('../', import.meta.url));
dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });
for (const key of ['PGHOST','PGPORT','PGDATABASE','PGUSER','PGPASSWORD']) {
  if (!process.env[key]) throw new Error(`Missing ${key}; configure db/.env`);
}
const port = Number(process.env.PGPORT);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid PGPORT');
export const pool = new pg.Pool({
  host: process.env.PGHOST, port, database: process.env.PGDATABASE,
  user: process.env.PGUSER, password: process.env.PGPASSWORD,
  max: 5, connectionTimeoutMillis: 5000, idleTimeoutMillis: 30000,
});
pool.on('error', error => console.error('DB pool error:', error.code ?? error.name));
export const query = (sql, params = []) => pool.query(sql, params);
