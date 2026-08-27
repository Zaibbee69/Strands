import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // Fixed package name here
import { fileURLToPath } from 'url'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    hmr: {
      host: "localhost",
      port: 5173,
    },
  },
})

