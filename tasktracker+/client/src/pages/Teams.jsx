/*
  Teams.jsx
  Teams management page for TaskTracker+.
  - Allows users to view, create, and manage teams and team tasks.
  - Integrates with Redux for state management and backend API for data sync.
  - Handles team selection, invitations, and team-specific analytics.
*/
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserTeams, setCurrentTeam, getInvitations } from '../store/slices/teamSlice';
import Navbar from '../components/common/Navbar';
import CreateTeamModal from '../components/teams/CreateTeamModal';
import TeamMemberList from '../components/teams/TeamMemberList';
import TeamInvitations from '../components/teams/TeamInvitations';
import { logout } from '../store/slices/authSlice';
import { useLocation, useNavigate } from 'react-router-dom';
import TeamTasksTab from '../components/teams/TeamTasksTab';
import teamAPI from '../services/teamAPI';
import TeamAnalyticsTab from '../components/teams/TeamAnalyticsTab';
import { useTheme } from '../ThemeContext';

const TABS = [
  { key: 'overview', label: 'Team Overview' },
  { key: 'tasks', label: 'Team Tasks' },
  { key: 'analytics', label: 'Team Analytics' },
  { key: 'invitations', label: 'Invitations' }
];

const tabRoutes = {
  overview: '/teams',
  tasks: '/teams/tasks',
  analytics: '/teams/analytics',
  invitations: '/teams/invitations',
};

const getTabFromPath = (pathname) => {
  if (pathname.endsWith('/tasks')) return 'tasks';
  if (pathname.endsWith('/analytics')) return 'analytics';
  if (pathname.endsWith('/invitations')) return 'invitations';
  return 'overview';
};

