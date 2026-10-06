import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@shared': fileURLToPath(new URL('../shared', import.meta.url)) },
  },
  server: {
    fs: { allow: ['..'] }, // cho phép import thư mục shared/ nằm ngoài web/
    proxy: { '/api': 'http://127.0.0.1:5001' }, // dev-api (functions/src/dev-server.js)
  },
})
