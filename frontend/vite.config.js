import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      'Content-Type': 'video/mp4'
    }
  },
  assetsInclude: ['**/*.mp4', '**/*.mov']
})