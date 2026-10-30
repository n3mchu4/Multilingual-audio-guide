import { createVisitorId } from './visitorId.js';

// Pause/resume giữ cùng một phiên nghe.
export function createListeningSession(
  { landmarkId, lang, visitorId, platform },
  now = Date.now
) {
  const event = {
    listenSessionId: createVisitorId(),
    landmarkId,
    lang,
    visitorId,
    platform,
    listenedSeconds: 0,
    durationSeconds: 0,
    completed: false,
  };

  let previous = null;
  let wasPlaying = false;

  return {
    update(status) {
      const time = now();

      if (wasPlaying && previous != null) {
        event.listenedSeconds += Math.max(
          0,
          Math.min(2, (time - previous) / 1000)
        );
      }

      previous = time;

      wasPlaying = Boolean(
        status.playing &&
        status.isLoaded &&
        !status.isBuffering
      );

      if (
        Number.isFinite(status.duration) &&
        status.duration > 0
      ) {
        event.durationSeconds = status.duration;
      }

      // Hoàn thành khi audio kết thúc và đã nghe ít nhất 90%.
      if (
        status.didJustFinish &&
        event.durationSeconds > 0 &&
        event.listenedSeconds >= event.durationSeconds * 0.9
      ) {
        event.completed = true;
      }

      return {
        ...event,
        listenedSeconds: Math.floor(event.listenedSeconds),
      };
    },
  };
}