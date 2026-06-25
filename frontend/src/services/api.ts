import axios from 'axios';

const api = axios.create({ baseURL: '/api', headers: { 'Content-Type': 'application/json' } });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

export const authApi = {
  getCaptcha: () => api.get('/auth/captcha/'),
  login: (data: object) => api.post('/auth/login/', data),
  register: (data: object) => api.post('/auth/register/', data),
  me: () => api.get('/auth/me/'),
  updateMe: (data: object) => api.patch('/auth/me/', data),
};

export const choreoApi = {
  getAll: (params?: object) => api.get('/choreographies/', { params }),
  getFeatured: () => api.get('/choreographies/featured/'),
  getHotSales: () => api.get('/choreographies/hot_sales/'),
  getById: (id: number) => api.get(`/choreographies/${id}/`),
  create: (data: object) => api.post('/choreographies/', data),
  update: (id: number, data: object) => api.patch(`/choreographies/${id}/`, data),
  delete: (id: number) => api.delete(`/choreographies/${id}/`),
  approve: (id: number) => api.post(`/choreographies/${id}/approve/`),
};

export const cartApi = {
  get: () => api.get('/cart/'),
  add: (choreographyId: number) => api.post('/cart/add/', { choreography_id: choreographyId }),
  remove: (itemId: number) => api.delete(`/cart/items/${itemId}/`),
  clear: () => api.delete('/cart/clear/'),
};

export const salesApi = {
  checkout: (data: object) => api.post('/sales/checkout/', data),
  mySales: () => api.get('/sales/my/'),
  myPurchases: () => api.get('/sales/purchases/'),
  getPurchase: (id: number) => api.get(`/sales/purchases/${id}/`),
  markWatched: (id: number, partNumber: number) =>
    api.post(`/sales/purchases/${id}/watch/`, { part_number: partNumber }),
  allSales: () => api.get('/sales/all/'),
};

export const dashboardApi = {
  admin: () => api.get('/auth/dashboard/admin/'),
  client: () => api.get('/auth/dashboard/client/'),
};

export const usersApi = {
  getInternal: (params?: object) => api.get('/auth/internal/', { params }),
  createInternal: (data: object) => api.post('/auth/internal/', data),
  updateInternal: (id: number, data: object) => api.patch(`/auth/internal/${id}/`, data),
  deleteInternal: (id: number) => api.delete(`/auth/internal/${id}/`),
  getProfessors: () => api.get('/auth/professors/'),
};
