import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const rzpKey = env.RAZORPAY_KEY_ID
  const rzpSecret = env.RAZORPAY_KEY_SECRET
  const basicAuth = `Basic ${Buffer.from(`${rzpKey}:${rzpSecret}`).toString('base64')}`

  return {
    plugins: [react(), tailwindcss()],
    server: {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
      proxy: {
        '/api/razorpay': {
          target: 'https://api.razorpay.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/razorpay/, ''),
          headers: {
            Authorization: basicAuth,
          },
        },
      },
    },
  }
})
