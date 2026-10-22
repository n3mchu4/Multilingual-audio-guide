// Seconds, measured from the beginning of the matching language's audio.
const normalizeText = (text) => text.normalize('NFC').replace(/\s+/gu, ' ').trim();

export function validateTranscriptCues(cues, transcript) {
  if (!Array.isArray(cues) || cues.length === 0) {
    throw new Error('Provide a non-empty array of transcript cues');
  }
  let previousEnd = 0;
  const result = cues.map((cue, index) => {
    if (!cue || typeof cue.text !== 'string' || !cue.text.trim()
      || !Number.isFinite(cue.start) || !Number.isFinite(cue.end)
      || cue.start < previousEnd || cue.end <= cue.start) {
      throw new Error(`Invalid cue ${index + 1}: require text and ordered, non-overlapping start/end seconds`);
    }
    previousEnd = cue.end;
    return { start: cue.start, end: cue.end, text: cue.text.trim() };
  });
  if (typeof transcript !== 'string'
    || normalizeText(result.map((cue) => cue.text).join(' ')) !== normalizeText(transcript)) {
    throw new Error('Cue text must match the complete transcript (including punctuation)');
  }
  return result;
}

// Half-open intervals: start <= time < end. Silence and audio end return -1.
// Recompute after seeking, changing language, or changing landmark.
export function findActiveTranscriptCue(cues, currentTimeSeconds) {
  if (!Array.isArray(cues) || !Number.isFinite(currentTimeSeconds) || currentTimeSeconds < 0) return -1;
  return cues.findIndex((cue) => currentTimeSeconds >= cue.start && currentTimeSeconds < cue.end);
}
