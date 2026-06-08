import axios from 'axios';

// Where the API lives:
// - If VITE_API_BASE_URL is set at build time, use it (override for any host).
// - Otherwise, in a production build default to the deployed Render API.
// - In local dev, default to '/api' so Vite's proxy forwards to localhost:5000.
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? 'https://larkpilot-api.onrender.com/api' : '/api');

export const apiClient = axios.create({
  baseURL: API_BASE_URL
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export function buildAssetUrl(path) {
  if (!path) {
    return '';
  }

  if (path.startsWith('http')) {
    return path;
  }

  const origin = API_BASE_URL.endsWith('/api') ? API_BASE_URL.slice(0, -4) : '';

  return `${origin}${path}`;
}
