/**
 * Cliente HTTP Axios para el API Django.
 * Añade JWT automáticamente y redirige a login en respuestas 401.
 */
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

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

/** Autenticación: login, registro, perfil y recuperación de contraseña. */
export const authApi = {
  getCaptcha: () => api.get('/auth/captcha/'),
  login: (data: object) => api.post('/auth/login/', data),
  register: (data: object) => api.post('/auth/register/', data),
  me: () => api.get('/auth/me/'),
  updateMe: (data: object) => api.patch('/auth/me/', data),
  passwordResetRequest: (email: string) => api.post('/auth/password-reset/', { email }),
  passwordResetConfirm: (data: object) => api.post('/auth/password-reset/confirm/', data),
};

/** Catálogo de coreografías: listado, CRUD y aprobación. */
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

/** Carrito persistente del cliente. */
export const cartApi = {
  get: () => api.get('/cart/'),
  add: (choreographyId: number) => api.post('/cart/add/', { choreography_id: choreographyId }),
  remove: (itemId: number) => api.delete(`/cart/items/${itemId}/`),
  clear: () => api.delete('/cart/clear/'),
};

/** Ventas, checkout, compras y progreso de videos. */
export const salesApi = {
  checkout: (data: object) => api.post('/sales/checkout/', data),
  mySales: () => api.get('/sales/my/'),
  myPurchases: () => api.get('/sales/purchases/'),
  getPurchase: (id: number) => api.get(`/sales/purchases/${id}/`),
  markWatched: (id: number, partNumber: number) =>
    api.post(`/sales/purchases/${id}/watch/`, { part_number: partNumber }),
  allSales: () => api.get('/sales/all/'),
};

/** Métricas de dashboards admin, cliente y profesor; estadísticas públicas. */
export const dashboardApi = {
  admin: () => api.get('/auth/dashboard/admin/'),
  client: () => api.get('/auth/dashboard/client/'),
  professor: () => api.get('/auth/dashboard/professor/'),
  publicStats: () => api.get('/auth/public-stats/'),
};

/** Gestión de usuarios internos y listado de profesores. */
export const usersApi = {
  getInternal: (params?: object) => api.get('/auth/internal/', { params }),
  createInternal: (data: object) => api.post('/auth/internal/', data),
  updateInternal: (id: number, data: object) => api.patch(`/auth/internal/${id}/`, data),
  deleteInternal: (id: number) => api.delete(`/auth/internal/${id}/`),
  getProfessors: () => api.get('/auth/professors/'),
};

/** Postulaciones para ser profesor bailarín. */
export const applicationsApi = {
  submit: (data: object) => api.post('/auth/professor-applications/', data),
  list: (params?: object) => api.get('/auth/professor-applications/', { params }),
  approve: (id: number, data?: object) => api.post(`/auth/professor-applications/${id}/approve/`, data),
  reject: (id: number, data?: object) => api.post(`/auth/professor-applications/${id}/reject/`, data),
};
