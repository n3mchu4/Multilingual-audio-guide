// One tracker per API process. A session expires after two minutes without a ping.
export function createPresenceTracker(now = Date.now, timeout = 120_000) {
  const sessions = new Map();
  const count = () => {
    for (const [id, session] of sessions) {
      if (now() - session.lastSeen > timeout) sessions.delete(id);
    }
    return new Set([...sessions.values()].map(session => session.visitorId)).size;
  };
  return {
    count,
    ping({ sessionId, visitorId = sessionId, active = true }) {
      if (active) sessions.set(sessionId, { visitorId, lastSeen: now() });
      else sessions.delete(sessionId);
      return count();
    },
  };
}

// Timer and lifecycle adapters make the same heartbeat work on web and native.
export function startPresence({ send, isActive, subscribe, interval = 30_000 }) {
  let stopped = false;
  const ping = () => { if (!stopped) send(isActive()); };
  ping();
  const timer = setInterval(ping, interval);
  const unsubscribe = subscribe(ping);
  return () => {
    stopped = true;
    clearInterval(timer);
    unsubscribe();
    send(false);
  };
}
