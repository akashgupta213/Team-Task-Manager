import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'https://team-task-manager-production-a371.up.railway.app/'
    }
  }
})
