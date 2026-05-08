import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
});

export default api;