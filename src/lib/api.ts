import axios from 'axios';

// Dev: hit Express directly so the Vite proxy isn't required.
// Prod: same-origin `/api` (reverse-proxy that path to the API).
const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    (import.meta.env.DEV ? 'http://localhost:4000/api' : '/api'),
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export default api;
