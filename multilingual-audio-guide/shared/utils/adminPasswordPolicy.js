import { Buffer } from 'node:buffer';
export const ADMIN_PASSWORD_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export function isAdminPasswordExpired(user, now = Date.now()) {
  if (user?.role !== 'ADMIN') return false;
  const updatedAt = Date.parse(user.password_changed_at ?? '');
  return !Number.isFinite(updatedAt) || updatedAt > now || now - updatedAt >= ADMIN_PASSWORD_MAX_AGE_MS;
}

export function validateAdminNewPassword(currentPassword, nextPassword) {
  if (typeof currentPassword !== 'string' || !currentPassword) return 'Vui lòng nhập mật khẩu hiện tại.';
  if (typeof nextPassword !== 'string' || nextPassword.length < 10 || Buffer.byteLength(nextPassword, 'utf8') > 72) {
    return 'Mật khẩu mới cần ít nhất 10 ký tự và không vượt quá 72 byte UTF-8.';
  }
  if (currentPassword === nextPassword) return 'Mật khẩu mới phải khác mật khẩu hiện tại.';
  return null;
}

// main