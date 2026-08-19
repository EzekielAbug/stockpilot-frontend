import axios from 'axios';

const api = axios.create({
  
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If we get a 401 Unauthorized, the token is expired or invalid
    if (error.response && error.response.status === 401) {
      // Don't redirect if the user is explicitly trying to log in (wrong password)
      if (error.config && error.config.url && !error.config.url.includes('/auth/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;