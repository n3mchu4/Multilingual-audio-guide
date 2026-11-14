import bcrypt from 'bcryptjs';
import { query } from './database.js';
import { getAnalyticsData } from './analytics-service.js';

const formatDate = (value) =>
  new Date(value).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

function mapVersion(row, prefix = '') {
  const field = (name) => row[`${prefix}${name}`];
  const latitude = field('latitude');
  const longitude = field('longitude');
  return {
    heroTitle: field('title_vi'),
    heroSub: field('subtitle_vi'),
    coords: latitude == null ? '' : `${latitude}° N, ${longitude}° E`,
    address: field('subtitle_vi'),
    bgImg: field('background_image_url') ?? '',
    gallery: row.gallery ?? [],
    descVi: field('transcript_vi') ?? '',
    descEn: field('transcript_en') ?? '',
    audioVi: field('audio_vi_url') ?? '',
    audioEn: field('audio_en_url') ?? '',
  };
}

export async function getAdminBootstrap() {
  const [landmarksResult, imagesResult, proposalsResult, proposalImagesResult, usersResult, logsResult] =
    await Promise.all([
      query('SELECT * FROM public.landmarks ORDER BY landmark_id'),
      query('SELECT landmark_id, image_url FROM public.landmark_images ORDER BY sort_order, image_id'),
     
      query(`SELECT p.*, u.username
        FROM public.proposals p
        JOIN public.users u ON u.user_id = p.manager_id
        WHERE p.status = 'PENDING'
        ORDER BY p.submitted_at DESC`),
      query(`SELECT proposal_id, image_url
        FROM public.proposal_images
        ORDER BY sort_order, proposal_image_id`),
      query(`SELECT u.user_id, u.username, u.role, u.is_active, u.is_super_admin,
          u.landmark_id, u.created_at, l.title_vi
        FROM public.users u
        LEFT JOIN public.landmarks l ON l.landmark_id = u.landmark_id
        ORDER BY u.created_at, u.username`),
      query(`SELECT action_type, description, created_at
        FROM public.activity_logs ORDER BY created_at DESC LIMIT 100`),
    ]);

  const imagesByLandmark = new Map();
  for (const image of imagesResult.rows) {
    const images = imagesByLandmark.get(image.landmark_id) ?? [];
    images.push(image.image_url);
    imagesByLandmark.set(image.landmark_id, images);
  }

  

  const imagesByProposal = new Map();
  for (const image of proposalImagesResult.rows) {
    const images = imagesByProposal.get(image.proposal_id) ?? [];
    images.push(image.image_url);
    imagesByProposal.set(image.proposal_id, images);
  }

  const pendingByLandmark = new Map();
  for (const proposal of proposalsResult.rows) {
    if (!pendingByLandmark.has(proposal.landmark_id)) {
      pendingByLandmark.set(proposal.landmark_id, proposal);
    }
  }

  const places = landmarksResult.rows.map((landmark) => {
    const gallery = imagesByLandmark.get(landmark.landmark_id) ?? [];
    const current = mapVersion({ ...landmark, gallery });
    const proposal = pendingByLandmark.get(landmark.landmark_id);
    const request = proposal
      ? {
          proposalId: proposal.proposal_id,
          manager: proposal.username,
          date: formatDate(proposal.submitted_at),
          ...mapVersion({
            ...proposal,
            gallery: imagesByProposal.get(proposal.proposal_id) ?? [],
          }, 'proposed_'),
        }
      : null;
    return {
      id: landmark.landmark_id,
      name: landmark.title_vi,
      district: landmark.subtitle_vi,
      content: landmark.description_vi,
      buses: [],
      request,
      current,
    };
  });

  const accounts = usersResult.rows.map((user) => ({
    id: user.user_id,
    name: user.role === 'ADMIN' ? 'Quản trị viên hệ thống' : `Ban quản lý ${user.title_vi}`,
    username: user.username,
    role: user.role === 'ADMIN' ? 'Admin' : 'Manager',
    date: formatDate(user.created_at),
    active: user.is_active,
    locked: user.is_super_admin,
    placeName: user.title_vi ?? '',
    landmarkId: user.landmark_id,
  }));

  const activities = logsResult.rows.map((log) => ({
    icon: log.action_type.includes('PROPOSAL') ? '↻' : log.action_type.includes('BUS') ? '▤' : '✎',
    text: log.description || log.action_type,
    time: new Date(log.created_at).toLocaleString('vi-VN'),
  }));

  return {
    places,
    accounts,
    activities,
    analytics: await getAnalyticsData(),
  };
}

