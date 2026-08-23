import axios from 'axios';

export const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({ baseURL: apiBase });

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      window.dispatchEvent(new Event("auth:deactivated"));
    }
    return Promise.reject(err);
  }
);

export default api;
