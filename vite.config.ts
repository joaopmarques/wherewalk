import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // Relative base so the static build works on any host path, such as GitHub Pages.
  base: './',
  // MapLibre is most of the bundle, and it does not split well.
  build: { chunkSizeWarningLimit: 1500 },
  worker: { format: 'es' },
  plugins: [
    react(),
    VitePWA({
      // A new version takes over as soon as it installs. main.tsx decides when the page reloads.
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Where2Walk',
        short_name: 'Where2Walk',
        description: 'Plan a walk that starts and ends where you are.',
        theme_color: '#1f7a5a',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }],
      },
      workbox: {
        // Cache only the app shell. Map tiles and routes always come from the network.
        globPatterns: ['**/*.{js,css,html,svg}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
    }),
  ],
})