export async function createManagerAccount({ username, password, landmarkId }) {
  const normalizedUsername = String(username ?? '').trim().toLowerCase();
  const normalizedPassword = String(password ?? '');
  if (!/^[a-z0-9._-]{3,80}$/.test(normalizedUsername)) {
    throw new Error('Tên đăng nhập phải có 3-80 ký tự chữ thường, số, dấu chấm, gạch ngang hoặc gạch dưới.');
  }
  if (normalizedPassword.length < 10 || Buffer.byteLength(normalizedPassword, 'utf8') > 72) {
    throw new Error('Mật khẩu phải có ít nhất 10 ký tự và tối đa 72 byte UTF-8.');
  }
  const passwordHash = await bcrypt.hash(normalizedPassword, 12);
  const { rows } = await query(`INSERT INTO public.users
    (username, password_hash, role, landmark_id)
    VALUES ($1, $2, 'MANAGER', $3)
    RETURNING user_id`, [normalizedUsername, passwordHash, landmarkId]);
  await query(`INSERT INTO public.activity_logs(user_id, action_type, target_type, target_id, description)
    VALUES ($1, 'CREATE_MANAGER', 'USER', $2, $3)`,
  [null, rows[0].user_id, `Tạo tài khoản Manager “${normalizedUsername}”.`]);
}

export async function updateManagerAccount(id, { username, landmarkId, password }) {
  const normalizedUsername = String(username ?? '').trim().toLowerCase();
  const normalizedPassword = password == null ? '' : String(password);
  if (!/^[a-z0-9._-]{3,80}$/.test(normalizedUsername)) {
    throw new Error('Tên đăng nhập không hợp lệ.');
  }
  if (normalizedPassword && (
    normalizedPassword.length < 10
    || Buffer.byteLength(normalizedPassword, 'utf8') > 72
  )) {
    throw new Error('Mật khẩu mới phải có ít nhất 10 ký tự và tối đa 72 byte UTF-8.');
  }
  const passwordHash = normalizedPassword
    ? await bcrypt.hash(normalizedPassword, 12)
    : null;
  const { rowCount } = await query(`UPDATE public.users
    SET username = $1, landmark_id = $2, password_hash = COALESCE($3, password_hash)
    WHERE user_id = $4 AND role = 'MANAGER'`,
  [normalizedUsername, landmarkId, passwordHash, id]);
  if (!rowCount) throw new Error('Không tìm thấy tài khoản Manager.');
}

export async function setManagerStatus(id, active) {
  const { rowCount } = await query(`UPDATE public.users
    SET is_active = $1
    WHERE user_id = $2 AND role = 'MANAGER'`,
  [active, id]);
  if (!rowCount) throw new Error('Không tìm thấy tài khoản Manager.');
}

export async function updateLandmark(id, { name, district, content }) {
  const normalizedName = String(name ?? '').trim();
  const { rowCount } = await query(`UPDATE public.landmarks
    SET title_vi = $1, subtitle_vi = $2, description_vi = $3
    WHERE landmark_id = $4`,
  [normalizedName, String(district ?? '').trim(), String(content ?? '').trim(), id]);
  if (!rowCount) throw new Error('Không tìm thấy địa danh.');
}


export async function reviewLatestProposal(landmarkId, proposalId, adminId, accepted) {
  const { rows } = await query(`SELECT proposal_id FROM public.proposals
    WHERE landmark_id = $1 AND proposal_id = $2 AND status = 'PENDING'`,
  [landmarkId, proposalId]);
  if (!rows.length) throw new Error('Yêu cầu không tồn tại hoặc đã được xử lý.');
  await query('SELECT public.review_proposal($1, $2, $3, NULL)', [proposalId, adminId, accepted]);
}
