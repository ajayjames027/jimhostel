import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'crest.png'],
      manifest: {
        name: 'JIM Hostel Manager',
        short_name: 'JIM Hostel',
        description: 'JIM Hostel Administration and Student Portal',
        theme_color: '#4f46e5',
        background_color: '#f8fafc',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'crest.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'crest.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
