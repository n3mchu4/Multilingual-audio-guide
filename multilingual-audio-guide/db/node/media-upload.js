import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { MEDIA_LIMITS, validateMediaFile } from '../../shared/media.js';

const failure = (message, status) => Object.assign(new Error(message), { status });

function matchesSignature(data, extension) {
  const ascii = (start, end) => data.toString('ascii', start, end);
  switch (extension) {
    case 'jpg': case 'jpeg': return data[0] === 255 && data[1] === 216 && data[2] === 255;
    case 'png': return data.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
    case 'webp': return ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP';
    case 'wav': return ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WAVE';
    case 'ogg': return ascii(0, 4) === 'OggS';
    case 'm4a': return ascii(4, 8) === 'ftyp' && ['M4A ', 'M4B ', 'isom', 'mp42'].includes(ascii(8, 12));
    case 'mp3': return ascii(0, 3) === 'ID3' || (data[0] === 255 && (data[1] & 0xe0) === 0xe0 && (data[1] & 6) !== 0);
    default: return false;
  }
}

// Kept independent of PostgreSQL so bounded reads and storage failures can be tested.
export async function receiveMedia(req, { kind, filename, landmarkId }, {
  root, env = process.env, fetchImpl = fetch,
} = {}) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(landmarkId ?? '')) {
    throw failure('Tài khoản chưa được phân công địa danh.', 403);
  }
  if (!MEDIA_LIMITS[kind]) throw failure('Loại tệp không hợp lệ.', 400);
  const declared = Number(req.headers['content-length']);
  if (Number.isFinite(declared) && declared > MEDIA_LIMITS[kind]) {
    throw failure('Tệp vượt quá dung lượng cho phép.', 413);
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of req.iterator({ destroyOnReturn: false })) {
    size += chunk.length;
    if (size > MEDIA_LIMITS[kind]) throw failure('Tệp vượt quá dung lượng cho phép.', 413);
    chunks.push(chunk);
  }
  let metadata;
  try { metadata = validateMediaFile(kind, filename, size, req.headers['content-type']?.split(';')[0]); }
  catch (error) { throw failure(error.message, 400); }
  const body = Buffer.concat(chunks);
  if (!matchesSignature(body, metadata.extension)) throw failure('Nội dung tệp không đúng định dạng đã chọn.', 415);
  const folder = kind === 'image' ? 'images' : 'audio';
  const object = `${landmarkId}/${randomUUID()}.${metadata.extension}`;
  const key = `${folder}/${object}`;
  const mode = env.STORAGE_MODE ?? 'local';
  if (mode === 'local') {
    const base = env.STORAGE_PUBLIC_BASE_URL?.replace(/\/+$/, '');
    if (!base || !/^https?:\/\//.test(base)) throw failure('Chưa cấu hình địa chỉ media local.', 503);
    try {
      await mkdir(path.join(root, folder, landmarkId), { recursive: true });
      await writeFile(path.join(root, key), body, { flag: 'wx' });
    } catch { throw failure('Không lưu được tệp local. Kiểm tra quyền ghi và dung lượng máy chủ.', 503); }
    return { url: `${base}/${key}`, key, size, contentType: metadata.contentType };
  }
  if (mode !== 'cloud') throw failure('STORAGE_MODE không hợp lệ.', 503);
  const base = env.SUPABASE_URL?.replace(/\/+$/, '');
  const secret = env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = (kind === 'image' ? env.SUPABASE_IMAGE_BUCKET : env.SUPABASE_AUDIO_BUCKET) || (kind === 'image' ? 'image' : 'audio');
  if (!base || !/^https:\/\/[a-z0-9.-]+(?::\d+)?$/i.test(base) || !secret || !/^[a-zA-Z0-9_-]+$/.test(bucket)) {
    throw failure('Chưa cấu hình Supabase Storage trên máy chủ.', 503);
  }
  let response;
  try {
    response = await fetchImpl(`${base}/storage/v1/object/${bucket}/${object}`, {
      method: 'POST', body,
      headers: { apikey: secret, Authorization: `Bearer ${secret}`, 'Content-Type': metadata.contentType, 'x-upsert': 'false' },
      signal: AbortSignal.timeout(120000),
    });
    await response.arrayBuffer();
  } catch { throw failure('Không kết nối được Storage. Hãy thử upload lại.', 502); }
  if (!response.ok) throw failure('Storage từ chối upload. Kiểm tra bucket, dung lượng và cấu hình máy chủ rồi thử lại.', 502);
  return { url: `${base}/storage/v1/object/public/${bucket}/${object}`, key: `${bucket}/${object}`, size, contentType: metadata.contentType };
}
