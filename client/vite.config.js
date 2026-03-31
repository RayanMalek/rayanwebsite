import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // In dev: proxy /chat to local Express server
    proxy: {
      '/chat': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  // In production build: VITE_API_URL is injected by Vercel env vars
  // The frontend will call that URL directly instead of /chat
})
