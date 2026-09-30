const isProduction = process.env.NODE_ENV === 'production'

export const env = Object.freeze({
  isProduction,
  port: Number(process.env.PORT ?? 5001),
  // Bắt buộc đặt AUTH_SECRET khi chạy thật. Giá trị mặc định chỉ để dev.
  authSecret: process.env.AUTH_SECRET ?? 'dev-only-secret-change-me',
})
