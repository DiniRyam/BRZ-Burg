import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Importações necessárias para criar o __dirname
import { fileURLToPath } from 'url'

// Criação manual do __filename e __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})