import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
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
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (data: Record<string, string>) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

export const studentsApi = {
  getAll: () => api.get('/students'),
  getById: (id: number) => api.get(`/students/${id}`),
  create: (data: Record<string, unknown>) => api.post('/students', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/students/${id}`, data),
  delete: (id: number) => api.delete(`/students/${id}`),
};

export const instructorsApi = {
  getAll: () => api.get('/instructors'),
  create: (data: Record<string, unknown>) => api.post('/instructors', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/instructors/${id}`, data),
  delete: (id: number) => api.delete(`/instructors/${id}`),
};

export const classesApi = {
  getAll: () => api.get('/classes'),
  getPublic: () => api.get('/classes/public'),
  create: (data: Record<string, unknown>) => api.post('/classes', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/classes/${id}`, data),
  delete: (id: number) => api.delete(`/classes/${id}`),
};

export const enrollmentsApi = {
  getAll: () => api.get('/enrollments'),
  create: (data: { studentId?: number; classId: number }) => api.post('/enrollments', data),
  updateStatus: (id: number, status: string) => api.patch(`/enrollments/${id}/status`, { status }),
};

export const paymentsApi = {
  getAll: () => api.get('/payments'),
  getMy: () => api.get('/payments/my'),
  pay: (id: number, data: { paymentMethod?: string; notes?: string }) =>
    api.patch(`/payments/${id}/pay`, data),
};

export const attendanceApi = {
  getByClass: (classId: number, date?: string) =>
    api.get(`/attendance/class/${classId}`, { params: { date } }),
  record: (data: Record<string, unknown>) => api.post('/attendance', data),
  recordBulk: (records: Record<string, unknown>[]) => api.post('/attendance/bulk', { records }),
};

export const catalogApi = {
  getDanceStyles: () => api.get('/dance-styles'),
  getDanceStylesPublic: () => api.get('/dance-styles/public'),
  getClassrooms: () => api.get('/classrooms'),
  getDashboard: () => api.get('/dashboard'),
};
