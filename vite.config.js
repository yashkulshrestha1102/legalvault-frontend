import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // ✅ Force CSS to be included in build
  css: {
    modules: {
      scopeBehaviour: 'global',
    },
  },
  build: {
    // ✅ Ensure CSS is not purged too aggressively
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})