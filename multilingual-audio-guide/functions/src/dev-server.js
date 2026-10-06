import { createServer } from 'node:http'
import { env } from './config/env.js'
import { createLoginHandler } from './handlers/loginHandler.js'
import { createAuthService } from './services/authService.js'
import { createTokenService } from './services/tokenService.js'
import { createDevUserRepository } from './services/userRepository.js'
import { AUTH_ERROR_CODES } from '../../shared/constants/auth.js'

if (env.isProduction) {
  throw new Error('The seeded development API server cannot run in production.')
}

const MAX_BODY_BYTES = 16 * 1024
const userRepository = await createDevUserRepository()
const authService = createAuthService({
  userRepository,
  tokenService: createTokenService(env.authSecret),
})
const handleLogin = createLoginHandler(authService)

function sendJson(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
  response.end(JSON.stringify(body))
}

async function readJsonBody(request) {
  const chunks = []
  let size = 0

  for await (const chunk of request) {
    size += chunk.length
    if (size <= MAX_BODY_BYTES) chunks.push(chunk)
  }

  if (size > MAX_BODY_BYTES) return { tooLarge: true }

  try {
    return { body: JSON.parse(Buffer.concat(chunks).toString('utf8')) }
  } catch {
    return { invalid: true }
  }
}

const server = createServer(async (request, response) => {
  if (request.method === 'GET' && request.url === '/api/health') {
    sendJson(response, 200, { status: 'ok' })
    return
  }

  if (request.method !== 'POST' || request.url !== '/api/auth/login') {
    sendJson(response, 404, { error: { code: 'NOT_FOUND', message: 'Not found' } })
    return
  }

  const parsed = await readJsonBody(request)
  if (parsed.tooLarge) {
    sendJson(response, 413, { error: { code: AUTH_ERROR_CODES.INVALID_REQUEST, message: 'Request body too large' } })
    return
  }
  if (parsed.invalid) {
    sendJson(response, 400, { error: { code: AUTH_ERROR_CODES.INVALID_REQUEST, message: 'Invalid JSON body' } })
    return
  }

  const result = await handleLogin(parsed.body)
  sendJson(response, result.status, result.body)
})

server.listen(env.port, '127.0.0.1', () => {
  console.log(`Development auth API listening on http://127.0.0.1:${env.port}`)
})