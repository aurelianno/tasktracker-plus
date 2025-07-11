import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createTeam, clearError } from '../../store/slices/teamSlice';

const CreateTeamModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { isCreating, error } = useSelector(state => state.teams);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      await dispatch(createTeam(formData)).unwrap();
      setFormData({ name: '', description: '' });
      onClose();
    } catch (error) {
      // Error is handled by Redux
    }
  };

  const handleClose = () => {
    setFormData({ name: '', description: '' });
    dispatch(clearError());
    onClose();
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
      maxWidth: '400px',
      margin: '20px',
      boxShadow: '0 20px 25px rgba(0, 0, 0, 0.1)'
    },
    header: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '16px'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    },
    input: {
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      fontSize: '14px',
      outline: 'none',
      transition: 'border-color 0.2s ease'
    },
    textarea: {
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      fontSize: '14px',
      outline: 'none',
      resize: 'vertical',
      minHeight: '80px',
      fontFamily: 'inherit'
    },
    error: {
      color: '#ef4444',
      fontSize: '14px',
      marginTop: '8px'
    },
    buttons: {
      display: 'flex',
      gap: '12px',
      marginTop: '24px'
    },
    button: {
      padding: '12px 20px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      border: 'none',
      flex: 1
    },
    primaryButton: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      color: 'white'
    },
    secondaryButton: {
      background: '#f3f4f6',
      color: '#6b7280'
    }
  };

  return (
    <div style={styles.overlay} onClick={handleClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <h2 style={styles.header}>Create New Team</h2>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div>
            <input
              type="text"
              placeholder="Team name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={styles.input}
              maxLength={50}
              required
            />
          </div>
          
          <div>
            <textarea
              placeholder="Team description (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={styles.textarea}
              maxLength={200}
            />
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
              disabled={isCreating || !formData.name.trim()}
              style={{ 
                ...styles.button, 
                ...styles.primaryButton,
                opacity: isCreating || !formData.name.trim() ? 0.6 : 1
              }}
            >
              {isCreating ? 'Creating...' : 'Create Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTeamModal;