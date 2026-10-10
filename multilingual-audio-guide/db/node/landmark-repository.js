import { query } from './database.js';
// Fixed whitelist; never interpolate arbitrary request input as SQL column names.
function langSuffix(language) {
  if (language !== 'vi' && language !== 'en') throw new Error('Supported languages: vi, en');
  return language;
}
export async function listLandmarks(language = 'vi') {
  const lang = langSuffix(language);
  const { rows } = await query(`SELECT landmark_id AS id,
    title_${lang} AS title, subtitle_${lang} AS subtitle,
    description_${lang} AS description, latitude, longitude,
    background_image_url, audio_${lang}_url AS audio_url,
    $1::text AS language FROM public.landmarks ORDER BY landmark_id`, [language]);
  return rows;
}
export async function getLandmark(id, language = 'vi') {
  const lang = langSuffix(language);
  const { rows } = await query(`SELECT landmark_id AS id,
    title_${lang} AS title, subtitle_${lang} AS subtitle,
    description_${lang} AS description, transcript_${lang} AS transcript,
    latitude, longitude, background_image_url, audio_${lang}_url AS audio_url,
    $2::text AS language FROM public.landmarks WHERE landmark_id = $1`, [id, language]);
  if (!rows.length) return null;
  const gallery = await query(`SELECT image_id, image_url, sort_order
    FROM public.landmark_images WHERE landmark_id = $1 ORDER BY sort_order, image_id`, [id]);
  const buses = await query(`SELECT r.route_number, s.stop_name, s.latitude, s.longitude
    FROM public.landmark_bus_connections c
    JOIN public.bus_routes r ON r.route_id=c.route_id
    JOIN public.bus_stops s ON s.stop_id=c.stop_id
    WHERE c.landmark_id=$1 ORDER BY r.route_number, s.stop_name`, [id]);
  return { ...rows[0], images: gallery.rows, bus_connections: buses.rows };
}
