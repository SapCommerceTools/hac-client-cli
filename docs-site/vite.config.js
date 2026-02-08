import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/hac-client-cli/',
  plugins: [react()],
  assetsInclude: ['**/*.md'],
})

