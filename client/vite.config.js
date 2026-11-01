import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',   // 프론트엔드(React)에서 보내는 요청 중 URL이 /api로 시작하는 모든 요청을 프록시 서버가 낚아채서 백엔드 서버 주소로 대리 전송함
        changeOrigin: true,                // 출처 불일치 오류를 해결해줌
      },
    },
  }
})



