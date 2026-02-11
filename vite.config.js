import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg', 'tarbiyyat-lughah.png'],
      manifest: {
        name: 'Tarbiyyat-Lughah',
        short_name: 'Tarbiyyat',
        description: 'Platform Pembelajaran Bahasa Arab Interaktif',
        theme_color: '#0d9488', // teal-600
        background_color: '#fcfbf9',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'tarbiyyat-lughah.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'tarbiyyat-lughah.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'tarbiyyat-lughah.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
