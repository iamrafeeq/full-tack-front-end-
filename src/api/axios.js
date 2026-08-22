import axios from 'axios';

export const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({ baseURL: apiBase });

export default api;
