import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      injectRegister: 'auto',
      registerType: 'autoUpdate',
      manifest: {
        name: 'Paw Wallet',
        short_name: 'Paw Wallet',
        description: "Köpeğinizin dijital pasaportu",
        start_url: '/',
        display: 'standalone',
        background_color: '#EFE9D6',
        theme_color: '#1B3A2F',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      injectManifest: {
        swSrc: 'src/sw.js',
        swDest: 'dist/sw.js',
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
})
