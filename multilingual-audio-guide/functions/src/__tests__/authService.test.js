import test from 'node:test'
import assert from 'node:assert/strict'
import { createInMemoryUserRepository } from '../services/userRepository.js'
import { hashPassword } from '../services/passwordService.js'
import { createTokenService } from '../services/tokenService.js'
import { createAuthService } from '../services/authService.js'
import { AUTH_ERROR_CODES } from '../../../shared/constants/auth.js'

const users = [
  { unfid: 'AD1', name: 'Admin One', userType: 'ADMIN', passwordHash: await hashPassword('pw-admin') },
  { unfid: 'MG1', name: 'Manager One', userType: 'MANAGER', passwordHash: await hashPassword('pw-mgr') },
]
const tokenService = createTokenService('test-secret')
const service = createAuthService({ userRepository: createInMemoryUserRepository(users), tokenService })

test('Admin đăng nhập thành công -> có 6 chức năng của Admin', async () => {
  const s = await service.login({ unfid: 'AD1', password: 'pw-admin' })
  assert.equal(s.user.userType, 'ADMIN')
  assert.equal(s.user.name, 'Admin One')
  assert.equal(s.features.length, 6)
  assert.ok(s.features.includes('BUS_LINE_MANAGEMENT'))
  assert.equal(tokenService.verify(s.token).sub, 'AD1')
})

test('Manager đăng nhập thành công -> chỉ có 3 chức năng', async () => {
  const s = await service.login({ unfid: 'MG1', password: 'pw-mgr' })
  assert.deepEqual(s.features, ['EDIT_PLACE_INFO', 'MANAGE_AUDIO', 'LOG_OFF'])
})

test('E1: UNFID không tồn tại', async () => {
  await assert.rejects(service.login({ unfid: 'NOPE', password: 'x' }), { code: AUTH_ERROR_CODES.UNFID_NOT_FOUND })
})

test('E2: sai mật khẩu', async () => {
  await assert.rejects(service.login({ unfid: 'AD1', password: 'wrong' }), { code: AUTH_ERROR_CODES.WRONG_PASSWORD })
})

test('Thiếu dữ liệu nhập -> INVALID_REQUEST', async () => {
  await assert.rejects(service.login({ unfid: '', password: '' }), { code: AUTH_ERROR_CODES.INVALID_REQUEST })
})

test('Token hết hạn hoặc bị sửa thì không hợp lệ', async () => {
  const s = await service.login({ unfid: 'AD1', password: 'pw-admin' })
  assert.equal(tokenService.verify(s.token, s.expiresAt + 1), null)
  assert.equal(tokenService.verify(s.token.slice(0, -2) + 'xx'), null)
})
