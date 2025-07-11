import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { inviteToTeam, clearError } from '../../store/slices/teamSlice';
import Notification from '../common/Notification';

const InviteModal = ({ isOpen, onClose, team }) => {
  const dispatch = useDispatch();
  const { isInviting, error } = useSelector(state => state.teams);
  const [formData, setFormData] = useState({
    email: '',
    role: 'collaborator'
  });
  const [notification, setNotification] = useState({ isOpen: false, type: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email.trim() || !team?._id) return;

    try {
      await dispatch(inviteToTeam({ 
        teamId: team._id, 
        inviteData: formData 
      })).unwrap();
      setFormData({ email: '', role: 'collaborator' });
      setNotification({
        isOpen: true,
        type: 'success',
        message: `Invitation sent successfully to ${formData.email}!`
      });
      onClose();
    } catch (error) {
      setNotification({
        isOpen: true,
        type: 'error',
        message: error || 'Failed to send invitation'
      });
    }
  };

  const handleClose = () => {
    setFormData({ email: '', role: 'collaborator' });
    dispatch(clearError());
    onClose();
  };

  const closeNotification = () => {
    setNotification({ ...notification, isOpen: false });
  };

  if (!isOpen || !team) return null;

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
      zIndex: 1000,
      padding: '20px'
    },
    modal: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      padding: '32px',
      width: '100%',
      maxWidth: '500px',
      maxHeight: '90vh',
      overflow: 'auto',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      border: '1px solid rgba(255, 255, 255, 0.6)'
    },
    header: {
      fontSize: '22px',
      fontWeight: '700',
      color: '#1e293b',
      marginBottom: '8px',
      textAlign: 'center',
      letterSpacing: '-0.5px'
    },
    subtitle: {
      fontSize: '15px',
      color: '#6b7280',
      marginBottom: '20px',
      textAlign: 'center'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '18px'
    },
    input: {
      padding: '12px 16px',
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      fontSize: '14px',
      outline: 'none',
      transition: 'border-color 0.2s ease',
      fontFamily: 'inherit'
    },
    select: {
      padding: '12px 16px',
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      fontSize: '14px',
      outline: 'none',
      background: 'white',
      cursor: 'pointer',
      fontFamily: 'inherit'
    },
    roleInfo: {
      padding: '12px',
      background: '#f8fafc',
      borderRadius: '8px',
      fontSize: '12px',
      color: '#64748b',
      border: '1px solid #e2e8f0'
    },
    error: {
      color: '#ef4444',
      fontSize: '14px',
      marginTop: '8px',
      textAlign: 'center'
    },
    buttons: {
      display: 'flex',
      gap: '12px',
      marginTop: '24px',
      justifyContent: 'flex-end'
    },
    button: {
      padding: '12px 20px',
      borderRadius: '10px',
      fontSize: '15px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      border: 'none',
      minWidth: '110px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    primaryButton: {
      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      color: 'white',
      borderRadius: '10px',
      boxShadow: '0 6px 20px rgba(37, 99, 235, 0.18)',
      border: 'none',
      transition: 'all 0.2s ease'
    },
    secondaryButton: {
      background: '#f3f4f6',
      color: '#6b7280',
      borderRadius: '10px',
      border: '1px solid #e5e7eb'
    }
  };

  return (
    <>
      <div style={styles.overlay} onClick={handleClose}>
        <div style={styles.modal} onClick={e => e.stopPropagation()}>
          <h2 style={styles.header}>Invite Team Member</h2>
          <p style={styles.subtitle}>
            Invite someone to join "{team.name}"
          </p>
          
          <form onSubmit={handleSubmit} style={styles.form}>
            <div>
              <input
                type="email"
                placeholder="Enter email address *"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={styles.input}
                required
              />
            </div>
            
            <div>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                style={styles.select}
              >
                <option value="collaborator">Collaborator</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div style={styles.roleInfo}>
              {formData.role === 'admin' ? (
                <div>
                  <strong>Admin permissions:</strong>
                  <br />• Can invite and remove team members
                  <br />• Can assign tasks to anyone
                  <br />• Can manage team settings
                  <br />• Full access to team analytics
                </div>
              ) : (
                <div>
                  <strong>Collaborator permissions:</strong>
                  <br />• Can view team tasks
                  <br />• Can create and edit own tasks
                  <br />• Can complete assigned tasks
                  <br />• Limited team access
                </div>
              )}
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <div style={styles.buttons}>
              <button
                type="button"
                onClick={handleClose}
                style={{ ...styles.button, ...styles.secondaryButton }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isInviting || !formData.email.trim()}
                style={{ 
                  ...styles.button, 
                  ...styles.primaryButton,
                  opacity: isInviting || !formData.email.trim() ? 0.6 : 1
                }}
              >
                {isInviting ? 'Sending...' : 'Send Invitation'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <Notification
        isOpen={notification.isOpen}
        type={notification.type}
        message={notification.message}
        onClose={closeNotification}
      />
    </>
  );
};

export default InviteModal;