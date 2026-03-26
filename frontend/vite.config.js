import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: true },
      manifest: {
        name: 'SwasthyaSetu',
        short_name: 'SwasthyaSetu',
        description: 'Your Health, Your Language, Anytime.',
        theme_color: '#ffffff',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ],
  // Your existing server config is preserved, with the proxy correctly updated.
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    fs: { strict: false },
    allowedHosts: 'all',

    // --- THIS IS THE FINAL, CORRECTED PROXY CONFIGURATION ---
    proxy: {
      // Rule for standard API calls (HTTP)
      '/api': {
        target: 'http://127.0.0.1:5000', // Your Flask backend address
        changeOrigin: true,
      },
      // Rule for file uploads (HTTP)
      '/uploads': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
      // NEW, CRUCIAL RULE for the WebSocket signaling server
      '/signal': {
        target: 'ws://127.0.0.1:5000', // Note the 'ws://' protocol for WebSockets
        ws: true, // This is the essential flag that tells Vite to proxy WebSocket connections
      },
    }
  }
})