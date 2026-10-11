import { createServer } from 'node:http'
import pg from 'pg'
import { env } from './config/env.js'
import { createLoginHandler } from './handlers/loginHandler.js'
import { createAuthService } from './services/authService.js'
import { createTokenService } from './services/tokenService.js'
import { createDevUserRepository } from './services/userRepository.js'
import { AUTH_ERROR_CODES } from '../../shared/constants/auth.js'

if (env.isProduction) {
  throw new Error('The seeded development API server cannot run in production.')
}

// Khởi tạo pool kết nối Postgres từ env
const { Pool } = pg
const db = new Pool({
  host: process.env.PGHOST || env.db?.host || '127.0.0.1',
  port: Number(process.env.PGPORT || env.db?.port || 5432),
  database: process.env.PGDATABASE || env.db?.database || 'saigon_audio_guide',
  user: process.env.PGUSER || env.db?.user || 'postgres',
  password: process.env.PGPASSWORD || env.db?.password || 'Sgguidedistrict1',
})

const MAX_BODY_BYTES = 16 * 1024
const userRepository = await createDevUserRepository()
const authService = createAuthService({
  userRepository,
  tokenService: createTokenService(env.authSecret),
})
const handleLogin = createLoginHandler(authService)

function sendJson(response, status, body) {
  response.writeHead(status, { 
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  })
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
  if (request.method === 'OPTIONS') {
    response.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    })
    response.end()
    return
  }

  if (request.method === 'GET' && request.url === '/api/health') {
    sendJson(response, 200, { status: 'ok' })
    return
  }

  // API lấy danh sách địa danh từ PostgreSQL
  if (request.method === 'GET' && request.url.startsWith('/api/places')) {
    try {
      // Đổi 'landmarks' thành tên bảng lưu địa danh trong pgAdmin4 nếu khác
      const result = await db.query('SELECT * FROM landmarks') 
      sendJson(response, 200, { success: true, data: result.rows })
    } catch (error) {
      console.error('Lỗi DB:', error)
      sendJson(response, 500, { error: { code: 'DB_ERROR', message: error.message } })
    }
    return
  }

  if (request.method === 'POST' && request.url === '/api/auth/login') {
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
    return
  }

  sendJson(response, 404, { error: { code: 'NOT_FOUND', message: 'Not found' } })
})

server.listen(env.port, '0.0.0.0', () => {
  console.log(`Development auth API listening on http://0.0.0.0:${env.port}`)
})