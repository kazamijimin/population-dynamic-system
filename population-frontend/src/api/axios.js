import axios from "axios";

const defaultApiBaseUrl = "http://localhost:8000/api";

export const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || defaultApiBaseUrl).replace(/\/$/, "");
export const buildApiUrl = (path) => `${apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
});

export default api;
