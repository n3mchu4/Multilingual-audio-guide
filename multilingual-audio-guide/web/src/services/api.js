import { API_ENDPOINTS } from '@shared/api/endpoints.js'
import { AUTH_ERROR_CODES } from '@shared/constants/auth.js'
import { useAppStore } from '../store/useAppStore'

// Để trống = gọi cùng origin (Vite proxy /api -> dev-api). Khi deploy thì đặt URL backend thật.
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export class ApiError extends Error {
  constructor(message, status, code = message) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
  }
}

async function request(path, options = {}, authenticated = false) {
  let res
  try {
    const token = authenticated ? useAppStore.getState().session?.token : null
    res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
  } catch {
    throw new ApiError(AUTH_ERROR_CODES.INTERNAL_ERROR, 0) // không kết nối được server
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const code = data?.error?.code ?? AUTH_ERROR_CODES.INTERNAL_ERROR
    const message = data?.error?.message ?? data?.error ?? code
    throw new ApiError(message, res.status, code)
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

export function adminRequest(path, options = {}) {
  return request(path, options, true)
}

export function managerRequest(path, options = {}) {
  return request(path, options, true)
}
