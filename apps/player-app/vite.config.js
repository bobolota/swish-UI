import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // 👇 AJOUTE CE BLOC 👇
    dedupe: [
      'react',
      'react-dom',
      'react-router-dom'
    ]
  }
})