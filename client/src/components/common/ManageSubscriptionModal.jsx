import React from 'react';

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
    maxWidth: '600px',
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
  planCard: {
    background: '#fff',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '16px',
    border: '2px solid #e5e7eb',
    boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
    minWidth: 220,
    flex: 1
  },
  planCardActive: {
    border: '2px solid #2563eb',
    boxShadow: '0 8px 32px rgba(37,99,235,0.10)'
  },
  planName: {
    fontWeight: 700,
    fontSize: 18,
    color: '#1e293b',
    marginBottom: 4
  },
  planPrice: {
    fontWeight: 600,
    fontSize: 16,
    color: '#2563eb',
    marginBottom: 8
  },
  planFeatures: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
    paddingLeft: 18
  },
  planFeature: {
    marginBottom: 2
  },
  button: {
    width: '100%',
    padding: '10px 0',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    color: 'white',
    fontWeight: 600,
    fontSize: '15px',
    border: 'none',
    cursor: 'pointer',
    marginBottom: '8px',
    marginTop: '0'
  },
  secondaryButton: {
    width: '100%',
    padding: '10px 0',
    borderRadius: '8px',
    background: '#f3f4f6',
    color: '#1e293b',
    fontWeight: 600,
    fontSize: '15px',
    border: 'none',
    cursor: 'pointer',
    marginBottom: '8px',
    marginTop: '0'
  },
  cancelButton: {
    width: '100%',
    padding: '10px 0',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
    color: 'white',
    fontWeight: 600,
    fontSize: '15px',
    border: 'none',
    cursor: 'pointer',
    marginTop: '8px'
  },
  status: {
    fontWeight: 600,
    fontSize: '15px',
    marginBottom: '8px',
    color: '#059669'
  },
  statusCanceled: {
    color: '#dc2626'
  },
  planRow: {
    display: 'flex',
    gap: 20,
    flexWrap: 'wrap',
    marginBottom: 12
  }
};

const ManageSubscriptionModal = ({ isOpen, onClose, subscription, onChange }) => {
  if (!isOpen) return null;

  const PLAN_FEATURES = {
    Personal: [
      '✓ 1 team',
      '✓ Up to 3 members',
      '✓ Basic analytics',
      '✓ Email support',
      '✗ Custom integrations',
      '✗ Advanced security',
    ],
    Pro: [
      '✓ Unlimited teams',
      '✓ Up to 20 members',
      '✓ Advanced analytics',
      '✓ Priority support',
      '✓ Custom integrations',
      '✗ Advanced security',
    ],
    Enterprise: [
      '✓ Unlimited teams and members',
      '✓ Advanced analytics and reporting',
      '✓ Priority support',
      '✓ Custom integrations',
      '✓ Advanced security features',
    ]
  };
  const PLAN_PRICES = { Personal: 0, Pro: 12, Enterprise: 29 };

  const handleSelect = (plan) => {
    if (plan === subscription.plan) return;
    let price = PLAN_PRICES[plan];
    onChange({ ...subscription, plan, price, status: 'active', cancelAt: null });
  };
  const handleCancel = () => onChange({ ...subscription, status: 'canceled' });
  const handleResume = () => onChange({ ...subscription, status: 'active', cancelAt: null });

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Manage Subscription</h2>
          <button style={styles.closeButton} onClick={onClose} aria-label="Close">&times;</button>
        </div>
        <div style={styles.planRow}>
          {['Personal', 'Pro', 'Enterprise'].map(plan => {
            const isActive = subscription.plan === plan;
            const isUpgrade = PLAN_PRICES[plan] > PLAN_PRICES[subscription.plan];
            const isDowngrade = PLAN_PRICES[plan] < PLAN_PRICES[subscription.plan];
            return (
              <div key={plan} style={{ ...styles.planCard, ...(isActive ? styles.planCardActive : {}) }}>
                <div style={styles.planName}>{plan} Plan</div>
                <div style={styles.planPrice}>{PLAN_PRICES[plan] === 0 ? 'Free' : `$${PLAN_PRICES[plan]}/month`}</div>
                <ul style={styles.planFeatures}>
                  {PLAN_FEATURES[plan].map(f => (
                    <li key={f} style={styles.planFeature}>{f}</li>
                  ))}
                </ul>
                {isActive && (
                  <div style={{ margin: '8px 0', fontWeight: 600, color: subscription.status === 'active' ? '#059669' : '#dc2626', fontSize: 14 }}>
                    {subscription.status === 'active' ? 'Active' : 'Canceled'}
                  </div>
                )}
                {!isActive && (
                  <button
                    style={isUpgrade ? styles.button : styles.secondaryButton}
                    onClick={() => handleSelect(plan)}
                  >
                    {isUpgrade ? 'Upgrade' : 'Downgrade'}
                  </button>
                )}
                {isActive && subscription.status === 'active' && (
                  <button style={styles.cancelButton} onClick={handleCancel}>Cancel Subscription</button>
                )}
                {isActive && subscription.status === 'canceled' && (
                  <button style={styles.button} onClick={handleResume}>Resume Subscription</button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ManageSubscriptionModal; 