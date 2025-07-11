/*
  authService.js
  Authentication service for TaskTracker+ frontend.
  - Handles user registration, login, logout, profile, password, and preferences.
  - Communicates with backend API for all auth-related actions.
  - Used by Redux thunks and components for user/session management.
*/

import api from './api';

const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    
    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('token', response.data.token);
    }
    
    return response.data;
  },

  login: async (userData) => {
    const response = await api.post('/auth/login', userData);
    
    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('token', response.data.token);
    }
    
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Even if the API call fails, we should clear local storage
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      // Reset theme to light mode
      if (window.setTheme) window.setTheme('light');
    }
    
    return { message: 'Logged out successfully' };
  },

  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', userData);
    
    if (response.data && response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, password) => {
    const response = await api.post(`/auth/reset-password/${token}`, { password });
    
    if (response.data.user && response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('token', response.data.token);
    }
    
    return response.data;
  },

  updatePreferences: async (prefs) => {
    const response = await import('./api').then(m => m.updateUserPreferences(prefs));
    if (response.data && response.data.preferences) {
      // Update user in localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        user.preferences = response.data.preferences;
        localStorage.setItem('user', JSON.stringify(user));
      }
    }
    return response.data;
  },

  resetThemeOnLogout: async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      user.preferences = {
        theme: 'light', // Default theme
        notifications: true,
        timezone: 'UTC'
      };
      localStorage.setItem('user', JSON.stringify(user));
    }
  }
};

export default authService;