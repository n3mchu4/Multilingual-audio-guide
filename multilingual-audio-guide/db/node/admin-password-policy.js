import bcrypt from 'bcryptjs';
import { pool } from './database.js';
import { isAdminPasswordExpired, validateAdminNewPassword } from '../../shared/utils/adminPasswordPolicy.js';

function authError(message, status = 400, code = 'INVALID_PASSWORD_CHANGE') {
  return Object.assign(new Error(message), { status, code });
}

export async function changeExpiredAdminPassword(userId, currentPassword, nextPassword, expectedChangedAt) {
  const inputError = validateAdminNewPassword(currentPassword, nextPassword);
  if (inputError) throw authError(inputError);
  const client = await pool.connect();
  let inTransaction = false;
  try {
    await client.query('BEGIN');
    inTransaction = true;
    const { rows } = await client.query(
      `SELECT role, is_active, password_hash, password_changed_at
         FROM public.users WHERE user_id=$1 FOR UPDATE`,
      [userId],
    );
    const user = rows[0];
    if (!user || user.role !== 'ADMIN' || !user.is_active) {
      throw authError('Tài khoản không hợp lệ.', 401, 'UNAUTHORIZED');
    }
    if (!isAdminPasswordExpired(user)) {
      throw authError('Yêu cầu đổi mật khẩu đã hết hiệu lực. Hãy đăng nhập lại.', 409, 'PASSWORD_ALREADY_CHANGED');
    }
    if (new Date(user.password_changed_at).getTime() !== expectedChangedAt) {
      throw authError('Mật khẩu đã được thay đổi. Hãy đăng nhập lại.', 409, 'PASSWORD_ALREADY_CHANGED');
    }
    if (!(await bcrypt.compare(currentPassword, user.password_hash))) {
      throw authError('Mật khẩu hiện tại không đúng.', 401, 'WRONG_PASSWORD');
    }
    if (await bcrypt.compare(nextPassword, user.password_hash)) {
      throw authError('Mật khẩu mới phải khác mật khẩu hiện tại.');
    }
    const nextHash = await bcrypt.hash(nextPassword, 12);
    await client.query(
      'UPDATE public.users SET password_hash=$1, password_changed_at=clock_timestamp() WHERE user_id=$2',
      [nextHash, userId],
    );
    await client.query(
      `INSERT INTO public.activity_logs(user_id, action_type, target_type, target_id, description)
       VALUES ($1, 'ADMIN_PASSWORD_CHANGE', 'USER', $2, 'Admin đổi mật khẩu bắt buộc sau 24 giờ')`,
      [userId, userId],
    );
    await client.query('COMMIT');
    inTransaction = false;
    return { ok: true };
  } catch (error) {
    if (inTransaction) await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
