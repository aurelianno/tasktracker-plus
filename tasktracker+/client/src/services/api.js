/*
  api.js
  Axios API service for TaskTracker+ frontend.
  - Configures base URL and credentials for API requests.
  - Sets up request/response interceptors for authentication and error handling.
  - Used by all frontend services and Redux thunks for HTTP communication with backend.
*/

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
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

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const token = localStorage.getItem('token');
    if (error.response?.status === 401 && token) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const fetchArchivedTasks = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== '' && params[key] !== false) {
      searchParams.append(key, params[key]);
    }
  });
  return api.get(`/tasks/archived?${searchParams}`);
};

export const deleteAccount = () => api.delete('/users/me');

export const updateUserPreferences = (prefs) => api.patch('/users/me/preferences', prefs);

export default api;