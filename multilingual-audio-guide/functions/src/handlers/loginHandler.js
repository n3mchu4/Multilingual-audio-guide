import { AUTH_ERROR_CODES } from '../../../shared/constants/auth.js'
import { AuthError } from '../services/authService.js'

// Handler không phụ thuộc framework: nhận body đã parse, trả { status, body }.
// Dùng được cho dev-server, Express, hoặc Firebase Cloud Functions (onRequest).
export function createLoginHandler(authService) {
  return async function loginHandler(body) {
    try {
      return { status: 200, body: await authService.login(body) }
    } catch (err) {
      if (err instanceof AuthError) {
        return { status: err.status, body: { error: { code: err.code, message: err.message } } }
      }
      console.error(err)
      return {
        status: 500,
        body: { error: { code: AUTH_ERROR_CODES.INTERNAL_ERROR, message: 'Internal error' } },
      }
    }
  }
}
