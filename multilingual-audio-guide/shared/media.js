// Shared allowlist. The server also checks signatures; browser MIME is not trusted.
export const MEDIA_LIMITS = { image: 5 * 1024 * 1024, audio: 20 * 1024 * 1024 };
export const MEDIA_TYPES = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp',
  mp3: 'audio/mpeg', m4a: 'audio/mp4', ogg: 'audio/ogg', wav: 'audio/wav',
};
export function validateMediaFile(kind, name, size, mime = '') {
  const extension = String(name).split('.').pop().toLowerCase();
  const contentType = MEDIA_TYPES[extension];
  if (!MEDIA_LIMITS[kind] || !contentType?.startsWith(`${kind}/`)) {
    throw new Error('Chỉ nhận ảnh JPG, PNG, WebP hoặc audio MP3, M4A, OGG, WAV đúng loại đã chọn.');
  }
  if (!Number.isSafeInteger(size) || size <= 0 || size > MEDIA_LIMITS[kind]) {
    throw new Error(`Tệp phải lớn hơn 0 và không quá ${MEDIA_LIMITS[kind] / 1024 / 1024} MiB.`);
  }
  const aliases = { 'audio/x-wav': 'audio/wav', 'audio/wave': 'audio/wav', 'audio/x-m4a': 'audio/mp4' };
  if (mime && mime !== 'application/octet-stream' && (aliases[mime] ?? mime) !== contentType) {
    throw new Error('Loại nội dung không khớp đuôi tệp.');
  }
  return { extension, contentType };
}
