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
    // ✅ Code splitting - using function
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // React vendor
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'react-vendor';
            }
            // UI vendor
            if (id.includes('react-select') || id.includes('framer-motion') || id.includes('react-icons')) {
              return 'ui-vendor';
            }
            // Chart vendor
            if (id.includes('recharts')) {
              return 'chart-vendor';
            }
            // Export vendor
            if (id.includes('jspdf') || id.includes('xlsx') || id.includes('jspdf-autotable')) {
              return 'export-vendor';
            }
            // Other vendor
            return 'vendor';
          }
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
    // ✅ Source maps off
    sourcemap: false,
  },
})