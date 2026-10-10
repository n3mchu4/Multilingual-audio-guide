// CLI maintenance tool, NOT a public endpoint. Updates official content directly.
import { readFile } from 'node:fs/promises';
import { pool, query } from './database.js';
try {
  const [id,language,file] = process.argv.slice(2);
  if (!id || !file || !['vi','en'].includes(language)) {
    throw new Error('Usage: npm --prefix db run import:text -- LANDMARK_ID vi|en "PATH_TO_UTF8_TXT"');
  }
  const transcript = (await readFile(file,'utf8')).replace(/^\uFEFF/, '').trim();
  if (!transcript) throw new Error('Transcript file is empty');
  const result = await query(`UPDATE public.landmarks SET transcript_${language}=$1
    WHERE landmark_id=$2 RETURNING landmark_id`, [transcript,id]);
  if (!result.rowCount) throw new Error('Landmark ID not found');
  console.log(`Imported ${language} transcript for ${id}. Update the matching audio too.`);
} catch (error) { console.error('Import failed:', error.code ?? error.message); process.exitCode=1; }
finally { await pool.end(); }
