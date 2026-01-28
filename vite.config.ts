import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/ksp-itm-web/',
  server: {
    // 모든 요청을 index.html로 리다이렉트하여 React Router가 처리하도록 함
    fallback: true,
  },
})
