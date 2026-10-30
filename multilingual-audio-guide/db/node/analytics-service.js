import { randomUUID } from 'node:crypto';
import { query } from './database.js';
import { createPresenceTracker } from '../../shared/utils/presence.js';

const presence = createPresenceTracker();

// Ghi nhận thiết bị đang hoạt động hoặc đã thoát, cập nhật số khách online.
export async function recordPing({
  sessionId,
  visitorId,
  platform,
  active,
}) {
  if (active) {
    await query(
      `
        INSERT INTO public.device_sessions
          (session_id, visitor_id, platform, started_at, last_seen_at, ended_at)
        VALUES ($1, $2, $3, now(), now(), NULL)
        ON CONFLICT (session_id) DO UPDATE
        SET last_seen_at = now(), ended_at = NULL
      `,
      [sessionId, visitorId, platform]
    );
  } else {
    await query(
      `
        UPDATE public.device_sessions
        SET ended_at = COALESCE(ended_at, now())
        WHERE session_id = $1
      `,
      [sessionId]
    );
  }

  return presence.ping({ sessionId, visitorId, active });
}

// Ghi nhận lượt nghe theo cách cũ để tương thích với các client hiện có.
export async function recordAudioPlay({
  landmarkId,
  lang = 'vi',
  visitorId = randomUUID(),
}) {
  const { rowCount } = await query(
    `
      WITH selected_landmark AS (
        SELECT landmark_id
        FROM public.landmarks
        WHERE landmark_id = $2
      ), visitor AS (
        INSERT INTO public.analytics_visitors (visitor_id)
        SELECT $1
        WHERE EXISTS (SELECT 1 FROM selected_landmark)
        ON CONFLICT (visitor_id) DO UPDATE SET last_seen_at = now()
        RETURNING visitor_id
      )
      INSERT INTO public.audio_listens
        (visitor_id, landmark_id, language)
      SELECT visitor.visitor_id, selected_landmark.landmark_id, $3
      FROM visitor CROSS JOIN selected_landmark
    `,
    [visitorId, landmarkId, lang]
  );

  return rowCount > 0;
}

// M09: lưu/cập nhật phiên nghe, thời gian và trạng thái hoàn thành; chống đếm trùng khi gửi lại.
export async function recordListeningSession(event) {
  const {
    listenSessionId,
    landmarkId,
    lang,
    visitorId,
    platform,
    listenedSeconds,
    durationSeconds,
    completed,
  } = event;

  const { rowCount } = await query(
    `
      WITH selected_landmark AS (
        SELECT landmark_id
        FROM public.landmarks
        WHERE landmark_id = $2
      ), visitor AS (
        INSERT INTO public.analytics_visitors (visitor_id)
        SELECT $1
        WHERE EXISTS (SELECT 1 FROM selected_landmark)
        ON CONFLICT (visitor_id) DO UPDATE SET last_seen_at = now()
        RETURNING visitor_id
      )
      INSERT INTO public.audio_listens
        (visitor_id, landmark_id, language, session_id, platform,
         listened_seconds, duration_seconds, completed)
      SELECT
        visitor.visitor_id, selected_landmark.landmark_id,
        $3, $4, $5, $6, $7, $8
      FROM visitor CROSS JOIN selected_landmark
      ON CONFLICT (session_id) DO UPDATE SET
        listened_seconds = GREATEST(
          audio_listens.listened_seconds,
          EXCLUDED.listened_seconds
        ),
        duration_seconds = GREATEST(
          audio_listens.duration_seconds,
          EXCLUDED.duration_seconds
        ),
        completed = audio_listens.completed OR EXCLUDED.completed,
        last_seen_at = now()
      WHERE audio_listens.visitor_id = EXCLUDED.visitor_id
        AND audio_listens.landmark_id = EXCLUDED.landmark_id
        AND audio_listens.language = EXCLUDED.language
        AND audio_listens.platform = EXCLUDED.platform
    `,
    [
      visitorId,
      landmarkId,
      lang,
      listenSessionId,
      platform,
      listenedSeconds,
      durationSeconds,
      completed,
    ]
  );

  return rowCount > 0;
}

// Tổng hợp số khách, lượt nghe, thời gian nghe và các lượt nghe gần nhất cho dashboard.
export async function getAnalyticsData() {
  const [totals, byLandmark, recent] = await Promise.all([
    query(`
      SELECT
        (SELECT count(*)::int FROM public.analytics_visitors) AS visitors,
        (SELECT count(*)::int FROM public.audio_listens) AS listens,
        (
          SELECT COALESCE(sum(listened_seconds), 0)::float
          FROM public.audio_listens
        ) AS "listeningSeconds",
        (
          SELECT count(*)::int
          FROM public.audio_listens
          WHERE completed
        ) AS "completedListens"
    `),

    query(`
      SELECT landmark_id, count(*)::int AS count
      FROM public.audio_listens
      GROUP BY landmark_id
    `),

    query(`
      SELECT
        a.landmark_id,
        a.language AS lang,
        a.listened_at AS time,
        CASE
          WHEN a.language = 'en' THEN l.title_en
          ELSE l.title_vi
        END AS title
      FROM public.audio_listens a
      JOIN public.landmarks l USING (landmark_id)
      ORDER BY a.listened_at DESC, a.listen_id DESC
      LIMIT 15
    `),
  ]);

  return {
    ...totals.rows[0],
    activeUsers: presence.count(),
    totalAudioPlays: totals.rows[0].listens,
    playsByLandmark: Object.fromEntries(
      byLandmark.rows.map((row) => [row.landmark_id, row.count])
    ),
    recentPlays: recent.rows.map((row) => ({
      ...row,
      landmarkId: row.landmark_id,
    })),
  };
}