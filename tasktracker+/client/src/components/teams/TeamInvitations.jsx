/*
  TeamInvitations.jsx
  Component for managing and displaying team invitations in TaskTracker+.
  - Allows users to view, accept, or decline team invitations.
  - Integrates with Redux and backend API for invitation management.
  - Provides a user-friendly UI for team onboarding.
*/

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getInvitations, acceptInvitation, declineInvitation } from '../../store/slices/teamSlice';
import Notification from '../common/Notification';
import { useTheme } from '../../ThemeContext.jsx';

const TeamInvitations = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { invitations, isLoading } = useSelector(state => state.teams);
  const [notification, setNotification] = useState({ isOpen: false, type: '', message: '' });
  const { theme } = useTheme();
  const borderColor = theme === 'dark' ? '#4b5563' : '#d1d5db';

  useEffect(() => {
    if (isOpen) {
      dispatch(getInvitations());
    }
  }, [isOpen, dispatch]);

  const handleAcceptInvitation = async (invitationId) => {
    try {
      await dispatch(acceptInvitation(invitationId)).unwrap();
      setNotification({
        isOpen: true,
        type: 'success',
        message: 'Invitation accepted! You are now part of the team.'
      });
    } catch (error) {
      setNotification({
        isOpen: true,
        type: 'error',
        message: error || 'Failed to accept invitation'
      });
    }
  };

  const handleDeclineInvitation = async (invitationId) => {
    try {
      await dispatch(declineInvitation(invitationId)).unwrap();
      setNotification({
        isOpen: true,
        type: 'success',
        message: 'Invitation declined.'
      });
    } catch (error) {
      setNotification({
        isOpen: true,
        type: 'error',
        message: error || 'Failed to decline invitation'
      });
    }
  };

  const closeNotification = () => {
    setNotification({ ...notification, isOpen: false });
  };

  if (!isOpen) return null;

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modal: {
      background: 'white',
      borderRadius: '16px',
      padding: '24px',
      width: '100%',
      maxWidth: '500px',
      margin: '20px',
      boxShadow: '0 20px 25px rgba(0, 0, 0, 0.1)',
      maxHeight: '80vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      paddingBottom: '16px',
      borderBottom: '1px solid #e5e7eb'
    },
    title: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#1e293b',
      margin: 0
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '24px',
      cursor: 'pointer',
      color: '#6b7280',
      padding: '4px',
      borderRadius: '4px',
      transition: 'background-color 0.2s ease'
    },
    content: {
      flex: 1,
      overflow: 'auto'
    },
    invitationsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    },
    invitationCard: {
      padding: '20px',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      background: '#f8fafc',
      transition: 'all 0.2s ease'
    },
    teamInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '12px'
    },
    teamIcon: {
      width: '40px',
      height: '40px',
      borderRadius: '10px',
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '16px',
      fontWeight: 'bold'
    },
    teamDetails: {
      flex: 1
    },
    teamName: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#1e293b',
      margin: 0
    },
    teamDescription: {
      fontSize: '14px',
      color: '#6b7280',
      margin: '4px 0 0 0'
    },
    inviterInfo: {
      fontSize: '12px',
      color: '#6b7280',
      marginBottom: '16px'
    },
    actions: {
      display: 'flex',
      gap: '12px'
    },
    button: {
      flex: 1,
      padding: '10px 16px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      border: 'none'
    },
    acceptButton: {
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: 'white'
    },
    declineButton: {
      background: '#f3f4f6',
      color: '#6b7280'
    },
    emptyState: {
      textAlign: 'center',
      padding: '40px 20px',
      color: '#6b7280'
    },
    emptyIcon: {
      fontSize: '48px',
      marginBottom: '16px'
    },
    emptyTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '8px'
    },
    emptySubtitle: {
      fontSize: '14px',
      color: '#6b7280'
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
    <>
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.modal} onClick={e => e.stopPropagation()}>
          <div style={styles.header}>
            <h2 style={styles.title}>Team Invitations</h2>
            <button
              style={styles.closeButton}
              onClick={onClose}
              onMouseOver={e => e.target.style.backgroundColor = '#f3f4f6'}
              onMouseOut={e => e.target.style.backgroundColor = 'transparent'}
            >
              ×
            </button>
          </div>

          <div style={styles.content}>
            {isLoading ? (
              <div style={styles.loadingSpinner}></div>
            ) : invitations.length > 0 ? (
              <div style={styles.invitationsList}>
                {invitations.map(invitation => (
                  <div key={invitation._id} style={styles.invitationCard}>
                    <div style={styles.teamInfo}>
                      <div style={styles.teamIcon}>
                        {invitation.teamId?.name?.charAt(0).toUpperCase() || 'T'}
                      </div>
                      <div style={styles.teamDetails}>
                        <h3 style={styles.teamName}>
                          {invitation.teamId?.name || 'Team'}
                        </h3>
                        {invitation.teamId?.description && (
                          <p style={styles.teamDescription}>
                            {invitation.teamId.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div style={styles.inviterInfo}>
                      Invited by {invitation.invitedBy?.name || 'Unknown'} • {new Date(invitation.invitedAt).toLocaleDateString()}
                    </div>

                    <div style={styles.actions}>
                      <button
                        style={{ ...styles.button, ...styles.acceptButton }}
                        onClick={() => handleAcceptInvitation(invitation._id)}
                        onMouseOver={e => e.target.style.transform = 'scale(1.02)'}
                        onMouseOut={e => e.target.style.transform = 'scale(1)'}
                      >
                        ✓ Accept
                      </button>
                      <button
                        style={{ ...styles.button, ...styles.declineButton }}
                        onClick={() => handleDeclineInvitation(invitation._id)}
                        onMouseOver={e => e.target.style.backgroundColor = '#e5e7eb'}
                        onMouseOut={e => e.target.style.backgroundColor = '#f3f4f6'}
                      >
                        ✕ Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ ...styles.emptyState, border: `1.5px solid ${borderColor}`, borderRadius: 16, background: '#fff' }}>
                <div style={styles.emptyIcon}>📬</div>
                <h3 style={styles.emptyTitle}>No pending invitations</h3>
                <p style={styles.emptySubtitle}>
                  You don't have any team invitations at the moment
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Notification
        isOpen={notification.isOpen}
        type={notification.type}
        message={notification.message}
        onClose={closeNotification}
      />

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default TeamInvitations;