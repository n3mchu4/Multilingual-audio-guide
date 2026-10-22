// Trusted maintenance CLI. Never expose database credentials to web/mobile.
import { readFile } from 'node:fs/promises';
import { pool } from './database.js';
import { validateTranscriptCues } from '../../shared/utils/transcriptTiming.js';

let client;
try {
  const [id, language, file] = process.argv.slice(2);
  if (!id || !file || !['vi', 'en'].includes(language)) {
    throw new Error('Usage: npm --prefix db run import:timing -- LANDMARK_ID vi|en PATH_TO_JSON');
  }
  const document = JSON.parse((await readFile(file, 'utf8')).replace(/^\uFEFF/, ''));
  client = await pool.connect();
  await client.query('BEGIN');
  // Serialize with content/media edits, including proposal approvals.
  const { rows } = await client.query(`SELECT transcript_${language} AS transcript,
    audio_${language}_url AS audio_url FROM public.landmarks WHERE landmark_id=$1 FOR UPDATE`, [id]);
  if (!rows.length) throw new Error('Landmark ID not found');
  if (!rows[0].audio_url || document.audio_url !== rows[0].audio_url) {
    throw new Error('audio_url must match the configured audio URL for this language');
  }
  const cues = validateTranscriptCues(document.cues, rows[0].transcript);
  await client.query(`UPDATE public.landmarks SET transcript_cues_${language}=$1::jsonb
    WHERE landmark_id=$2`, [JSON.stringify(cues), id]);
  await client.query('COMMIT');
  console.log(`Imported ${cues.length} ${language} cues for ${id}`);
} catch (error) {
  if (client) await client.query('ROLLBACK');
  console.error('Timing import failed:', error.code ?? error.message);
  process.exitCode = 1;
} finally {
  client?.release();
  await pool.end();
}
