import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { validateTranscriptCues, findActiveTranscriptCue } from '../../shared/utils/transcriptTiming.js';

const cues = [
  { start: 0.5, end: 2, text: 'Xin chào.' },
  { start: 3, end: 5.25, text: 'Đây là Sài Gòn!' },
];
test('validates full Vietnamese/English content, allowing whitespace differences', () => {
  assert.deepEqual(validateTranscriptCues(cues, 'Xin chào.\n\nĐây là Sài Gòn!'), cues);
  assert.equal(validateTranscriptCues([{ start: 0, end: 1, text: 'Hello!' }], 'Hello!').length, 1);
});
test('rejects drafts, overlap, invalid ranges, missing sentences and altered text', () => {
  for (const value of [[], null, [{ start: null, end: null, text: 'Xin chào.' }],
    [{ start: -1, end: 2, text: 'Xin chào.' }],
    [{ start: 2, end: 2, text: 'Xin chào.' }],
    [{ start: 0, end: Infinity, text: 'Xin chào.' }],
    [{ start: '0', end: 2, text: 'Xin chào.' }],
    [cues[1], cues[0]], [cues[0], { ...cues[1], start: 1 }],
    [cues[0]], [{ ...cues[0], text: 'Other.' }]]) {
    assert.throws(() => validateTranscriptCues(value, 'Xin chào. Đây là Sài Gòn!'));
  }
});
test('handles boundaries, silence, end, backward seeks and millisecond conversion', () => {
  for (const [time, index] of [[0, -1], [0.5, 0], [1.99, 0], [2, -1], [3, 1],
    [5.25, -1], [99, -1], [1, 0], [-1, -1], [NaN, -1]]) {
    assert.equal(findActiveTranscriptCue(cues, time), index);
  }
  assert.equal(findActiveTranscriptCue(cues, 3500 / 1000), 1);
  assert.equal(findActiveTranscriptCue([], 1), -1);
});

test('prepares all bundled transcripts without losing text and refuses to overwrite', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'guide-cues-'));
  try {
    const content = new URL('../content/', import.meta.url);
    for (const name of (await readdir(content)).filter((file) => file.endsWith('.txt'))) {
      const output = join(directory, name + '.json');
      const args = [fileURLToPath(new URL('./prepare-timing.js', import.meta.url)),
        fileURLToPath(new URL(name, content)), 'https://example.com/audio.mp3', output];
      assert.equal(spawnSync(process.execPath, args).status, 0);
      const draft = JSON.parse(await readFile(output, 'utf8'));
      assert.ok(draft.cues.every((cue) => cue.start === null && cue.end === null));
      assert.throws(() => validateTranscriptCues(draft.cues, 'Draft cannot be imported'));
      validateTranscriptCues(draft.cues.map((cue, i) => ({ ...cue, start: i, end: i + 1 })),
        await readFile(new URL(name, content), 'utf8'));
      assert.equal(spawnSync(process.execPath, args).status, 1);
      assert.deepEqual(JSON.parse(await readFile(output, 'utf8')), draft);
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
