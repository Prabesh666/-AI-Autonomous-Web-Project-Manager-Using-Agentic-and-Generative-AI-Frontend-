/**
 * Centralized Axios API service layer.
 * Base URL: VITE_BACKEND_URL + /api
 *
 * Features:
 *  - JWT auto-attachment via request interceptor
 *  - 401 auto-logout via response interceptor
 *  - Global error message logging from backend
 *  - 60s timeout for AI cold-starts
 *  - 🛡️ 0.001% UX: Autonomous Self-Healing (Retry with Exponential Backoff)
 */

import axios from 'axios';

// ─── Instance ─────────────────────────────────────────────────────────────────

export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const apiClient = axios.create({
  baseURL: import.meta.env.DEV ? '/api/v1' : `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 60000,       // 60 seconds — allows time for AI cold-starts
  withCredentials: false,
  retry: 3,             // 🛡️ Auto-retry 3 times on failure
  retryDelay: 1000,     // 1s base delay between retries
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
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────

apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const status = error.response?.status;
    const serverMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred';

    // 401 — clear session and redirect to login
    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    // 🛡️ 0.001% UX: Autonomous Self-Healing (Retry with Exponential Backoff)
    const config = error.config;
    if (config && config.retry) {
      config.__retryCount = config.__retryCount || 0;
      if (config.__retryCount < config.retry) {
        config.__retryCount += 1;
        const delay = (config.retryDelay || 1000) * config.__retryCount;
        console.warn(`[Neural Link] Jitter detected. Retry ${config.__retryCount}/${config.retry} in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return apiClient(config);
      }
    }

    // Log backend error in development
    if (import.meta.env.DEV) {
      console.error(`[API Error] ${status || 'Network'}: ${serverMessage}`);
    }

    return Promise.reject(error);
  }
);

// ─── Projects ─────────────────────────────────────────────────────────────────
export const getProjects = () => apiClient.get('/projects');
export const getProject = (id) => apiClient.get(`/projects/${id}`);
export const createProject = (data) => apiClient.post('/projects', data);
export const updateProject = (id, data) => apiClient.put(`/projects/${id}`, data);
export const deleteProject = (id) => apiClient.delete(`/projects/${id}`);
export const indexProject = (id) => apiClient.post(`/projects/${id}/index`);
export const runVisualAudit = (projectId, url) => apiClient.post('/audits/run', { projectId, url });
export const getVelocityForecast = (id) => apiClient.get(`/projects/${id}/velocity`);
export const getProjectLessons = (id) => apiClient.get(`/projects/${id}/lessons`);
export const proposeEvolution = (id) => apiClient.post(`/projects/${id}/evolve`);
export const getProjectBudget = (id) => apiClient.get(`/projects/${id}/budget`);
export const getProjectInfra = (id) => apiClient.get(`/projects/${id}/infra`);
export const getProjectCompliance = (id) => apiClient.get(`/projects/${id}/compliance`);

// ─── Tasks ────────────────────────────────────────────────────────────────────

export default apiClient;
