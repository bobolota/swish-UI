import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // 👈 ON AJOUTE LE MOTEUR TAILWIND V4

export default defineConfig({
  plugins: [
    tailwindcss(), // 👈 ON L'ACTIVE ICI
    react()
  ],
  resolve: {
    // On garde notre sécurité anti-conflit de hooks !
    dedupe: ['react', 'react-dom']
  }
})