import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  css: {
    modules: {
      scopeBehaviour: 'global',
    },
  },
  build: {
    // ✅ Code splitting - smaller chunks
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['react-select', 'framer-motion', 'react-icons'],
          'chart-vendor': ['recharts'],
          'export-vendor': ['jspdf', 'jspdf-autotable', 'xlsx'],
        }
      }
    },
    // ✅ Minify
    minify: 'terser',
    // ✅ Remove console logs in production
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      }
    },
    // ✅ Smaller chunks
    chunkSizeWarningLimit: 500,
    // ✅ Source maps for debugging (optional)
    sourcemap: false,
  },
})