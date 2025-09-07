import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/admin/login', credentials),
};

export const dashboardAPI = {
  getStats: () => api.get('/admin/dashboard/stats'),
};

export const usersAPI = {
  getAll: (params) => api.get('/admin/users', { params }),
  getById: (userId) => api.get(`/admin/users/${userId}`),
};

export const horoscopeAPI = {
  getAll: (params) => api.get('/admin/horoscopes', { params }),
  create: (data) => api.post('/admin/horoscopes', data),
  delete: (id) => api.delete(`/admin/horoscopes/${id}`),
  publish: (id, data) => api.patch(`/admin/horoscopes/${id}/publish`, data),
  clearCache: (data) => api.post('/admin/cache/clear', data),
};

export default api;