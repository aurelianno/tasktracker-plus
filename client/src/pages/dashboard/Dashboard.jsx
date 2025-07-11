/*
  Dashboard.jsx
  Main dashboard page for TaskTracker+.
  - Provides an overview of personal and team tasks, stats, and recent activity.
  - Integrates with Redux for state management and backend API for data sync.
  - Displays KPIs, charts, and quick actions for productivity.
*/
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { getProfile, logout } from '../../store/slices/authSlice';
import { getTaskStats } from '../../store/slices/taskSlice';
import Navbar from '../../components/common/Navbar';
import { useTheme } from '../../ThemeContext.jsx';

const baseActionButton = {
  border: 'none',
  borderRadius: '10px',
  fontWeight: 600,
  fontSize: '14px',
  padding: '10px 20px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.08)',
  boxSizing: 'border-box'
};

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  
  const { user, isLoading, token } = useSelector((state) => state.auth);
  const { stats } = useSelector((state) => state.tasks);
  const { theme } = useTheme();
  const borderColor = theme === 'dark' ? '#4b5563' : '#d1d5db';

  // 🔥 AGGRESSIVE: Refresh stats every time we visit dashboard
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    dispatch(getProfile());
    dispatch(getTaskStats());
    setTimeout(() => setIsLoaded(true), 100);
  }, [token, navigate, dispatch, location.pathname]); // Added location.pathname

  // 🔥 NEW: Refresh stats when window gains focus (user returns from another tab)
  useEffect(() => {
    const handleFocus = () => {
      if (location.pathname === '/dashboard' && token) {
        dispatch(getTaskStats());
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [location.pathname, dispatch, token]);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Calculate task stats for display
  const taskStats = stats.stats.reduce((acc, stat) => {
    acc[stat._id] = stat.count;
    return acc;
  }, {});

  const completionRate = stats.total > 0 
    ? ((taskStats.completed || 0) / stats.total * 100).toFixed(1)
    : 0;

  // Professional styling object
  const styles = {
    container: {
      minHeight: '100vh',
      background: theme === 'dark' ? '#111215' : 'transparent',
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
    welcomeCard: {
      background: 'rgba(255,255,255,0.25)',
      backdropFilter: 'blur(16px)',
      borderRadius: '20px',
      marginBottom: '32px',
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.18)',
      boxShadow: '0 8px 32px 0 rgba(31,38,135,0.18)',
    },
    welcomeHeader: {
      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%)',
      padding: '32px',
      color: 'white',
      position: 'relative'
    },
    welcomeTitle: {
      fontSize: '28px',
      fontWeight: 'bold',
      margin: '0 0 8px 0'
    },
    welcomeSubtitle: {
      fontSize: '16px',
      opacity: 0.9,
      margin: 0
    },
    statusIndicator: {
      display: 'flex',
      alignItems: 'center',
      gap: '24px',
      marginTop: '24px',
      fontSize: '14px',
      opacity: 0.9
    },
    statusDot: {
      width: '8px',
      height: '8px',
      background: '#10b981',
      borderRadius: '50%',
      animation: 'pulse 2s infinite'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '24px',
      marginBottom: '32px'
    },
    statCard: {
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(20px)',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid rgba(255, 255, 255, 0.5)',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      cursor: 'pointer'
    },
    statHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '16px'
    },
    statLabel: {
      fontSize: '14px',
      color: '#64748b',
      fontWeight: '500',
      margin: '0 0 8px 0'
    },
    statValue: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#1e293b',
      margin: '0 0 8px 0'
    },
    statChange: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#10b981'
    },
    statIcon: {
      width: '48px',
      height: '48px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
      color: 'white'
    },
    progressBar: {
      width: '100%',
      height: '8px',
      background: '#e2e8f0',
      borderRadius: '4px',
      overflow: 'hidden',
      marginBottom: '8px'
    },
    progressFill: {
      height: '100%',
      background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
      borderRadius: '4px',
      transition: 'width 0.3s ease'
    },
    actionsGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 2fr',
      gap: '32px'
    },
    actionCard: {
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(20px)',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid rgba(255, 255, 255, 0.5)',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)'
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    actionButton: {
      ...baseActionButton,
      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      color: 'white',
      width: '100%',
      marginBottom: '12px',
      justifyContent: 'center'
    },
    primaryBtn: {
      ...baseActionButton,
      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      color: 'white',
      boxShadow: '0 8px 25px rgba(37, 99, 235, 0.3)'
    },
    secondaryBtn: {
      ...baseActionButton,
      background: 'white',
      color: '#374151',
      border: '2px solid #e5e7eb',
      width: '100%',
      marginBottom: '12px',
      justifyContent: 'center'
    },
    recentTasksList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    recentTaskItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 16px',
      background: 'rgba(248, 250, 252, 0.8)',
      borderRadius: '8px',
      transition: 'background 0.2s ease'
    },
    taskTitle: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#1e293b'
    },
    taskStatus: {
      fontSize: '12px',
      padding: '4px 8px',
      borderRadius: '16px',
      fontWeight: '500'
    },
    emptyState: {
      textAlign: 'center',
      padding: '64px 32px'
    },
    emptyIcon: {
      width: '80px',
      height: '80px',
      background: 'linear-gradient(135deg, #3b82f6 10%, #8b5cf6 90%)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 24px',
      fontSize: '32px'
    },
    emptyTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '12px'
    },
    emptyText: {
      color: '#64748b',
      marginBottom: '32px',
      lineHeight: 1.6
    },
    ctaButton: {
      ...baseActionButton,
      background: 'linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%)',
      color: 'white',
      boxShadow: '0 12px 30px rgba(37, 99, 235, 0.4)',
      transition: 'transform 0.2s ease'
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'todo': return '#6b7280';
      case 'in-progress': return '#2563eb';
      case 'completed': return '#10b981';
      default: return '#6b7280';
    }
  };

  if (isLoading) {
    return (
      <div style={{...styles.container, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '4px solid #e2e8f0',
          borderTop: '4px solid #2563eb',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="dashboard-root min-h-screen w-full bg-white text-black dark:bg-gray-900 dark:text-white">
      <Navbar user={user} handleLogout={handleLogout} />
      {/* Main Content */}
      <main style={styles.main}>
        {/* Welcome Section */}
        <div style={{ ...styles.welcomeCard, border: `1.5px solid ${borderColor}` }}>
          <div style={styles.welcomeHeader}>
            <h1 style={styles.welcomeTitle}>
              Welcome back, {user.name}! 👋
            </h1>
            <p style={styles.welcomeSubtitle}>
              Ready to accomplish extraordinary things today? You have {stats.total || 0} personal tasks to manage.
            </p>
            <div style={styles.statusIndicator}>
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <div style={styles.statusDot}></div>
                <span>All systems operational</span>
              </div>
              <span>Last updated: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Performance Metrics - NOW WITH REAL DATA */}
        <div style={styles.statsGrid}>
          <Link 
            to="/tasks"
            style={{...styles.statCard, textDecoration: 'none', color: 'inherit', cursor: 'pointer', border: `1.5px solid ${borderColor}`}}
            onMouseOver={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.08)';
            }}
          >
            <div style={styles.statHeader}>
              <div>
                <p style={styles.statLabel}>Total Tasks</p>
                <p style={styles.statValue}>{stats.total || 0}</p>
                <p style={styles.statChange}>
                  {stats.total > 0 ? '📋 Active workspace' : '🆕 Ready to start'}
                </p>
              </div>
              <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'}}>
                📋
              </div>
            </div>
          </Link>

          <Link 
            to="/tasks?status=completed"
            style={{...styles.statCard, textDecoration: 'none', color: 'inherit', cursor: 'pointer', border: `1.5px solid ${borderColor}`}}
            onMouseOver={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.08)';
            }}
          >
            <div style={styles.statHeader}>
              <div>
                <p style={styles.statLabel}>Completion Rate</p>
                <p style={styles.statValue}>{completionRate}%</p>
                <div style={styles.progressBar}>
                  <div style={{
                    ...styles.progressFill,
                    width: `${completionRate}%`
                  }}></div>
                </div>
                <p style={{...styles.statChange, color: completionRate > 50 ? '#10b981' : '#f59e0b'}}>
                  {completionRate > 80 ? 'Excellent!' : completionRate > 50 ? 'Good progress' : 'Keep going!'}
                </p>
              </div>
              <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}}>
                ✅
              </div>
            </div>
          </Link>

          <Link 
            to="/tasks?status=in-progress"
            style={{...styles.statCard, textDecoration: 'none', color: 'inherit', cursor: 'pointer', border: `1.5px solid ${borderColor}`}}
            onMouseOver={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.08)';
            }}
          >
            <div style={styles.statHeader}>
              <div>
                <p style={styles.statLabel}>In Progress</p>
                <p style={styles.statValue}>{taskStats['in-progress'] || 0}</p>
                <p style={{...styles.statChange, color: '#0ea5e9'}}>
                  {taskStats['in-progress'] > 0 ? 'Active work' : 'No active tasks'}
                </p>
              </div>
              <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)'}}>
                🔄
              </div>
            </div>
          </Link>

          <Link 
            to="/tasks?overdue=true"
            style={{...styles.statCard, textDecoration: 'none', color: 'inherit', cursor: 'pointer', border: `1.5px solid ${borderColor}`}}
            onMouseOver={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.08)';
            }}
          >
            <div style={styles.statHeader}>
              <div>
                <p style={styles.statLabel}>Overdue Tasks</p>
                <p style={{...styles.statValue, color: stats.overdue > 0 ? '#ef4444' : '#10b981'}}>
                  {stats.overdue || 0}
                </p>
                <p style={{...styles.statChange, color: stats.overdue > 0 ? '#ef4444' : '#10b981'}}>
                  {stats.overdue > 0 ? '⚠️ Needs attention' : '✅ All on track'}
                </p>
              </div>
              <div style={{
                ...styles.statIcon, 
                background: stats.overdue > 0 
                  ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              }}>
                {stats.overdue > 0 ? '⏰' : '🎯'}
              </div>
            </div>
          </Link>

          <Link 
            to="/tasks"
            state={{ showArchived: true }}
            style={{...styles.statCard, textDecoration: 'none', color: 'inherit', cursor: 'pointer', border: `1.5px solid ${borderColor}`}}
            onMouseOver={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.08)';
            }}
          >
            <div style={styles.statHeader}>
              <div>
                <p style={styles.statLabel}>Archived Tasks</p>
                <p style={{...styles.statValue, color: '#9ca3af'}}>{stats.archived || 0}</p>
                <p style={{...styles.statChange, color: '#9ca3af'}}>
                  {stats.archived > 0 ? '📦 Archived' : 'No archived tasks'}
                </p>
              </div>
              <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'}}>
                🗃️
              </div>
            </div>
          </Link>
        </div>

        {/* Actions Grid */}
        <div style={styles.actionsGrid}>
          <div style={{ ...styles.actionCard, border: `1.5px solid ${borderColor}` }}>
            <h3 style={styles.sectionTitle}>
              ⚡ Quick Actions
            </h3>
            <Link 
              to="/tasks?create=true"
              style={{...styles.actionButton, textDecoration: 'none'}}
              onMouseOver={e => {
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(37, 99, 235, 0.4)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.boxShadow = styles.primaryBtn.boxShadow;
              }}
            >
              ➕ Create New Task
            </Link>
            <button 
              style={{...styles.actionButton, ...styles.secondaryBtn}}
              onClick={() => navigate('/teams')}
              onMouseOver={e => {
                e.currentTarget.style.borderColor = '#3b82f6';
              }}
              onMouseOut={e => {
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            >
              👥 Invite Team Member
            </button>
            <button 
              style={{...styles.actionButton, ...styles.secondaryBtn, marginBottom: '0'}}
              onClick={() => navigate('/analytics')}
              onMouseOver={e => {
                e.currentTarget.style.borderColor = '#3b82f6';
              }}
              onMouseOut={e => {
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            >
              📊 View Analytics
            </button>
          </div>

          <div style={{ ...styles.actionCard, border: `1.5px solid ${borderColor}` }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
              <h3 style={{...styles.sectionTitle, marginBottom: 0}}>
                ⏰ Recent Tasks
              </h3>
              <Link 
                to="/tasks"
                style={{color: '#2563eb', background: 'none', border: 'none', fontWeight: '600', cursor: 'pointer', textDecoration: 'none'}}
              >
                View All →
              </Link>
            </div>
            
            {stats.recentTasks && stats.recentTasks.length > 0 ? (
              <div style={styles.recentTasksList}>
                {stats.recentTasks.map((task) => (
                  <div key={task._id} style={styles.recentTaskItem}>
                    <span style={styles.taskTitle}>{task.title}</span>
                    <span 
                      style={{
                        ...styles.taskStatus,
                        background: getStatusColor(task.status),
                        color: 'white'
                      }}
                    >
                      {task.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>⚡</div>
                <h3 style={styles.emptyTitle}>Ready to boost productivity?</h3>
                <p style={styles.emptyText}>
                  Create your first task and experience the power of enterprise-grade task management.
                </p>
                <Link 
                  to="/tasks?create=true"
                  style={{...styles.ctaButton, textDecoration: 'none', display: 'inline-block'}}
                  onMouseOver={e => e.target.style.transform = 'scale(1.05)'}
                  onMouseOut={e => e.target.style.transform = 'scale(1)'}
                >
                  Create Your First Task
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;