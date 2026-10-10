import { pool, query } from './database.js';
try {
  const { rows } = await query(`SELECT current_database() AS database,
    (SELECT count(*)::integer FROM public.landmarks) AS landmarks,
    (SELECT count(*)::integer FROM public.users) AS users,
    (SELECT count(*)::integer FROM public.proposals) AS proposals,
    (SELECT count(*)::integer FROM information_schema.tables
     WHERE table_schema='public' AND table_type='BASE TABLE') AS tables`);
  console.table(rows);
} catch (error) {
  console.error('DB check failed:', error.code ?? error.name);
  process.exitCode = 1;
} finally { await pool.end(); }
