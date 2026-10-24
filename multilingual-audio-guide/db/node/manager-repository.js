import { pool, query } from './database.js';

function invalid(message) {
  throw Object.assign(new Error(message), { status: 400 });
}

function requiredText(value, label) {
  if (typeof value !== 'string' || !value.trim()) invalid(`${label} không được để trống.`);
  return value.trim();
}

function editableText(value, label) {
  if (typeof value !== 'string') invalid(`${label} không hợp lệ.`);
  return value.trim();
}

function hasControlCharacter(value) {
  return [...value].some((character) => {
    const code = character.charCodeAt(0);
    return code < 32 || (code >= 127 && code <= 159);
  });
}

function optionalText(value, label) {
  if (value == null || value === '') return null;
  if (typeof value !== 'string' || value.length > 2048 || hasControlCharacter(value)) {
    invalid(`${label} không hợp lệ.`);
  }
  return value.trim() || null;
}

function coordinate(value, label, min, max) {
  if (value == null || (typeof value === 'string' && !value.trim())) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    invalid(`${label} phải nằm trong khoảng ${min} đến ${max}.`);
  }
  return parsed;
}

function proposalValues(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    invalid('Nội dung đề xuất không hợp lệ.');
  }
  const latitude = coordinate(input.latitude, 'Vĩ độ', -90, 90);
  const longitude = coordinate(input.longitude, 'Kinh độ', -180, 180);
  if ((latitude == null) !== (longitude == null)) {
    invalid('Cần nhập cả vĩ độ và kinh độ.');
  }
  const gallery = input.gallery;
  if (!Array.isArray(gallery) || gallery.length > 20) {
    invalid('Thư viện ảnh tối đa 20 đường dẫn.');
  }

  return {
    titleVi: requiredText(input.titleVi, 'Tên tiếng Việt'),
    titleEn: requiredText(input.titleEn, 'Tên tiếng Anh'),
    subtitleVi: editableText(input.subtitleVi, 'Mô tả ngắn tiếng Việt'),
    subtitleEn: editableText(input.subtitleEn, 'Mô tả ngắn tiếng Anh'),
    latitude,
    longitude,
    backgroundImageUrl: optionalText(input.backgroundImageUrl, 'Ảnh bìa'),
    descriptionVi: editableText(input.descriptionVi, 'Mô tả chi tiết tiếng Việt'),
    descriptionEn: editableText(input.descriptionEn, 'Mô tả chi tiết tiếng Anh'),
    transcriptVi: editableText(input.transcriptVi, 'Lời thuyết minh tiếng Việt'),
    transcriptEn: editableText(input.transcriptEn, 'Lời thuyết minh tiếng Anh'),
    audioViUrl: optionalText(input.audioViUrl, 'Âm thanh tiếng Việt'),
    audioEnUrl: optionalText(input.audioEnUrl, 'Âm thanh tiếng Anh'),
    gallery: [...new Set(gallery.map((image) => requiredText(image, 'Ảnh thư viện')))],
  };
}

function mapLandmark(row, gallery) {
  return {
    id: row.landmark_id,
    name: row.title_vi,
    titleVi: row.title_vi,
    titleEn: row.title_en,
    subtitleVi: row.subtitle_vi,
    subtitleEn: row.subtitle_en,
    latitude: row.latitude == null ? '' : String(row.latitude),
    longitude: row.longitude == null ? '' : String(row.longitude),
    backgroundImageUrl: row.background_image_url ?? '',
    descriptionVi: row.description_vi,
    descriptionEn: row.description_en,
    transcriptVi: row.transcript_vi,
    transcriptEn: row.transcript_en,
    audioViUrl: row.audio_vi_url ?? '',
    audioEnUrl: row.audio_en_url ?? '',
    gallery,
  };
}

