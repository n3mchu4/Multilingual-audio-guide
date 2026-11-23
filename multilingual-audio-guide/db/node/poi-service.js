
import { pool } from './database.js';

const rad = (n) => n * Math.PI / 180;

function distanceMeters(a, b) {
  const lat1 = rad(a.latitude);
  const lat2 = rad(b.latitude);
  const dLat = lat2 - lat1;
  const dLng = rad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(dLng / 2) ** 2;
  return 6371000 * 2 * Math.asin(Math.sqrt(Math.min(1, h)));
}

function normalize(s) {
  return String(s ?? '').normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'd')
    .trim().toLowerCase().replace(/\s+/g, ' ');
}

function validate(body) {
  const id = String(body.id ?? '').trim();
  const titleVi = String(body.titleVi ?? '').trim();
  const titleEn = String(body.titleEn ?? '').trim();
  const latitude = Number(body.latitude);
  const longitude = Number(body.longitude);

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) ||
      !titleVi || !titleEn ||
      body.latitude == null || body.longitude == null ||
      !Number.isFinite(latitude) || !Number.isFinite(longitude) ||
      Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    throw Object.assign(new Error('Thông tin POI không hợp lệ'), { status: 400 });
  }
  return { id, titleVi, titleEn, latitude, longitude };
}

async function nearbyPOIs(client, poi) {
  const { rows } = await client.query(`
    SELECT landmark_id, title_vi, latitude, longitude
    FROM public.landmarks
    WHERE latitude IS NOT NULL AND longitude IS NOT NULL
  `);

  return rows.map(row => {
    const distance = distanceMeters(poi, {
      latitude: Number(row.latitude),
      longitude: Number(row.longitude)
    });
    const sameName = normalize(poi.titleVi) === normalize(row.title_vi);
    const status = distance <= 10 || (sameName && distance <= 30)
      ? 'DUPLICATE'
      : distance <= 100 ? 'NEARBY' : null;

    return {
      id: row.landmark_id,
      name: row.title_vi,
      distance: Math.round(distance),
      status
    };
  }).filter(x => x.status)
    .sort((a, b) => a.distance - b.distance);
}

export async function checkPOI(body) {
  const poi = validate(body);
  const client = await pool.connect();
  try {
    const nearby = await nearbyPOIs(client, poi);
    return {
      nearby,
      duplicate: nearby.some(x => x.status === 'DUPLICATE'),
      requiresConfirmation: nearby.some(x => x.status === 'NEARBY')
    };
  } finally {
    client.release();
  }
}

export async function createPOI(body, adminId) {
  const poi = validate(body);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Serialize concurrent POI creation/checks.
    await client.query('SELECT pg_advisory_xact_lock($1)', [20261123]);

    const nearby = await nearbyPOIs(client, poi);
    if (nearby.some(x => x.status === 'DUPLICATE')) {
      throw Object.assign(new Error('POI bị trùng'), {
        status: 409, nearby
      });
    }
    if (nearby.length && body.confirmNearby !== true) {
      throw Object.assign(new Error('Cần xác nhận POI gần'), {
        status: 409, nearby
      });
    }

    await client.query(`
      INSERT INTO public.landmarks
      (landmark_id, title_vi, title_en, subtitle_vi,
       subtitle_en, latitude, longitude)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
    `, [
      poi.id, poi.titleVi, poi.titleEn,
      String(body.subtitleVi ?? ''),
      String(body.subtitleEn ?? ''),
      poi.latitude, poi.longitude
    ]);

    await client.query(`
      INSERT INTO public.activity_logs
      (user_id, action_type, target_type, target_id, description)
      VALUES ($1, 'CREATE_LANDMARK', 'LANDMARK', $2, $3)
    `, [adminId, poi.id, `Thêm địa danh ${poi.titleVi}`]);

    await client.query('COMMIT');
    return { id: poi.id, nearby };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
