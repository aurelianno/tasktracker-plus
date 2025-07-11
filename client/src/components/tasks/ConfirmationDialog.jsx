/*
  ConfirmationDialog.jsx
  Modal dialog component for confirming destructive actions in TaskTracker+.
  - Used for confirming task deletion, archiving, and other critical actions.
  - Provides clear UI/UX for user safety and error prevention.
*/
import { useState } from 'react';

const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Delete", cancelText = "Cancel", type = "danger" }) => {
  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
    }
  };

  if (!isOpen) return null;

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    },
    modal: {
      background: 'rgba(255, 255, 255, 0.98)',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      padding: '32px',
      width: '100%',
      maxWidth: '400px',
      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4)',
      border: '1px solid rgba(255, 255, 255, 0.8)',
      transform: 'scale(1)',
      animation: 'modalSlideIn 0.3s ease-out'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '20px'
    },
    icon: {
      fontSize: '24px',
      color: type === 'danger' ? '#ef4444' : '#f59e0b'
    },
    title: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#1e293b',
      margin: 0
    },
    message: {
      fontSize: '16px',
      color: '#64748b',
      lineHeight: 1.5,
      marginBottom: '32px'
    },
    buttonRow: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end'
    },
    button: {
      padding: '12px 24px',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      border: 'none',
      minWidth: '100px'
    },
    cancelButton: {
      background: 'white',
      color: '#374151',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      transition: 'background 0.2s, color 0.2s, border 0.2s',
      fontWeight: 600,
    },
    confirmButton: {
      background: type === 'danger' 
        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
        : type === 'info'
        ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
        : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      color: 'white',
      borderRadius: '8px',
      border: 'none',
      boxShadow: type === 'danger' 
        ? '0 4px 12px rgba(239, 68, 68, 0.2)'
        : type === 'info'
        ? '0 4px 12px rgba(37, 99, 235, 0.2)'
        : '0 4px 12px rgba(245, 158, 11, 0.2)',
      fontWeight: 600,
      transition: 'background 0.2s, color 0.2s, box-shadow 0.2s',
    },
    confirmButtonDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed'
    },
    loadingSpinner: {
      width: '16px',
      height: '16px',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      borderTop: '2px solid white',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginRight: '8px'
    }
  };

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <span style={styles.icon}>
            {type === 'danger' ? '⚠️' : '❓'}
          </span>
          <h3 style={styles.title}>
            {title}
          </h3>
        </div>

        <p style={styles.message}>
          {message}
        </p>

        <div style={styles.buttonRow}>
          <button
            style={styles.cancelButton}
            onClick={onClose}
            onMouseOver={e => (e.target.style.background = '#f3f4f6')}
            onMouseOut={e => (e.target.style.background = 'white')}
          >
            {cancelText}
          </button>
          <button
            style={styles.confirmButton}
            onClick={handleConfirm}
            onMouseOver={e => {
              if (type === 'danger') e.target.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
              else if (type === 'info') e.target.style.background = 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)';
              else e.target.style.background = 'linear-gradient(135deg, #d97706 0%, #b45309 100%)';
            }}
            onMouseOut={e => {
              if (type === 'danger') e.target.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
              else if (type === 'info') e.target.style.background = 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)';
              else e.target.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes modalSlideIn {
          0% { 
            transform: scale(0.9); 
            opacity: 0; 
          }
          100% { 
            transform: scale(1); 
            opacity: 1; 
          }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ConfirmationDialog;