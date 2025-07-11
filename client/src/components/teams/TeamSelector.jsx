/*
  TeamSelector.jsx
  Component for selecting the current team in TaskTracker+.
  - Allows users to switch between teams for analytics and task management.
  - Integrates with Redux for current team state and backend for team info.
  - Provides a user-friendly dropdown or list UI.
*/

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getUserTeams, setCurrentTeam } from '../../store/slices/teamSlice';
import { useTheme } from '../../ThemeContext.jsx';

const TeamSelector = () => {
  const dispatch = useDispatch();
  const { teams, currentTeam, isLoading } = useSelector(state => state.teams);
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    dispatch(getUserTeams());
  }, [dispatch]);

  const handleTeamSelect = (team) => {
    dispatch(setCurrentTeam(team));
    setIsOpen(false);
  };

  const styles = {
    container: {
      position: 'relative',
      display: 'inline-block'
    },
    selector: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 12px',
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      color: 'white',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s ease'
    },
    dropdown: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      marginTop: '4px',
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
      border: '1px solid #e5e7eb',
      zIndex: 1000,
      minWidth: '200px'
    },
    dropdownItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 16px',
      cursor: 'pointer',
      fontSize: '14px',
      color: '#374151',
      borderBottom: '1px solid #f3f4f6',
      transition: 'background-color 0.2s ease'
    },
    teamIcon: {
      width: '24px',
      height: '24px',
      borderRadius: '6px',
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '12px',
      fontWeight: 'bold'
    },
    noTeams: {
      padding: '16px',
      textAlign: 'center',
      color: '#6b7280',
      fontSize: '14px'
    }
  };

  if (isLoading) {
    return (
      <div style={styles.selector}>
        <div>Loading teams...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div 
        style={styles.selector}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
      >
        {currentTeam ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={styles.teamIcon}>
                {currentTeam.name.charAt(0).toUpperCase()}
              </div>
              <span style={{ color: theme === 'dark' ? '#f3f4f6' : '#1e293b', fontWeight: 600 }}>{currentTeam.name}</span>
              <span style={{ fontSize: '12px', opacity: 0.8, marginLeft: 4 }}>▼</span>
            </div>
          </>
        ) : (
          <>
            <span>👥</span>
            <span>Select Team</span>
            <span style={{ fontSize: '12px', opacity: 0.8 }}>▼</span>
          </>
        )}
      </div>

      {isOpen && (
        <div style={styles.dropdown}>
          {teams.length > 0 ? (
            teams.map(team => (
              <div
                key={team._id}
                style={styles.dropdownItem}
                onClick={() => handleTeamSelect(team)}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div style={styles.teamIcon}>
                  {team.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: '500' }}>{team.name}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {team.memberCount} member{team.memberCount !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={styles.noTeams}>
              No teams yet. Create your first team!
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeamSelector;