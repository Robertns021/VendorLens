import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/VendorLens/' : '/',
  plugins: [
    react(),
    tailwindcss(),
  ],
}))