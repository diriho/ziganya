import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    "import.meta.env.SSR": "false",
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@sdk/db': path.resolve(__dirname, './sdk/db'),
      "@sdk/requests": path.resolve(__dirname, "./sdk/requests/"),
      module: path.resolve(__dirname, "vite-module-stub.js"),
    },
  },
})
