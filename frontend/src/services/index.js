import api, { unwrap } from './api';

export const authApi = {
  register: (data) => api.post('/api/auth/register', data).then(unwrap),
  login: (data) => api.post('/api/auth/login', data).then(unwrap),
  logout: () => api.post('/api/auth/logout').then(unwrap),
  me: () => api.get('/api/auth/me').then(unwrap),
};

export const complaintApi = {
  create: (data) => api.post('/api/complaints', data).then(unwrap),
  getAll: (params) => api.get('/api/complaints', { params }).then(unwrap),
  getMy: () => api.get('/api/complaints/my').then(unwrap),
  getById: (id) => api.get(`/api/complaints/${id}`).then(unwrap),
  updateStatus: (id, data) => api.patch(`/api/complaints/${id}/status`, data).then(unwrap),
  assign: (id, workerId) => api.patch(`/api/complaints/${id}/assign`, { workerId }).then(unwrap),
  verify: (id, data) => api.patch(`/api/complaints/${id}/verify`, data).then(unwrap),
  close: (id, data) => api.patch(`/api/complaints/${id}/close`, data).then(unwrap),
  remove: (id) => api.delete(`/api/complaints/${id}`).then(unwrap),
};

export const workerApi = {
  getAll: (params) => api.get('/api/workers', { params }).then(unwrap),
  getById: (id) => api.get(`/api/workers/${id}`).then(unwrap),
  create: (data) => api.post('/api/workers', data).then(unwrap),
  update: (id, data) => api.patch(`/api/workers/${id}`, data).then(unwrap),
  remove: (id) => api.delete(`/api/workers/${id}`).then(unwrap),
  getTasks: (id) => api.get(`/api/workers/${id}/tasks`).then(unwrap),
  getMyTasks: () => api.get('/api/workers/me/tasks').then(unwrap),
  getByDepartment: (dept) => api.get(`/api/workers/department/${encodeURIComponent(dept)}`).then(unwrap),
  getPerformance: () => api.get('/api/workers/performance').then(unwrap),
};

export const fileApi = {
  upload: (files, folder = 'complaints') => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return api.post(`/api/files/upload?folder=${folder}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(unwrap);
  },
  remove: (publicId) => api.delete(`/api/files/${publicId}`).then(unwrap),
};

export const notificationApi = {
  getAll: () => api.get('/api/notifications').then(unwrap),
  markRead: (id) => api.patch(`/api/notifications/${id}/read`).then(unwrap),
  markAllRead: () => api.patch('/api/notifications/read-all').then(unwrap),
  remove: (id) => api.delete(`/api/notifications/${id}`).then(unwrap),
};

export const analyticsApi = {
  dashboard: () => api.get('/api/analytics/dashboard').then(unwrap),
  complaints: () => api.get('/api/analytics/complaints').then(unwrap),
  workers: () => api.get('/api/analytics/workers').then(unwrap),
  trends: () => api.get('/api/analytics/trends').then(unwrap),
};
