import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/auth': 'http://localhost:8000',
      '/admin': 'http://localhost:8000',
      // '/super-admin' is both an API prefix (super-admin XHR calls) and a
      // client-side route (the super-admin SPA pages live at /super-admin/*).
      // Only forward actual API calls to the backend; let a top-level page
      // load/reload of the SPA route fall through to Vite's own history
      // fallback so it serves index.html instead of the backend's 404.
      '/super-admin': {
        target: 'http://localhost:8000',
        bypass: (req) => {
          if (req.headers.accept?.includes('text/html')) {
            return req.url
          }
        },
      },
      '/web': 'http://localhost:8000',
      '/health': 'http://localhost:8000',
    },
  },
})
