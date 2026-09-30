import { API_ENDPOINTS } from '@shared/api/endpoints.js'
import { AUTH_ERROR_CODES } from '@shared/constants/auth.js'

// Để trống = gọi cùng origin (Vite proxy /api -> dev-api). Khi deploy thì đặt URL backend thật.
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export class ApiError extends Error {
  constructor(code, status) {
    super(code)
    this.code = code
    this.status = status
  }
}

async function request(path, options) {
  let res
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })
  } catch {
    throw new ApiError(AUTH_ERROR_CODES.INTERNAL_ERROR, 0) // không kết nối được server
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new ApiError(data?.error?.code ?? AUTH_ERROR_CODES.INTERNAL_ERROR, res.status)
  }
  return data
}

// UC8 - bước 1: gửi UNFID + Password, nhận { token, expiresAt, user, features }.
export function login({ unfid, password }) {
  return request(API_ENDPOINTS.AUTH_LOGIN, {
    method: 'POST',
    body: JSON.stringify({ unfid, password }),
  })
}
