import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        timeout: 600000,        // ✅ 10 min
        proxyTimeout: 600000,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('❌ Proxy error:', err.message);
            console.log('   URL:', req.url);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('📤 Proxying:', req.method, req.url);
            console.log('   Content-Length:', req.headers['content-length']);
          });
        },
      },
    },
  },
  build: {
    minify: 'esbuild',
    sourcemap: false,
    cssMinify: true,
    // ✅ NEW: Manual chunking for faster initial load
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // UI libraries
          'ui-vendor': ['framer-motion', 'react-icons', 'lucide-react'],
          // Export libraries (lazy loaded)
          'export-vendor': ['jspdf', 'jspdf-autotable', 'xlsx'],
          // File preview libraries (lazy loaded)
          'preview-vendor': ['mammoth', 'jszip'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})