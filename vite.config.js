import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  css: {
    postcss: {
      plugins: [
        require('@tailwindcss/postcss'),
      ],
    },
  },
  build: {
    minify: 'esbuild',
    sourcemap: false,
    cssMinify: true,
  },
})