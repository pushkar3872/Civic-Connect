import axios from 'axios';
import useAuthStore from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    try {
      // Log token presence and user from store for tracing
      const user = useAuthStore.getState().user;
      console.log('[Frontend API] request - attaching token', {
        url: config.url,
        method: config.method,
        user: user ? { id: user._id || user.id, role: user.role, email: user.email } : null,
        tokenPreview: `${token.slice(0, 8)}...${token.slice(-8)}`,
      });
    } catch (e) {
      console.log('[Frontend API] request - attaching token (no user info)');
    }
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.log('[Frontend API] request - no token present', { url: config.url, method: config.method });
  }
  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const token = res.data?.data?.accessToken;
        useAuthStore.getState().setToken(token);
        processQueue(null, token);
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export const getErrorMessage = (error) =>
  error.response?.data?.message || error.message || 'Something went wrong';

export const unwrap = (response) => response.data?.data ?? response.data;
