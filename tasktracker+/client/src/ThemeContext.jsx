import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import authService from './services/authService';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const { user, isLoading } = useSelector((state) => state.auth);

  // Check system preference
  const getSystemTheme = () =>
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  // Get theme from user preference
  const getUserTheme = () => {
    if (user && user.preferences && user.preferences.theme) {
      return user.preferences.theme === 'system'
        ? (getSystemTheme() ? 'dark' : 'light')
        : user.preferences.theme;
    }
    return null;
  };

  // Initial theme: light (for login screen)
  const [theme, setTheme] = useState('light');
  const [ready, setReady] = useState(false);
  const userTheme = getUserTheme();

  // Set theme to user preference as soon as user is available
  useEffect(() => {
    if (userTheme) {
      setTheme(userTheme);
      setReady(true);
    } else if (!user && !isLoading) {
      setTheme('light'); // Only reset to light if fully logged out
      setReady(true);
    }
    // eslint-disable-next-line
  }, [userTheme, user, isLoading]);

  // Apply theme to <body>
  useEffect(() => {
    document.body.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Listen to system changes if user preference is 'system'
  useEffect(() => {
    if (user && user.preferences && user.preferences.theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e) => setTheme(e.matches ? 'dark' : 'light');
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [user]);

  // Toggle theme and update backend if logged in
  const toggleTheme = useCallback(() => {
    let newTheme;
    if (theme === 'dark') newTheme = 'light';
    else if (theme === 'light') newTheme = 'dark';
    else newTheme = getSystemTheme() ? 'dark' : 'light';
    setTheme(newTheme);
    if (user) {
      authService.updatePreferences({ theme: newTheme });
    }
  }, [theme, user]);

  if (!ready) return null;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
} 