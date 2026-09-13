import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '::',
    port: 4175,
  },
  preview: {
    host: '::',
    port: 4176,
  },
  build: {
    target: 'es2020',
    sourcemap: false,
  },
})