const Teams = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { teams, currentTeam, isLoading, invitations } = useSelector((state) => state.teams);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState(getTabFromPath(location.pathname));
  const { theme } = useTheme();
  const borderColor = theme === 'dark' ? '#4b5563' : '#d1d5db';

  // Use Redux for selectedTeamId
  const selectedTeamId = currentTeam?._id || null;

  useEffect(() => {
    dispatch(getUserTeams());
    dispatch(getInvitations());
    setSelectedTab(getTabFromPath(location.pathname));
  }, [dispatch, location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleTeamSelect = (team) => {
    dispatch(setCurrentTeam(team));
  };

  const handleTabClick = (tabKey) => {
    setSelectedTab(tabKey);
    navigate(tabRoutes[tabKey]);
  };

  const handleTeamUpdate = async () => {
    if (currentTeam && currentTeam._id) {
      const { data } = await teamAPI.getTeam(currentTeam._id);
      dispatch(setCurrentTeam(data.team || data));
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      setIsLoading(true);
      
      const response = await teamAPI.post(`/api/tasks/teams/${selectedTeam._id}`, taskData);
      
      setTeamTasks(prevTasks => {
        const updatedTasks = [response.data, ...prevTasks];
        return updatedTasks;
      });

      setShowCreateModal(false);
      setNotification({ type: 'success', message: 'Task created successfully!' });
    } catch (error) {
      setNotification({ type: 'error', message: error.response?.data?.message || 'Error creating task' });
    } finally {
      setIsLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: theme === 'dark' ? '#111215' : 'transparent',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    header: {
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(20px)',
      borderRadius: '16px',
      padding: '24px',
      margin: '24px auto',
      maxWidth: '1200px',
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
    content: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 24px 32px'
    },
    tabNav: {
      display: 'flex',
      gap: '24px',
      borderBottom: '2px solid #e5e7eb',
      marginBottom: '32px',
      marginTop: '16px',
    },
    tabButton: {
      background: 'none',
      border: 'none',
      fontSize: '16px',
      fontWeight: 600,
      color: '#64748b',
      padding: '12px 0',
      cursor: 'pointer',
      borderBottom: '2px solid transparent',
      transition: 'color 0.2s, border-color 0.2s',
    },
    tabButtonActive: {
      color: '#2563eb',
      borderBottom: '2px solid #2563eb',
    },
    actionsBar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px',
      padding: '16px 20px',
      background: 'rgba(255, 255, 255, 0.9)',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
    },
    rightActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    invitationsButton: {
      position: 'relative',
      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      color: 'white',
      border: 'none',
      padding: '10px 16px',
      borderRadius: '8px',
      fontWeight: '500',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'transform 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    invitationsBadge: {
      position: 'absolute',
      top: '-6px',
      right: '-6px',
      background: '#ef4444',
      color: 'white',
      borderRadius: '50%',
      width: '20px',
      height: '20px',
      fontSize: '11px',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '2px solid white'
    },
    createButton: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      color: 'white',
      border: 'none',
      padding: '12px 20px',
      borderRadius: '8px',
      fontWeight: '500',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'transform 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    teamsGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '16px'
    },
    mainContent: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '32px',
      alignItems: 'start'
    },
    leftColumn: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    },
    rightColumn: {
      position: 'sticky',
      top: '24px'
    },
    selectTeamPrompt: {
      background: 'white',
      borderRadius: '16px',
      padding: '48px 24px',
      textAlign: 'center',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
      border: '2px dashed #e5e7eb'
    },
    teamCard: {
      background: 'white',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
      border: '1px solid #e5e7eb',
      transition: 'all 0.2s ease',
      cursor: 'pointer'
    },
    teamCardActive: {
      border: '2px solid #3b82f6',
      boxShadow: '0 8px 25px rgba(59, 130, 246, 0.15)'
    },
    teamIcon: {
      width: '48px',
      height: '48px',
      borderRadius: '12px',
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '16px'
    },
    teamName: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '8px'
    },
    teamDescription: {
      fontSize: '14px',
      color: '#6b7280',
      marginBottom: '16px',
      lineHeight: '1.5'
    },
    teamStats: {
      display: 'flex',
      gap: '16px',
      fontSize: '12px',
      color: '#6b7280'
    },
    stat: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    emptyState: {
      textAlign: 'center',
      padding: '48px 24px',
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
    },
    emptyIcon: {
      fontSize: '48px',
      marginBottom: '16px'
    },
    emptyTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '8px'
    },
    emptySubtitle: {
      fontSize: '14px',
      color: '#6b7280',
      marginBottom: '24px'
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

  return (
    <div className="teams-root min-h-screen w-full" style={styles.container}>
      <Navbar user={user} handleLogout={handleLogout} />
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Team Management</h1>
        <p style={styles.headerSubtitle}>
          Create and manage your teams, invite collaborators, and organize your work
        </p>
      </div>
      <div style={styles.content}>
        {/* Tab Navigation */}
        <div style={styles.tabNav}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              style={{
                ...styles.tabButton,
                ...(selectedTab === tab.key ? styles.tabButtonActive : {})
              }}
              onClick={() => handleTabClick(tab.key)}
            >
              {tab.label}
              {tab.key === 'invitations' && invitations && invitations.length > 0 && (
                <span style={{
                  marginLeft: 8,
                  background: '#ef4444',
                  color: 'white',
                  borderRadius: '50%',
                  padding: '2px 8px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  verticalAlign: 'middle',
                }}>{invitations.length}</span>
              )}
            </button>
          ))}
        </div>
        {/* Tab Content */}
        {selectedTab === 'overview' && (
          isLoading ? (
            <div style={styles.loadingSpinner}></div>
          ) : teams.length > 0 ? (
            <div style={styles.mainContent}>
              {/* Left Column - Teams List */}
              <div style={styles.leftColumn}>
                <div style={{ ...styles.actionsBar, border: `1.5px solid ${borderColor}` }}>
                  <h3 style={{ margin: 0, color: '#1e293b', fontSize: '16px', fontWeight: '600' }}>
                    Your Teams ({teams.length})
                  </h3>
                  <button
                    style={styles.createButton}
                    onClick={() => setIsCreateModalOpen(true)}
                    onMouseOver={e => e.target.style.transform = 'scale(1.05)'}
                    onMouseOut={e => e.target.style.transform = 'scale(1)'}
                  >
                    <span>➕</span>
                    Create Team
                  </button>
                </div>
                <div style={styles.teamsGrid}>
                  {teams.map(team => (
                    <div
                      key={team._id}
                      style={{
                        ...styles.teamCard,
                        ...(selectedTeamId === team._id ? styles.teamCardActive : {}),
                        border: `1.5px solid ${borderColor}`
                      }}
                      onClick={() => handleTeamSelect(team)}
                      onMouseOver={e => {
                        if (selectedTeamId !== team._id) {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
                        }
                      }}
                      onMouseOut={e => {
                        if (selectedTeamId !== team._id) {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
                        }
                      }}
                    >
                      <div style={styles.teamIcon}>
                        {team.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={styles.teamName}>{team.name}</div>
                      {team.description && (
                        <div style={styles.teamDescription}>{team.description}</div>
                      )}
                      <div style={styles.teamStats}>
                        <div style={styles.stat}>
                          <span>👥</span>
                          <span>{team.memberCount || 0} member{team.memberCount !== 1 ? 's' : ''}</span>
                        </div>
                        <div style={styles.stat}>
                          <span>📅</span>
                          <span>Created {new Date(team.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      {selectedTeamId === team._id && (
                        <div style={{
                          marginTop: '12px',
                          padding: '8px 12px',
                          background: 'rgba(59, 130, 246, 0.1)',
                          borderRadius: '6px',
                          color: '#2563eb',
                          fontSize: '12px',
                          fontWeight: '500',
                          textAlign: 'center'
                        }}>
                          ✓ Selected
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              {/* Right Column - Team Details */}
              <div style={styles.rightColumn}>
                {currentTeam ? (
                  <TeamMemberList team={currentTeam} onTeamUpdate={handleTeamUpdate} />
                ) : (
                  <div style={styles.selectTeamPrompt}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>👈</div>
                    <h3 style={{ color: '#1e293b', marginBottom: '8px' }}>Select a team</h3>
                    <p style={{ color: '#6b7280', fontSize: '14px' }}>
                      Choose a team from the left to view members and manage settings
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>👥</div>
              <h3 style={styles.emptyTitle}>No teams yet</h3>
              <p style={styles.emptySubtitle}>
                Create your first team to start collaborating with others
              </p>
              <button
                style={styles.createButton}
                onClick={() => setIsCreateModalOpen(true)}
              >
                <span>➕</span>
                Create Your First Team
              </button>
            </div>
          )
        )}
        {selectedTab === 'tasks' && (
          <TeamTasksTab selectedTeamId={selectedTeamId} onTeamSelect={handleTeamSelect} onTeamUpdate={handleTeamUpdate} />
        )}
        {selectedTab === 'analytics' && (
          <TeamAnalyticsTab selectedTeamId={selectedTeamId} />
        )}
        {selectedTab === 'invitations' && (
          invitations && invitations.length > 0 ? (
            <div style={{ marginTop: 32 }}>
              <TeamInvitations isOpen={true} onClose={() => {}} />
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '48px 24px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: `1.5px solid ${borderColor}` }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
              <h3 style={{ color: '#1e293b', marginBottom: '8px' }}>No invitations</h3>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>
                You have no pending team invitations at this time.
              </p>
            </div>
          )
        )}
      </div>
      {/* Create Team Modal */}
      <CreateTeamModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Teams;