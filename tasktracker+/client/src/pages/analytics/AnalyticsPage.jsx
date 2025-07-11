/*
  AnalyticsPage.jsx
  Team analytics dashboard for TaskTracker+.
  - Visualizes team performance, workload, and trends for selected team.
  - Integrates with Redux and backend analytics API for real-time team data.
  - Displays KPIs, charts, insights, and member performance.
*/

import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getProfile, logout } from '../../store/slices/authSlice';
import { getTaskStats, getTasks } from '../../store/slices/taskSlice';
import TaskAnalytics from '../../components/analytics/TaskAnalytics';
import { useTheme } from '../../ThemeContext.jsx';

const AnalyticsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const { tasks, stats, isLoading } = useSelector((state) => state.tasks);
  const { theme } = useTheme();
  const borderColor = theme === 'dark' ? '#4b5563' : '#d1d5db';

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    dispatch(getProfile());
    dispatch(getTaskStats());
    dispatch(getTasks());
  }, [token, navigate, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #e8f4f8 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    navbar: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
    },
    navContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: '64px'
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    logoIcon: {
      width: '40px',
      height: '40px',
      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 'bold',
      fontSize: '18px',
      boxShadow: '0 8px 25px rgba(37, 99, 235, 0.3)'
    },
    brandText: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#1e293b',
      margin: 0
    },
    enterpriseText: {
      fontSize: '11px',
      color: '#64748b',
      fontWeight: '500',
      margin: 0
    },
    navLinks: {
      display: 'flex',
      gap: '32px',
      listStyle: 'none',
      margin: 0,
      padding: 0
    },
    navLink: {
      color: '#475569',
      textDecoration: 'none',
      fontWeight: '500',
      fontSize: '14px',
      transition: 'color 0.2s ease'
    },
    navLinkActive: {
      color: '#2563eb',
      fontWeight: '600',
      borderBottom: '2px solid #2563eb',
      paddingBottom: '2px'
    },
    userSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    userInfo: {
      textAlign: 'right'
    },
    userName: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#1e293b',
      margin: 0
    },
    userRole: {
      fontSize: '12px',
      color: '#64748b',
      margin: 0
    },
    userAvatar: {
      width: '36px',
      height: '36px',
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: '600',
      fontSize: '14px',
      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
    },
    logoutBtn: {
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '8px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
    },
    main: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '32px 24px'
    },
    header: {
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(20px)',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '24px',
      border: '1px solid rgba(255, 255, 255, 0.5)',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)'
    },
    headerTitle: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#1e293b',
      margin: '0 0 8px 0'
    },
    headerSubtitle: {
      fontSize: '16px',
      color: '#64748b',
      margin: 0
    },
    loadingSpinner: {
      width: '40px',
      height: '40px',
      border: '4px solid #e5e7eb',
      borderTop: '4px solid #2563eb',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '40px auto'
    }
  };

  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingSpinner}></div>
      </div>
    );
  }

  return (
    <div className="analytics-root min-h-screen w-full bg-white text-black dark:bg-gray-900 dark:text-white">
      {/* Navigation */}
      <nav style={styles.navbar}>
        <div style={styles.navContent}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>T</div>
            <div>
              <h1 style={styles.brandText}>TaskTracker+</h1>
              <p style={styles.enterpriseText}>Enterprise Edition</p>
            </div>
          </div>

          <ul style={styles.navLinks}>
            <li><a href="/dashboard" style={styles.navLink}>Dashboard</a></li>
            <li><a href="/tasks" style={styles.navLink}>Tasks</a></li>
            <li><a href="/analytics" style={{...styles.navLink, ...styles.navLinkActive}}>Analytics</a></li>
            <li><a href="#" style={styles.navLink}>Teams</a></li>
            <li><a href="#" style={styles.navLink}>Settings</a></li>
          </ul>

          <div style={styles.userSection}>
            <div style={styles.userInfo}>
              <p style={styles.userName}>{user?.name}</p>
              <p style={styles.userRole}>Team Administrator</p>
            </div>
            <div style={styles.userAvatar}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <button 
              style={styles.logoutBtn}
              onClick={handleLogout}
              onMouseOver={e => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={e => e.target.style.transform = 'scale(1)'}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>Analytics Dashboard</h1>
          <p style={styles.headerSubtitle}>
            Gain insights into your task management performance and productivity trends
          </p>
        </div>

        <TaskAnalytics tasks={tasks} stats={stats} />
      </main>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AnalyticsPage; 