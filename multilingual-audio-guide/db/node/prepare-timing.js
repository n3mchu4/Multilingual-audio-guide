// Draft only: null timings must be filled by listening to the real audio.
import { readFile, writeFile } from 'node:fs/promises';

try {
  const [input, audioUrl, output] = process.argv.slice(2);
  if (!input || !audioUrl || !output) {
    throw new Error('Usage: npm --prefix db run prepare:timing -- TRANSCRIPT_TXT AUDIO_URL OUTPUT_JSON');
  }
  const text = (await readFile(input, 'utf8')).replace(/^\uFEFF/, '').trim();
  if (!text) throw new Error('Transcript file is empty');
  const sentences = Array.from(new Intl.Segmenter(undefined, { granularity: 'sentence' }).segment(text),
    ({ segment }) => segment.trim()).filter(Boolean);
  await writeFile(output, JSON.stringify({ audio_url: audioUrl,
    cues: sentences.map((sentence) => ({ start: null, end: null, text: sentence })),
  }, null, 2) + '\n', { flag: 'wx' });
  console.log(`Created ${sentences.length} draft cues. Fill start/end seconds before import.`);
} catch (error) {
  console.error('Preparation failed:', error.message);
  process.exitCode = 1;
}
