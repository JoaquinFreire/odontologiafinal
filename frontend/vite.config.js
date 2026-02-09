import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Code splitting para componentes grandes
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'lucide': ['lucide-react'],
          'supabase': ['@supabase/supabase-js']
        }
      }
    },
    // Minificación agresiva
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    // Optimización de CSS
    cssCodeSplit: true,
    // Aumentar chunk size limit
    chunkSizeWarningLimit: 600
  },
  // Optimizar servidor dev
  server: {
    headers: {
      'Cache-Control': 'public, max-age=31536000'
    },
    hmr: {
      host: 'localhost',
      port: 5173,
      protocol: 'ws'
    }
  }
})
