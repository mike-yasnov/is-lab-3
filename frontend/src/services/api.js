import axios from 'axios';

const API_BASE_URL = 'http://localhost:8082/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавление токена к запросам
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Обработка ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    if (error.response?.status === 401) {
      // Токен истёк или невалиден
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
};

// Admin API
export const adminAPI = {
  getPendingAdmins: () => api.get('/admin/pending-admins'),
  approveAdmin: (userId) => api.post(`/admin/approve-admin/${userId}`),
  rejectAdmin: (userId) => api.delete(`/admin/reject-admin/${userId}`),
};

// Import API
export const importAPI = {
  importWorkers: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/import/workers', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getHistory: (page = 0, size = 10) => api.get('/import/history', { params: { page, size } }),
  // Скачивание файла импорта
  downloadFile: (historyId) => api.get(`/import/history/${historyId}/download`, {
    responseType: 'blob',
  }),
};

// Workers API
export const workersAPI = {
  getAll: (page = 0, size = 10, sortBy = null, sortDirection = 'ASC') => {
    const params = { page, size };
    if (sortBy) {
      params.sortBy = sortBy;
      params.sortDirection = sortDirection;
    }
    return api.get('/workers', { params });
  },

  getById: (id) => api.get(`/workers/${id}`),

  create: (worker) => api.post('/workers', worker),

  update: (id, worker) => api.put(`/workers/${id}`, worker),

  delete: (id) => api.delete(`/workers/${id}`),

  deleteByRating: (rating) => api.delete(`/workers/by-rating/${rating}`),

  getRatingSum: () => api.get('/workers/rating/sum'),

  searchByName: (prefix) => api.get('/workers/search/by-name', { params: { prefix } }),

  hireToOrganization: (workerId, organizationId) => 
    api.post(`/workers/${workerId}/hire/${organizationId}`),

  indexSalary: (workerId, coefficient) => 
    api.post(`/workers/${workerId}/index-salary`, null, { params: { coefficient } }),
};

// Organizations API
export const organizationsAPI = {
  getAll: () => api.get('/organizations'),

  getById: (id) => api.get(`/organizations/${id}`),

  create: (organization) => api.post('/organizations', organization),

  update: (id, organization) => api.put(`/organizations/${id}`, organization),

  delete: (id) => api.delete(`/organizations/${id}`),
};

// Cache API (только для администраторов)
export const cacheAPI = {
  getStatistics: () => api.get('/cache/statistics'),
  logStatistics: () => api.post('/cache/statistics/log'),
  clearStatistics: () => api.post('/cache/statistics/clear'),
  getLoggingStatus: () => api.get('/cache/logging/status'),
  enableLogging: () => api.post('/cache/logging/enable'),
  disableLogging: () => api.post('/cache/logging/disable'),
};

export default api;
