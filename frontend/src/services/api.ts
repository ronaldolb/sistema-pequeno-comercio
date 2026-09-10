import axios from 'axios';

export const api = axios.create({ baseURL: '/api' });

// Anexa o token salvo no login em toda requisição, e desloga automaticamente se o token
// expirar/for rejeitado (401) — evita telas travadas mostrando erro de permissão.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);
