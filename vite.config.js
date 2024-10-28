import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    outDir: path.resolve(__dirname, 'dist'), 
    rollupOptions: {
      output: {
        format: 'cjs' 
      }
    }
  },
  base: './', 
  server: {
    port: 3000,
    open: true
  }
})