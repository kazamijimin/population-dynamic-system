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

const unsafeMethods = new Set(['post', 'put', 'patch', 'delete']);
let csrfPromise = null;

const getCookie = (name) => {
  if (typeof document === 'undefined') return null;
  const cookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.split('=').slice(1).join('=')) : null;
};

const ensureCsrfCookie = async () => {
  if (getCookie('csrftoken')) return;
  if (!csrfPromise) {
    csrfPromise = api.get('/csrf/').finally(() => {
      csrfPromise = null;
    });
  }
  await csrfPromise;
};

api.interceptors.request.use(async (config) => {
  const method = (config.method || 'get').toLowerCase();
  if (unsafeMethods.has(method)) {
    await ensureCsrfCookie();
    const token = getCookie('csrftoken');
    if (token) {
      config.headers = config.headers || {};
      config.headers['X-CSRFToken'] = token;
    }
  }
  return config;
});

export default api;
