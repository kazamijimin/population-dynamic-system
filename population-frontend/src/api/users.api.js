// population-frontend/src/api/users.api.js
import api from './axios';

export const registerRequest = async (userData) => {
  const response = await api.post('/auth/register/', userData);
  return response.data;
};

export const loginRequest = async (username, password) => {
  const response = await api.post('/auth/login/', { username, password });
  return response.data;
};

export const logoutRequest = async () => {
  const response = await api.post('/auth/logout/');
  return response.data;
};

export const fetchCurrentUser = async () => {
  const response = await api.get('/auth/current/');
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await api.patch('/auth/profile/update/', profileData);
  return response.data;
};

export const fetchActivityHistory = async () => {
  const response = await api.get('/auth/activity/');
  return response.data;
};

// Admin User Management
export const adminApi = {
  getUsers: () => api.get('/auth/admin/users/'),
  createUser: (data) => api.post('/auth/admin/users/', data),
  updateUser: (id, data) => api.patch(`/auth/admin/users/${id}/`, data),
  deleteUser: (id) => api.delete(`/auth/admin/users/${id}/`),
  toggleStatus: (id) => api.post(`/auth/admin/users/${id}/toggle_status/`),
  resetPassword: (id, password) => api.post(`/auth/admin/users/${id}/reset_password/`, { password }),
  getActivityLogs: () => api.get('/auth/admin/activity-logs/'),
};
