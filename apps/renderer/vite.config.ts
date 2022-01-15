import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  preview: {
    port: 41051,
  },
  server: {
    fs: {
      allow: ['../../'],
    },
  },
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src/',
    },
  },
})
