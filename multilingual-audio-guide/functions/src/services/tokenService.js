import { createHmac, timingSafeEqual } from 'node:crypto'

const b64 = (input) => Buffer.from(input).toString('base64url')
const sign = (data, secret) => createHmac('sha256', secret).update(data).digest('base64url')

// Token ký HMAC-SHA256 (dạng "payload.signature"), có hạn dùng `exp` (ms epoch).
export function createTokenService(secret) {
  return {
    sign(payload) {
      const body = b64(JSON.stringify(payload))
      return `${body}.${sign(body, secret)}`
    },
    verify(token, now = Date.now()) {
      const [body, signature] = String(token).split('.')
      if (!body || !signature) return null
      const expected = Buffer.from(sign(body, secret))
      const actual = Buffer.from(signature)
      if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null
      const payload = JSON.parse(Buffer.from(body, 'base64url').toString())
      return payload.exp > now ? payload : null
    },
  }
}
