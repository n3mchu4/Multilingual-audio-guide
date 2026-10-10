import bcrypt from 'bcryptjs';
import { pool, query } from './database.js';
try {
  const username = (process.argv[2] ?? 'admin').trim().toLowerCase();
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  if (!username || !password || password.length < 10 || Buffer.byteLength(password, 'utf8') > 72) {
    throw new Error('Username required; password must have at least 10 characters and at most 72 UTF-8 bytes');
  }
  const hash = await bcrypt.hash(password, 12);
  const { rows } = await query(`INSERT INTO public.users
    (username,password_hash,role,is_active,is_super_admin)
    VALUES ($1,$2,'ADMIN',true,true) RETURNING user_id,username,role`, [username,hash]);
  console.table(rows);
  console.log('Password hashed. This creates the account; implement your login API separately.');
} catch (error) {
  console.error('Create admin failed:', error.code ?? error.message);
  process.exitCode = 1;
} finally { delete process.env.BOOTSTRAP_ADMIN_PASSWORD; await pool.end(); }
