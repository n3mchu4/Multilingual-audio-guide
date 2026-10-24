import { query } from './database.js';

// In-memory tracking with DB persistence fallback
const activeSessions = new Map(); // sessionId -> { lastSeen, platform, path }
const playCounts = new Map();
const recentPlays = [];
let initialized = false;

export async function initAnalytics() {
  if (initialized) return;
  try {
    const { rows } = await query(`
      SELECT target_id AS landmark_id, count(*)::int AS count
      FROM public.activity_logs
      WHERE action_type = 'AUDIO_PLAY'
      GROUP BY target_id
    `);
    for (const r of rows) {
      if (r.landmark_id) playCounts.set(r.landmark_id, r.count);
    }

    const recent = await query(`
      SELECT target_id AS landmark_id, description, created_at
      FROM public.activity_logs
      WHERE action_type = 'AUDIO_PLAY'
      ORDER BY created_at DESC
      LIMIT 25
    `);
    for (const r of recent.rows) {
      recentPlays.push({
        landmarkId: r.landmark_id,
        title: r.description,
        time: r.created_at,
      });
    }
  } catch (err) {
    console.warn('Analytics DB init warning:', err.message);
  }
  initialized = true;
}

export function recordPing(sessionId, platform = 'web', path = '/') {
  const now = Date.now();
  const id = sessionId || `anon-${Math.random().toString(36).slice(2, 9)}`;
  activeSessions.set(id, {
    lastSeen: now,
    platform,
    path,
  });

  // Dọn dẹp session đã hết hạn sau 2 phút (120 giây)
  for (const [key, session] of activeSessions.entries()) {
    if (now - session.lastSeen > 120_000) {
      activeSessions.delete(key);
    }
  }

  return getActiveUsersCount();
}

export function getActiveUsersCount() {
  const now = Date.now();
  let count = 0;
  for (const [id, session] of activeSessions.entries()) {
    if (now - session.lastSeen <= 120_000) {
      count++;
    } else {
      activeSessions.delete(id);
    }
  }
  return Math.max(1, count); // Luôn tối thiểu 1 người khi có kết nối
}

export async function recordAudioPlay({ landmarkId, lang = 'vi', title = '' }) {
  await initAnalytics();
  const current = playCounts.get(landmarkId) || 0;
  playCounts.set(landmarkId, current + 1);

  const cleanTitle = title || landmarkId;
  const event = {
    landmarkId,
    lang,
    title: cleanTitle,
    time: new Date().toISOString(),
  };
  recentPlays.unshift(event);
  if (recentPlays.length > 30) recentPlays.pop();

  try {
    const desc = `Khách nghe thuyết minh: ${cleanTitle} (${lang.toUpperCase()})`;
    await query(
      `INSERT INTO public.activity_logs (user_id, action_type, target_type, target_id, description)
       VALUES ($1, 'AUDIO_PLAY', 'LANDMARK', $2, $3)`,
      [null, landmarkId, desc]
    );
  } catch (err) {
    console.warn('Failed to persist audio play log:', err.message);
  }

  return {
    landmarkPlays: playCounts.get(landmarkId),
    totalPlays: getTotalAudioPlays(),
  };
}

export function getTotalAudioPlays() {
  let total = 0;
  for (const count of playCounts.values()) {
    total += count;
  }
  return total;
}

export function getAnalyticsData() {
  return {
    activeUsers: getActiveUsersCount(),
    totalAudioPlays: getTotalAudioPlays(),
    playsByLandmark: Object.fromEntries(playCounts),
    recentPlays: recentPlays.slice(0, 15),
  };
}
