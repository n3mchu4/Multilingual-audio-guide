import test from 'node:test';
import assert from 'node:assert/strict';
import { createPresenceTracker, startPresence } from '../../shared/utils/presence.js';
import { buildTranscriptTimeline, findActiveTranscriptCue } from '../../shared/utils/transcriptTiming.js';

test('online starts at zero, deduplicates tabs, removes only the departing session and expires', () => {
  let now = 0;
  const tracker = createPresenceTracker(() => now);
  assert.equal(tracker.count(), 0);
  tracker.ping({ sessionId: 'tab1', visitorId: 'browser1' });
  tracker.ping({ sessionId: 'tab2', visitorId: 'browser1' });
  assert.equal(tracker.count(), 1);
  tracker.ping({ sessionId: 'mobile', visitorId: 'phone' });
  assert.equal(tracker.count(), 2);
  tracker.ping({ sessionId: 'tab1', active: false });
  assert.equal(tracker.count(), 2);
  now = 120_001;
  tracker.ping({ sessionId: 'mobile', visitorId: 'phone' });
  assert.equal(tracker.count(), 1);
  now += 120_001;
  assert.equal(tracker.count(), 0);
});

test('heartbeat continues past two minutes, follows foreground/background and cleans up', context => {
  context.mock.timers.enable({ apis: ['setInterval'] });
  let active = true;
  let onChange;
  let unsubscribed = false;
  const events = [];
  const stop = startPresence({
    send: value => events.push(value), isActive: () => active,
    subscribe: callback => { onChange = callback; return () => { unsubscribed = true; }; },
  });
  context.mock.timers.tick(150_000);
  assert.equal(events.length, 6);
  assert.ok(events.every(Boolean));
  active = false; onChange();
  assert.equal(events.at(-1), false);
  active = true; onChange();
  assert.equal(events.at(-1), true);
  stop();
  assert.equal(events.at(-1), false);
  const count = events.length;
  context.mock.timers.tick(60_000);
  assert.equal(events.length, count);
  assert.ok(unsubscribed);
});

test('VI and EN use independent measured cues including silence, seeking and audio end', () => {
  const vi = buildTranscriptTimeline('Xin chào. Sài Gòn!', [
    { text: 'Xin chào.', start: 0.5, end: 2 }, { text: 'Sài Gòn!', start: 3, end: 5 },
  ], 6);
  const en = buildTranscriptTimeline('Hello. Saigon!', [
    { text: 'Hello.', start: 0, end: 1 }, { text: 'Saigon!', start: 1.5, end: 3 },
  ], 4);
  assert.equal(vi.estimated, false);
  assert.equal(en.estimated, false);
  assert.equal(findActiveTranscriptCue(vi.cues, 2.5), -1);
  assert.equal(findActiveTranscriptCue(en.cues, 2.5), 1);
  assert.equal(findActiveTranscriptCue(vi.cues, 1), 0);
  assert.equal(findActiveTranscriptCue(en.cues, 4), -1);
});

test('unprepared or stale cues fall back only after real metadata, and never invent 120 seconds', () => {
  for (const text of ['Xin chào. Sài Gòn!', 'Hello. Saigon!']) {
    for (const duration of [0, NaN, Infinity]) {
      assert.deepEqual(buildTranscriptTimeline(text, [], duration).cues, []);
    }
    const result = buildTranscriptTimeline(text, [{ text: 'Stale.', start: 0, end: 1 }], 17);
    assert.equal(result.estimated, true);
    assert.equal(result.cues.length, 2);
    assert.equal(result.cues.at(-1).end, 17);
    assert.equal(findActiveTranscriptCue(result.cues, 17), -1);
  }
});
