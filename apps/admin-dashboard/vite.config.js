import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    // C'est cette ligne qui fait la magie du Monorepo
    dedupe: ['react', 'react-dom']
  }
})