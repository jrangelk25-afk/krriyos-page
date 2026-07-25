import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  css: {
    postcss: './postcss.config.js'
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Separate vendor libraries
          if (id.includes('node_modules')) {
            if (id.includes('vue') || id.includes('vue-router') || id.includes('pinia')) {
              return 'vendor-core'
            }
            if (id.includes('jsonwebtoken') || id.includes('jwt-decode')) {
              return 'vendor-utils'
            }
            if (id.includes('zustand')) {
              return 'vendor-ui'
            }
            return 'vendor'
          }
          // Lazy-loaded admin chunk
          if (id.includes('AdminDashboard') || id.includes('AdminProducts')) {
            return 'admin'
          }
        }
      }
    },
    // Enable minification for smaller bundle
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    // Report compressed size
    reportCompressedSize: true,
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
})
