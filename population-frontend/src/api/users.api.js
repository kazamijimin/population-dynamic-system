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