export async function getManagerWorkspace(managerId) {
  const { rows } = await query(`SELECT u.username, l.*
    FROM public.users u
    JOIN public.landmarks l ON l.landmark_id = u.landmark_id
    WHERE u.user_id = $1 AND u.role = 'MANAGER' AND u.is_active`,
  [managerId]);
  if (!rows.length) {
    throw Object.assign(new Error('Tài khoản Manager không còn được phân công địa danh.'), { status: 403 });
  }

  const landmark = rows[0];
  const [imagesResult, proposalsResult, pendingResult] = await Promise.all([
    query(`SELECT image_url FROM public.landmark_images
      WHERE landmark_id = $1 ORDER BY sort_order, image_id`, [landmark.landmark_id]),
    query(`SELECT proposal_id, status, submitted_at, reviewed_at, review_note
      FROM public.proposals WHERE landmark_id = $1 AND manager_id = $2
      ORDER BY submitted_at DESC LIMIT 20`, [landmark.landmark_id, managerId]),
    query(`SELECT 1 FROM public.proposals WHERE landmark_id = $1 AND status = 'PENDING' LIMIT 1`,
      [landmark.landmark_id]),
  ]);
  const history = proposalsResult.rows.map((proposal) => ({
    id: proposal.proposal_id,
    status: proposal.status,
    submittedAt: proposal.submitted_at,
    reviewedAt: proposal.reviewed_at,
    reviewNote: proposal.review_note ?? '',
  }));

  return {
    managerName: landmark.username,
    landmarkName: landmark.title_vi,
    current: mapLandmark(landmark, imagesResult.rows.map((image) => image.image_url)),
    pending: pendingResult.rowCount > 0,
    history,
  };
}

export async function submitManagerProposal(managerId, input) {
  const client = await pool.connect();
  let transactionOpen = false;
  try {
    await client.query('BEGIN');
    transactionOpen = true;

    const managerResult = await client.query(`SELECT user_id, landmark_id
      FROM public.users WHERE user_id = $1 AND role = 'MANAGER' AND is_active FOR SHARE`,
    [managerId]);
    if (!managerResult.rowCount) {
      throw Object.assign(new Error('Tài khoản Manager không hoạt động.'), { status: 403 });
    }
    const landmarkId = managerResult.rows[0].landmark_id;
    const landmarkResult = await client.query(
      'SELECT * FROM public.landmarks WHERE landmark_id = $1 FOR UPDATE',
      [landmarkId],
    );
    if (!landmarkResult.rowCount) {
      throw Object.assign(new Error('Không tìm thấy địa danh được phân công.'), { status: 404 });
    }
    const pending = await client.query(`SELECT 1 FROM public.proposals
      WHERE landmark_id = $1 AND status = 'PENDING' LIMIT 1`, [landmarkId]);
    if (pending.rowCount) {
      throw Object.assign(new Error('Địa danh đã có đề xuất đang chờ Admin duyệt.'), { status: 409 });
    }

    const values = proposalValues(input);
    const current = landmarkResult.rows[0];
    if ((values.transcriptVi !== current.transcript_vi
      || values.transcriptEn !== current.transcript_en)
      && (!values.audioViUrl || !values.audioEnUrl)) {
      invalid('Khi đổi lời thuyết minh, cần cung cấp cả đường dẫn âm thanh tiếng Việt và tiếng Anh.');
    }

    const inserted = await client.query(`INSERT INTO public.proposals (
        manager_id, landmark_id, proposed_title_vi, proposed_title_en,
        proposed_subtitle_vi, proposed_subtitle_en, proposed_latitude, proposed_longitude,
        proposed_background_image_url, proposed_description_vi, proposed_description_en,
        proposed_transcript_vi, proposed_transcript_en, proposed_audio_vi_url, proposed_audio_en_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING proposal_id, submitted_at`,
    [
      managerId, landmarkId, values.titleVi, values.titleEn,
      values.subtitleVi, values.subtitleEn, values.latitude, values.longitude,
      values.backgroundImageUrl, values.descriptionVi, values.descriptionEn,
      values.transcriptVi, values.transcriptEn, values.audioViUrl, values.audioEnUrl,
    ]);
    const proposal = inserted.rows[0];
    await client.query(`INSERT INTO public.proposal_images(proposal_id, image_url, sort_order)
      SELECT $1, image_url, ordinal::integer - 1
      FROM unnest($2::text[]) WITH ORDINALITY AS gallery(image_url, ordinal)`,
    [proposal.proposal_id, values.gallery]);
    await client.query(`INSERT INTO public.activity_logs(user_id, action_type, target_type, target_id, description)
      VALUES ($1, 'SUBMIT_PROPOSAL', 'PROPOSAL', $2, $3)`,
    [managerId, proposal.proposal_id, `Manager gửi đề xuất cập nhật ${values.titleVi}.`]);

    await client.query('COMMIT');
    transactionOpen = false;
    return { id: proposal.proposal_id, submittedAt: proposal.submitted_at };
  } catch (error) {
    if (transactionOpen) await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
