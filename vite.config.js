import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/hr-query': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/hr-query/, '/query')
      },
      '/doc-query': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/doc-query/, '/query')
      },
      '/upload': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      }
    }
  }
})
