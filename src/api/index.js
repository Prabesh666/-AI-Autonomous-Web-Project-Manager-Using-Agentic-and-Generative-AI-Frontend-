/**
 * Centralized Axios API service layer.
 * Base URL: VITE_BACKEND_URL + /api
 *
 * Features:
 *  - JWT auto-attachment via request interceptor
 *  - 401 auto-logout via response interceptor
 *  - Global error message logging from backend
 *  - 10s timeout, withCredentials for future cookie/refresh support
 *  - Request cancellation support via AbortController (native Axios)
 */

import axios from 'axios';

// ─── Instance ─────────────────────────────────────────────────────────────────

const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000,           // 10 seconds — avoids hanging on slow responses
  withCredentials: false,   // Set to true when using cookie-based sessions or refresh tokens
});

// ─── Request Interceptor ──────────────────────────────────────────────────────

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ─── Response Interceptor ─────────────────────────────────────────────────────

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const serverMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred';

    if (status === 401) {
      // Token expired or invalid — clear session and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Use window.location to guarantee a full navigation even outside React Router
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Log backend error in development for easier debugging
    if (import.meta.env.DEV) {
      console.error(`[API Error] ${status || 'Network'}: ${serverMessage}`);
    }

    // Propagate a normalized error so calling hooks/components can read it
    return Promise.reject(new Error(serverMessage));
  }
);

export default apiClient;
