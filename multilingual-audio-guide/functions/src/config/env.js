const isProduction = process.env.NODE_ENV === 'production'

export const env = Object.freeze({
  isProduction,
  port: Number(process.env.PORT ?? process.env.DB_API_PORT ?? 5001),
  authSecret: process.env.AUTH_SECRET ?? 'dev-only-secret-change-me',
  db: {
    host: process.env.PGHOST ?? '127.0.0.1',
    port: Number(process.env.PGPORT ?? 5432),
    database: process.env.PGDATABASE ?? 'saigon_audio_guide',
    user: process.env.PGUSER ?? 'postgres', // Hoặc 'guide_app' nếu đã tạo user này trong pgAdmin
password: process.env.PGPASSWORD ?? 'Sgguidedistrict1',  }
})