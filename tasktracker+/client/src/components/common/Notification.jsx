import React, { useEffect } from 'react';

const Notification = ({ isOpen, type, message, onClose, autoClose = true }) => {
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Auto close after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose, autoClose]);

  if (!isOpen) return null;

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.2s ease-out'
    },
    notification: {
      background: 'white',
      borderRadius: '16px',
      padding: '24px',
      maxWidth: '400px',
      margin: '20px',
      boxShadow: '0 20px 25px rgba(0, 0, 0, 0.1)',
      border: type === 'success' ? '2px solid #10b981' : '2px solid #ef4444',
      animation: 'slideIn 0.3s ease-out'
    },
    icon: {
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 16px',
      fontSize: '24px',
      background: type === 'success' 
        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
        : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: 'white'
    },
    message: {
      textAlign: 'center',
      fontSize: '16px',
      fontWeight: '500',
      color: '#1e293b',
      marginBottom: '20px',
      lineHeight: '1.5'
    },
    button: {
      width: '100%',
      padding: '12px',
      background: type === 'success' 
        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
        : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'transform 0.2s ease'
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.notification} onClick={e => e.stopPropagation()}>
        <div style={styles.icon}>
          {type === 'success' ? '✓' : '✕'}
        </div>
        <div style={styles.message}>
          {message}
        </div>
        <button
          style={styles.button}
          onClick={onClose}
          onMouseOver={e => e.target.style.transform = 'scale(1.02)'}
          onMouseOut={e => e.target.style.transform = 'scale(1)'}
        >
          {type === 'success' ? 'Great!' : 'Got it'}
        </button>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { 
            opacity: 0;
            transform: translateY(-20px) scale(0.9);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default Notification;