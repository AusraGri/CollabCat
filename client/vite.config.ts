import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@server': fileURLToPath(new URL('../server/src', import.meta.url)),
    },
  },
  server: {
    host: 'localhost', // or use '0.0.0.0' to listen on all addresses
    port: 5174, // Change to your desired port
  },
})
