import api from './axios';

// ============ INGREDIENTS ============

export const getIngredients = async () => {
  const response = await api.get('/inventory/ingredients/');
  return response.data;
};

export const getIngredient = async (id) => {
  const response = await api.get(`/inventory/ingredients/${id}/`);
  return response.data;
};

export const createIngredient = async (data) => {
  const response = await api.post('/inventory/ingredients/', data);
  return response.data;
};

export const updateIngredient = async (id, data) => {
  const response = await api.put(`/inventory/ingredients/${id}/`, data);
  return response.data;
};

export const deleteIngredient = async (id) => {
  await api.delete(`/inventory/ingredients/${id}/`);
};

export const getLowStockIngredients = async () => {
  const response = await api.get('/inventory/ingredients/low-stock/');
  return response.data;
};

// ============ ITEMS ============

export const getItems = async () => {
  const response = await api.get('/inventory/items/');
  return response.data;
};

export const getItem = async (id) => {
  const response = await api.get(`/inventory/items/${id}/`);
  return response.data;
};

export const createItem = async (data) => {
  const response = await api.post('/inventory/items/', data);
  return response.data;
};

export const updateItem = async (id, data) => {
  const response = await api.put(`/inventory/items/${id}/`, data);
  return response.data;
};

export const deleteItem = async (id) => {
  await api.delete(`/inventory/items/${id}/`);
};