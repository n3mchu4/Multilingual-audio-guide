import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'
import os from 'node:os'
import qrcode from 'qrcode-terminal'

function getNetworkIp() {
  let interfaces
  try { interfaces = os.networkInterfaces() }
  catch { return 'localhost' }
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address
      }
    }
  }
  return 'localhost'
}

function terminalQrPlugin() {
  return {
    name: 'terminal-qr-code',
    configureServer(server) {
      server.httpServer?.once('listening', () => {
        setTimeout(() => {
          const address = server.httpServer?.address()
          const port = typeof address === 'object' && address ? address.port : 5173
          const networkIp = getNetworkIp()
          const localUrl = `http://localhost:${port}/`
          const networkUrl = `http://${networkIp}:${port}/`

          console.log('\n' + '─'.repeat(54))
          console.log('📱 SAIGON AUDIO GUIDE - SẴN SÀNG KẾT NỐI MẠNG LAN')
          console.log(`➜ Local:   ${localUrl}`)
          console.log(`➜ Network: ${networkUrl}`)
          console.log('➜ Quét mã QR bằng camera điện thoại để vào app:')
          try {
            qrcode.generate(networkUrl, { small: true }, (code) => {
              console.log(code)
            })
          } catch (e) {
            console.log('Không thể tạo mã QR trên console:', e.message)
          }
          console.log('─'.repeat(54) + '\n')
        }, 150)
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), terminalQrPlugin()],
  resolve: {
    alias: { '@shared': fileURLToPath(new URL('../shared', import.meta.url)) },
  },
  server: {
<<<<<<< HEAD
    host: true,
    fs: { allow: ['..'] }, // cho phép import thư mục shared/ nằm ngoài web/
=======
    host: true, // Lắng nghe trên mọi IP mạng nội bộ (0.0.0.0)
    fs: { allow: ['..'] }, // Cho phép import thư mục shared/ nằm ngoài web/
>>>>>>> a9ca8904cec0bd6c3a475a6a60af27a50283c4f4
    proxy: {
      '/api': 'http://127.0.0.1:3002',
      '/media': 'http://127.0.0.1:3002',
    },
  },
})
