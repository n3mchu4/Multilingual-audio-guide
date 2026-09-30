// Mã lỗi đăng nhập dùng chung cho backend và frontend (UC8: E1, E2).
export const AUTH_ERROR_CODES = Object.freeze({
  INVALID_REQUEST: 'INVALID_REQUEST', // thiếu UNFID hoặc Password
  UNFID_NOT_FOUND: 'UNFID_NOT_FOUND', // E1
  WRONG_PASSWORD: 'WRONG_PASSWORD', // E2
  SESSION_EXPIRED: 'SESSION_EXPIRED', // trigger: hết phiên do không hoạt động
  INTERNAL_ERROR: 'INTERNAL_ERROR',
})

// Phiên hết hạn sau 30 phút không hoạt động (Trigger của UC8).
export const SESSION_IDLE_TIMEOUT_MS = 30 * 60 * 1000
