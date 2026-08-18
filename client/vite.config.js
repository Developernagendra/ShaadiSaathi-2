import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react({
      // Faster JSX transform
      jsxRuntime: 'automatic',
    }),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
        suppressWarnings: true,
        type: 'module'
      },
      manifest: {
        name: 'ShaadiSaathi',
        short_name: 'ShaadiSaathi',
        description: 'Premium Mobile-First Wedding Marketplace',
        theme_color: '#FF4D6D',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        lang: 'en',
        dir: 'ltr',
        categories: ['lifestyle', 'shopping', 'events', 'business'],
        shortcuts: [
          {
            name: "AI Planner",
            short_name: "Planner",
            description: "Start AI Wedding Planner",
            url: "/tools/ai-planner",
            icons: [{ src: "/icon-96.png", sizes: "96x96" }]
          },
          {
            name: "Book Cab",
            short_name: "Cabs",
            description: "Book Baraat Cab",
            url: "/baraat-cabs",
            icons: [{ src: "/icon-96.png", sizes: "96x96" }]
          }
        ],
        icons: [
          { src: '/icon-16.png', sizes: '16x16', type: 'image/png' },
          { src: '/icon-32.png', sizes: '32x32', type: 'image/png' },
          { src: '/icon-72.png', sizes: '72x72', type: 'image/png' },
          { src: '/icon-96.png', sizes: '96x96', type: 'image/png' },
          { src: '/icon-128.png', sizes: '128x128', type: 'image/png' },
          { src: '/icon-144.png', sizes: '144x144', type: 'image/png' },
          { src: '/icon-152.png', sizes: '152x152', type: 'image/png' },
          { src: '/icon-180.png', sizes: '180x180', type: 'image/png' },
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/maskable-icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/icon-256.png', sizes: '256x256', type: 'image/png' },
          { src: '/icon-384.png', sizes: '384x384', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/maskable-icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cloudinary-images-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /\/api\//i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
              networkTimeoutSeconds: 5,
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      }
    })
  ],

  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5002',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    dedupe: ['react', 'react-dom'],
  },

  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 800,
    cssCodeSplit: true,
    reportCompressedSize: false, // faster builds
    assetsInlineLimit: 4096, // inline assets < 4KB as base64

    // esbuild minification — comes bundled with Vite, no install needed
    minify: 'esbuild',
    esbuildOptions: {
      drop: ['console', 'debugger'],
    },

    rollupOptions: {
      output: {
        // Manual chunk splitting for optimal caching
        manualChunks: (id) => {
          // Core React/Redux — cached longest
          if (id.includes('node_modules/react') ||
              id.includes('node_modules/react-dom') ||
              id.includes('node_modules/react-redux') ||
              id.includes('node_modules/@reduxjs') ||
              id.includes('node_modules/redux')) {
            return 'vendor-react'
          }

          // Router — changes infrequently
          if (id.includes('node_modules/react-router')) {
            return 'vendor-router'
          }

          // Framer Motion — large, isolated chunk
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-motion'
          }

          // Socket.io — large, used only when authenticated
          if (id.includes('node_modules/socket.io') ||
              id.includes('node_modules/engine.io')) {
            return 'vendor-socket'
          }

          // Icon libraries — large, isolated
          if (id.includes('node_modules/react-icons')) {
            return 'vendor-icons'
          }

          // PDF and canvas generators — heavy, isolated
          if (id.includes('node_modules/jspdf') ||
              id.includes('node_modules/html2canvas')) {
            return 'vendor-pdf'
          }

          // Charting libraries
          if (id.includes('node_modules/recharts') ||
              id.includes('node_modules/d3-') ||
              id.includes('node_modules/victory')) {
            return 'vendor-charts'
          }

          // i18n
          if (id.includes('node_modules/i18next') ||
              id.includes('node_modules/react-i18next')) {
            return 'vendor-i18n'
          }

          // No catch-all — let Rollup handle other modules naturally
          // (avoids circular dependency issues)
        },

        // Predictable asset filenames for better CDN caching
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
  },
})