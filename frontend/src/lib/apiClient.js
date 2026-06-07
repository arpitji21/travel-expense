import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api'
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

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
  const origin = apiBaseUrl.endsWith('/api') ? apiBaseUrl.slice(0, -4) : '';

  return `${origin}${path}`;
}
