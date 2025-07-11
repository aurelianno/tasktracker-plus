import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import TeamSelector from '../teams/TeamSelector';
import { getInvitations } from '../../store/slices/teamSlice';
import { useSelector as useReduxSelector } from 'react-redux';
import { useTheme } from '../../ThemeContext.jsx';

const Navbar = ({ user, handleLogout }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { invitations } = useSelector((state) => state.teams);
  const { currentTeam } = useReduxSelector(state => state.teams);
  const { theme } = useTheme();

  useEffect(() => {
    // Fetch invitations to show count in navbar
    dispatch(getInvitations());
  }, [dispatch]);

  const styles = {
    navbar: {
      background: theme === 'dark' ? '#23272f' : 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderBottom: theme === 'dark' ? '1px solid #4b5563' : '1px solid rgba(226, 232, 240, 0.8)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      width: '100%',
    },
    navContent: {
      padding: '0 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: '64px',
      width: '100%',
      margin: '0 auto',
      maxWidth: '1200px',
      flexWrap: 'wrap',
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
      color: theme === 'dark' ? '#f3f4f6' : '#1e293b',
      margin: 0
    },
    enterpriseText: {
      fontSize: '11px',
      color: theme === 'dark' ? '#a1a1aa' : '#64748b',
      fontWeight: '500',
      margin: 0
    },
    centerSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '32px'
    },
    navLinks: {
      display: 'flex',
      gap: '32px',
      listStyle: 'none',
      margin: 0,
      padding: 0
    },
    navLink: {
      color: theme === 'dark' ? '#f3f4f6' : '#475569',
      textDecoration: 'none',
      fontWeight: '500',
      fontSize: '14px',
      transition: 'color 0.2s ease',
      position: 'relative'
    },
    navLinkActive: {
      color: theme === 'dark' ? '#60a5fa' : '#2563eb',
      fontWeight: '600',
      borderBottom: '2px solid #2563eb',
      paddingBottom: '2px'
    },
    invitationBadge: {
      position: 'absolute',
      top: '-8px',
      right: '-8px',
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: 'white',
      borderRadius: '50%',
      width: '16px',
      height: '16px',
      fontSize: '10px',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'pulse 2s infinite'
    },
    teamSelectorWrapper: {
      display: 'flex',
      alignItems: 'center'
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
      color: theme === 'dark' ? '#f3f4f6' : '#1e293b',
      margin: 0
    },
    userRole: {
      fontSize: '12px',
      color: theme === 'dark' ? '#a1a1aa' : '#64748b',
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
    }
  };

  const pendingInvitationsCount = invitations?.length || 0;

  return (
    <nav style={styles.navbar}>
      <div style={styles.navContent}>
        {/* Logo Section */}
        <div style={styles.logo}>
          <div style={styles.logoIcon}>T</div>
          <div>
            <h1 style={styles.brandText}>TaskTracker+</h1>
            <p style={styles.enterpriseText}>Enterprise Edition</p>
          </div>
        </div>

        {/* Center Section - Nav Links + Team Selector */}
        <div style={styles.centerSection}>
          <ul style={styles.navLinks}>
            <li><Link to="/dashboard" style={location.pathname === '/dashboard' ? { ...styles.navLink, ...styles.navLinkActive } : styles.navLink}>Dashboard</Link></li>
            <li><Link to="/tasks" style={location.pathname.startsWith('/tasks') ? { ...styles.navLink, ...styles.navLinkActive } : styles.navLink}>Tasks</Link></li>
            <li><Link to="/analytics" style={location.pathname === '/analytics' ? { ...styles.navLink, ...styles.navLinkActive } : styles.navLink}>Analytics</Link></li>
            <li>
              <Link 
                to="/teams" 
                style={location.pathname === '/teams' ? { ...styles.navLink, ...styles.navLinkActive } : styles.navLink}
              >
                Teams
              </Link>
            </li>
            <li><Link to="/settings" style={location.pathname === '/settings' ? { ...styles.navLink, ...styles.navLinkActive } : styles.navLink}>Settings</Link></li>
          </ul>
          
          {/* Team Selector - positioned between nav links and user section */}
          <div style={styles.teamSelectorWrapper}>
            <TeamSelector />
          </div>
        </div>

        {/* User Section */}
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

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;