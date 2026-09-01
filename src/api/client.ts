import axios from 'axios'

// In dev the Vite proxy forwards /admin, /web, /health to localhost:8000 —
// so we use relative paths here. In prod set VITE_API_BASE_URL to the real URL.
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const key = import.meta.env.VITE_INTERNAL_API_KEY
  if (key) {
    config.headers['X-Internal-Key'] = key
  }
  return config
})

export default apiClient
