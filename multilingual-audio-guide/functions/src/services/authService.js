import { AUTH_ERROR_CODES, SESSION_IDLE_TIMEOUT_MS } from '../../../shared/constants/auth.js'
import { getFeaturesForUserType } from '../../../shared/constants/roles.js'
import { validateLoginInput } from '../../../shared/utils/validateLogin.js'
import { verifyPassword } from './passwordService.js'

export class AuthError extends Error {
  constructor(code, status, message) {
    super(message)
    this.code = code
    this.status = status
  }
}

export function createAuthService({ userRepository, tokenService, sessionTtlMs = SESSION_IDLE_TIMEOUT_MS, now = Date.now }) {
  return {
    // UC8 - bước 2: lấy tên + User Type theo UNFID/Password và bắt đầu Session.
    async login(input) {
      const { valid, value } = validateLoginInput(input)
      if (!valid) {
        throw new AuthError(AUTH_ERROR_CODES.INVALID_REQUEST, 400, 'UNFID and password are required')
      }

      const user = await userRepository.findByUnfid(value.unfid)
      // E1: không tìm thấy UNFID
      if (!user) {
        throw new AuthError(AUTH_ERROR_CODES.UNFID_NOT_FOUND, 401, 'UNFID not found')
      }
      // E2: UNFID có nhưng sai mật khẩu
      if (!(await verifyPassword(value.password, user.passwordHash))) {
        throw new AuthError(AUTH_ERROR_CODES.WRONG_PASSWORD, 401, 'Incorrect password')
      }

      const expiresAt = now() + sessionTtlMs
      const token = tokenService.sign({ sub: user.unfid, userType: user.userType, exp: expiresAt })
      return {
        token,
        expiresAt,
        user: { unfid: user.unfid, name: user.name, userType: user.userType },
        // bước 3: chức năng hiển thị phụ thuộc User Type
        features: getFeaturesForUserType(user.userType),
      }
    },
  }
}
