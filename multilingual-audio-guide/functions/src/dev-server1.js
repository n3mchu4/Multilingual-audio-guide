// Server dev tối giản (chỉ dùng module có sẵn của Node) để chạy UC8 khi chưa có database.
// Chạy: npm run dev:api
import { createServer } from 'node:http'
import { env } from './config/env.js'
import { API_ENDPOINTS } from '../../shared/api/endpoints.js'
import { createDevUserRepository } from './services/userRepository.js'
import { createTokenService } from './services/tokenService.js'
import { createAuthService } from './services/authService.js'
import { createLoginHandler } from './handlers/loginHandler.js'

if (env.isProduction) {
  throw new Error('dev-server chỉ dùng cho môi trường dev (dùng dữ liệu seed trong bộ nhớ).')
}

const authService = createAuthService({
  userRepository: await createDevUserRepository(),
  tokenService: createTokenService(env.authSecret),
})
const loginHandler = createLoginHandler(authService)

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', (chunk) => {
      raw += chunk
      if (raw.length > 10_000) reject(new Error('Payload too large'))
    })
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {})
      } catch {
        reject(new Error('Invalid JSON'))
      }
    })
  })
}

const send = (res, status, body) => {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(body))
}

createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost')
  if (req.method === 'GET' && pathname === API_ENDPOINTS.HEALTH) return send(res, 200, { ok: true })
  if (req.method === 'POST' && pathname === API_ENDPOINTS.AUTH_LOGIN) {
    try {
      const { status, body } = await loginHandler(await readJson(req))
      return send(res, status, body)
    } catch (err) {
      return send(res, 400, { error: { code: 'INVALID_REQUEST', message: err.message } })
    }
  }
  send(res, 404, { error: { code: 'NOT_FOUND', message: 'Not found' } })
}).listen(env.port, () => {
  console.log(`[dev-api] http://localhost:${env.port}`)
  console.log('[dev-api] Tài khoản dev: ADMIN001 / Admin@123  |  MANAGER001 / Manager@123')
})
