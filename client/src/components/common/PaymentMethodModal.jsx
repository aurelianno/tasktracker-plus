import React, { useState, useEffect } from 'react';

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
    background: 'rgba(255, 255, 255, 0.97)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    padding: '32px',
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.18)',
    border: '1px solid rgba(255, 255, 255, 0.6)',
    position: 'relative'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  title: {
    fontSize: '22px',
    fontWeight: 700,
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
    borderRadius: '6px',
    transition: 'background 0.2s ease'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  label: {
    fontWeight: 500,
    color: '#374151',
    fontSize: '15px',
    marginBottom: '6px'
  },
  input: {
    padding: '12px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'border-color 0.2s ease',
    fontFamily: 'inherit',
    background: '#fff',
    color: '#1e293b'
  },
  inputError: {
    borderColor: '#ef4444'
  },
  error: {
    color: '#ef4444',
    fontSize: '14px',
    textAlign: 'center',
    marginBottom: '8px'
  },
  buttonRow: {
    display: 'flex',
    gap: '12px',
    marginTop: '16px'
  },
  button: {
    flex: 1,
    padding: '12px 0',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    color: 'white',
    fontWeight: 600,
    fontSize: '15px',
    border: 'none',
    cursor: 'pointer'
  },
  secondaryButton: {
    flex: 1,
    padding: '12px 0',
    borderRadius: '10px',
    background: '#f3f4f6',
    color: '#1e293b',
    fontWeight: 600,
    fontSize: '15px',
    border: 'none',
    cursor: 'pointer'
  },
  deleteButton: {
    width: '100%',
    marginTop: '12px',
    padding: '12px 0',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
    color: 'white',
    fontWeight: 600,
    fontSize: '15px',
    border: 'none',
    cursor: 'pointer'
  }
};

const PaymentMethodModal = ({ isOpen, onClose, card, onSave, onDelete }) => {
  const [form, setForm] = useState(card || { number: '', expiry: '', cvc: '', name: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(card || { number: '', expiry: '', cvc: '', name: '' });
    setError('');
  }, [isOpen, card]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.number || !form.expiry || !form.cvc || !form.name) {
      setError('All fields are required');
      return;
    }
    if (!/^\d{16}$/.test(form.number.replace(/\s/g, ''))) {
      setError('Card number must be exactly 16 digits');
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(form.expiry)) {
      setError('Expiry must be MM/YY');
      return;
    }
    if (!/^\d{3}$/.test(form.cvc)) {
      setError('CVC must be exactly 3 digits');
      return;
    }
    setError('');
    onSave(form);
    onClose();
  };

  const handleDelete = () => {
    onDelete();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>{card ? 'Edit Card' : 'Add Card'}</h2>
          <button style={styles.closeButton} onClick={onClose} aria-label="Close">&times;</button>
        </div>
        <form onSubmit={handleSave} style={styles.form}>
          <div>
            <div style={styles.label}>Cardholder Name</div>
            <input
              style={styles.input}
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Full Name"
              autoComplete="cc-name"
            />
          </div>
          <div>
            <div style={styles.label}>Card Number</div>
            <input
              style={styles.input}
              name="number"
              value={form.number}
              onChange={handleChange}
              placeholder="1234567812345678"
              autoComplete="cc-number"
              maxLength={16}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <div style={styles.label}>Expiry</div>
              <input
                style={styles.input}
                name="expiry"
                value={form.expiry}
                onChange={handleChange}
                placeholder="MM/YY"
                autoComplete="cc-exp"
                maxLength={5}
              />
            </div>
            <div style={{ flex: 1 }}>
              <div style={styles.label}>CVC</div>
              <input
                style={styles.input}
                name="cvc"
                value={form.cvc}
                onChange={handleChange}
                placeholder="123"
                autoComplete="cc-csc"
                maxLength={3}
              />
            </div>
          </div>
          {error && <div style={styles.error}>{error}</div>}
          <div style={styles.buttonRow}>
            <button
              type="button"
              style={styles.secondaryButton}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={styles.button}
            >
              Save
            </button>
          </div>
          {card && (
            <button
              type="button"
              style={styles.deleteButton}
              onClick={handleDelete}
            >
              Delete Card
            </button>
          )}
        </form>
        {!card && (
          <div style={{ marginTop: 24, color: '#64748b', textAlign: 'center', fontSize: 15 }}>
            No payment method on file
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentMethodModal; 