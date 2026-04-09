import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  const academyId = useAuthStore.getState().currentAcademyId;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (academyId) {
    config.headers['X-Academy-Id'] = academyId;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;
