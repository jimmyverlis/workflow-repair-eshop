import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Attach the customer token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('eshop_customer_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Forward the current hostname so the backend resolver works
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    config.headers['X-Domain'] = window.location.hostname
  }
  return config
})

export default api
