import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/web/',  // 웹 대시보드 경로
  server: {
    proxy: {
      '/api': {
        target: 'http://ceprj2.gachon.ac.kr:65027',
        changeOrigin: true,
      }
    }
  }
})
