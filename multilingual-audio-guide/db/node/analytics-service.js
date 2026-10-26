import { randomUUID } from 'node:crypto';
import { query } from './database.js';
import { createPresenceTracker } from '../../shared/utils/presence.js';

const presence = createPresenceTracker();
export async function recordPing({ sessionId, visitorId, platform, active }) {
  // Persist session history before updating the in-memory live counter.
  if (active) {
    await query(`INSERT INTO public.device_sessions
      (session_id, visitor_id, platform, started_at, last_seen_at, ended_at)
      VALUES ($1, $2, $3, now(), now(), NULL)
      ON CONFLICT (session_id) DO UPDATE
      SET last_seen_at = now(), ended_at = NULL`,
    [sessionId, visitorId, platform]);
  } else {
    await query(`UPDATE public.device_sessions
      SET ended_at = COALESCE(ended_at, now())
      WHERE session_id = $1`, [sessionId]);
  }
  return presence.ping({ sessionId, visitorId, active });
}

// Both /play and /listens persist to audio_listens; dashboard totals share one source.
export async function recordAudioPlay({ landmarkId, lang = 'vi', visitorId = randomUUID() }) {
  const { rowCount } = await query(`WITH selected_landmark AS (
      SELECT landmark_id FROM public.landmarks WHERE landmark_id=$2
    ), visitor AS (
      INSERT INTO public.analytics_visitors(visitor_id)
      SELECT $1 WHERE EXISTS (SELECT 1 FROM selected_landmark)
      ON CONFLICT (visitor_id) DO UPDATE SET last_seen_at=now()
      RETURNING visitor_id
    )
    INSERT INTO public.audio_listens(visitor_id,landmark_id,language)
    SELECT visitor.visitor_id,selected_landmark.landmark_id,$3
    FROM visitor CROSS JOIN selected_landmark`, [visitorId, landmarkId, lang]);
  return rowCount > 0;
}

export async function getAnalyticsData() {
  const [totals, byLandmark, recent] = await Promise.all([
    query(`SELECT
      (SELECT count(*)::int FROM public.analytics_visitors) AS visitors,
      (SELECT count(*)::int FROM public.audio_listens) AS listens`),
    query(`SELECT landmark_id, count(*)::int AS count FROM public.audio_listens GROUP BY landmark_id`),
    query(`SELECT a.landmark_id, a.language AS lang, a.listened_at AS time,
      CASE WHEN a.language='en' THEN l.title_en ELSE l.title_vi END AS title
      FROM public.audio_listens a JOIN public.landmarks l USING (landmark_id)
      ORDER BY a.listened_at DESC, a.listen_id DESC LIMIT 15`),
  ]);
  return {
    ...totals.rows[0],
    activeUsers: presence.count(),
    totalAudioPlays: totals.rows[0].listens,
    playsByLandmark: Object.fromEntries(byLandmark.rows.map(row => [row.landmark_id, row.count])),
    recentPlays: recent.rows.map(row => ({ ...row, landmarkId: row.landmark_id })),
  };
}
