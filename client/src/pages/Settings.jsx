/*
  Settings.jsx
  User settings page for TaskTracker+.
  - Allows users to update profile, password, theme, billing, and integrations.
  - Handles subscription management and payment methods (mock-functional).
  - Integrates with Redux and backend for user preferences and account actions.
*/
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { logout, updateProfile, updatePreferences as updatePreferencesAction } from '../store/slices/authSlice';
import Notification from '../components/common/Notification';
import { useTheme } from '../ThemeContext.jsx';
import { deleteAccount } from '../services/api';
import ManageSubscriptionModal from '../components/common/ManageSubscriptionModal';
import PaymentMethodModal from '../components/common/PaymentMethodModal';
import dayjs from 'dayjs';

const IntegrationModal = ({ isOpen, onClose, provider, onConnect }) => {
  const providerNames = {
    slack: 'Slack',
    google: 'Google Calendar',
    github: 'GitHub'
  };
  if (!isOpen) return null;
  return (
    <div style={{position:'fixed',inset:0,zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.5)'}} onClick={onClose}>
      <div style={{background:'#fff',borderRadius:24,boxShadow:'0 20px 60px rgba(0,0,0,0.18)',width:'100%',maxWidth:400,padding:32,position:'relative'}} onClick={e=>e.stopPropagation()}>
        <h2 style={{fontSize:22,fontWeight:700,color:'#1e293b',marginBottom:8,textAlign:'center'}}>Connect {providerNames[provider]}</h2>
        <p style={{textAlign:'center',color:'#6b7280',fontSize:15,marginBottom:24}}>
          Sign in to your {providerNames[provider]} account to connect.
        </p>
        <button style={{width:'100%',padding:'12px 0',borderRadius:10,background:'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',color:'white',fontWeight:600,fontSize:15,border:'none',cursor:'pointer'}}
          onClick={() => { onConnect(); onClose(); }}>
          Sign in with {providerNames[provider]}
        </button>
        <button style={{marginTop:16,width:'100%',padding:'12px 0',borderRadius:10,background:'#f3f4f6',color:'#1e293b',fontWeight:600,fontSize:15,border:'none',cursor:'pointer'}} onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

const Settings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  const [notification, setNotification] = useState({ isOpen: false, type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    darkMode: false,
    autoArchive: true,
    taskReminders: true
  });

  const [dangerZone, setDangerZone] = useState({
    showDeleteConfirm: false,
    deletePassword: ''
  });

  const [subscription, setSubscription] = useState({
    plan: 'Enterprise',
    price: 29,
    status: 'active',
    nextBilling: dayjs().add(1, 'month').format('YYYY-MM-DD'),
    cancelAt: null
  });
  const [card, setCard] = useState({
    brand: 'Visa',
    number: '4242424242424242',
    expiry: '12/25',
    name: 'Aureliano Ceballos'
  });
  const [showSubModal, setShowSubModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);

  const [integrations, setIntegrations] = useState({
    slack: { connected: false, user: null },
    google: { connected: false, user: null },
    github: { connected: false, user: null }
  });
  const [integrationModal, setIntegrationModal] = useState({ open: false, provider: null });

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

  const getPlanStatus = () => {
    if (subscription.status === 'active') return { text: 'Active', color: '#059669' };
    if (subscription.status === 'canceled') return { text: 'Canceled', color: '#dc2626' };
    return { text: 'Inactive', color: '#64748b' };
  };

  const { theme, toggleTheme } = useTheme();
  const borderColor = theme === 'dark' ? '#4b5563' : '#d1d5db';

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
        setNotification({
          isOpen: true,
          type: 'error',
          message: 'New passwords do not match'
        });
        return;
      }

      const updateData = {
        name: profileForm.name,
        email: profileForm.email
      };

      if (profileForm.newPassword) {
        updateData.currentPassword = profileForm.currentPassword;
        updateData.newPassword = profileForm.newPassword;
      }

      await dispatch(updateProfile(updateData)).unwrap();
      
      setNotification({
        isOpen: true,
        type: 'success',
        message: 'Profile updated successfully!'
      });

      setProfileForm(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      setNotification({
        isOpen: true,
        type: 'error',
        message: error || 'Failed to update profile'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferenceChange = (key, value) => {
    if (key === 'darkMode') {
      toggleTheme();
      dispatch(updatePreferencesAction({ theme: value ? 'dark' : 'light' }));
    } else {
      setPreferences(prev => ({ ...prev, [key]: value }));
      setNotification({
        isOpen: true,
        type: 'success',
        message: 'Preference updated!'
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (dangerZone.deletePassword !== 'DELETE') {
      setNotification({
        isOpen: true,
        type: 'error',
        message: 'Please type DELETE to confirm account deletion'
      });
      return;
    }
    try {
      await deleteAccount();
      setNotification({
        isOpen: true,
        type: 'success',
        message: 'Account deleted. You will be logged out.'
      });
      setTimeout(() => {
        dispatch(logout());
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }, 1500);
    } catch (error) {
      setNotification({
        isOpen: true,
        type: 'error',
        message: error?.response?.data?.message || 'Failed to delete account'
      });
    }
  };

  const closeNotification = () => {
    setNotification({ ...notification, isOpen: false });
  };

  const TABS = [
    { key: 'profile', label: 'Profile & Security', icon: '👤' },
    { key: 'preferences', label: 'Preferences', icon: '⚙️' },
    { key: 'notifications', label: 'Notifications', icon: '🔔' },
    { key: 'integrations', label: 'Integrations', icon: '🔗' },
    { key: 'billing', label: 'Billing', icon: '💳' },
    { key: 'danger', label: 'Danger Zone', icon: '⚠️' }
  ];

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'transparent',
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
      padding: '0 24px 32px',
      display: 'flex',
      gap: '32px'
    },
    sidebar: {
      width: '280px',
      flexShrink: 0
    },
    tabList: {
      background: 'rgba(255, 255, 255, 0.9)',
      borderRadius: '16px',
      padding: '16px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.5)'
    },
    tabButton: {
      width: '100%',
      background: 'none',
      border: 'none',
      padding: '12px 16px',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '500',
      color: '#64748b',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '4px'
    },
    tabButtonActive: {
      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      color: 'white',
      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
    },
    mainContent: {
      flex: 1,
      background: 'rgba(255, 255, 255, 0.9)',
      borderRadius: '16px',
      padding: '32px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.5)'
    },
    sectionTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#1e293b',
      margin: '0 0 24px 0',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    formGroup: {
      marginBottom: '24px'
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '8px'
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      transition: 'border-color 0.2s ease',
      boxSizing: 'border-box'
    },
    inputFocus: {
      outline: 'none',
      borderColor: '#2563eb',
      boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.1)'
    },
    button: {
      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
    },
    buttonDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed'
    },
    dangerButton: {
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
    },
    switch: {
      position: 'relative',
      display: 'inline-block',
      width: '48px',
      height: '24px'
    },
    switchInput: {
      opacity: 0,
      width: 0,
      height: 0
    },
    switchSlider: {
      position: 'absolute',
      cursor: 'pointer',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: '#d1d5db',
      transition: '0.3s',
      borderRadius: '24px'
    },
    switchSliderActive: {
      background: '#2563eb'
    },
    switchSliderBefore: {
      position: 'absolute',
      content: '""',
      height: '18px',
      width: '18px',
      left: '3px',
      bottom: '3px',
      background: 'white',
      transition: '0.3s',
      borderRadius: '50%'
    },
    switchSliderBeforeActive: {
      transform: 'translateX(24px)'
    },
    preferenceItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 0',
      borderBottom: '1px solid #f3f4f6'
    },
    preferenceLabel: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151'
    },
    preferenceDescription: {
      fontSize: '12px',
      color: '#6b7280',
      marginTop: '4px'
    },
    dangerZone: {
      background: 'none',
      border: 'none',
      borderRadius: '0',
      padding: '0',
      marginTop: '24px'
    },
    dangerTitle: {
      color: '#dc2626',
      fontSize: '16px',
      fontWeight: '600',
      marginBottom: '16px'
    },
    dangerText: {
      color: '#7f1d1d',
      fontSize: '14px',
      marginBottom: '16px'
    },
    integrationCard: {
      border: 'none',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '16px',
      background: '#fff'
    },
    integrationHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px'
    },
    integrationName: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#1e293b'
    },
    integrationStatus: {
      fontSize: '12px',
      padding: '4px 8px',
      borderRadius: '12px',
      fontWeight: '500'
    },
    statusConnected: {
      background: '#dcfce7',
      color: '#166534'
    },
    statusDisconnected: {
      background: '#fef2f2',
      color: '#dc2626'
    },
    billingCard: {
      border: 'none',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '16px',
      background: '#fff'
    },
    planName: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '8px'
    },
    planPrice: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#2563eb',
      marginBottom: '16px'
    },
    planFeatures: {
      listStyle: 'none',
      padding: 0,
      margin: 0
    },
    planFeature: {
      padding: '8px 0',
      fontSize: '14px',
      color: '#6b7280',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  };

  const renderProfileTab = () => (
    <div>
      <h2 style={styles.sectionTitle}>👤 Profile Information</h2>
      <form onSubmit={handleProfileUpdate}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Full Name</label>
          <input
            type="text"
            style={styles.input}
            value={profileForm.name}
            onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Email Address</label>
          <input
            type="email"
            style={styles.input}
            value={profileForm.email}
            onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
            required
          />
        </div>

        <h3 style={{ ...styles.sectionTitle, marginTop: '32px' }}>🔒 Change Password</h3>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Current Password</label>
          <input
            type="password"
            style={styles.input}
            value={profileForm.currentPassword}
            onChange={(e) => setProfileForm(prev => ({ ...prev, currentPassword: e.target.value }))}
          />
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>New Password</label>
          <input
            type="password"
            style={styles.input}
            value={profileForm.newPassword}
            onChange={(e) => setProfileForm(prev => ({ ...prev, newPassword: e.target.value }))}
          />
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Confirm New Password</label>
          <input
            type="password"
            style={styles.input}
            value={profileForm.confirmPassword}
            onChange={(e) => setProfileForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
          />
        </div>

        <button
          type="submit"
          style={{
            ...styles.button,
            ...(isLoading && styles.buttonDisabled)
          }}
          disabled={isLoading}
        >
          {isLoading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );

  const renderPreferencesTab = () => (
    <div>
      <h2 style={styles.sectionTitle}>⚙️ General Preferences</h2>
      <div style={{ ...styles.preferenceItem, border: 'none', borderBottom: `1px solid #f3f4f6` }}>
        <div style={{ flex: 1, padding: '0 16px 0 0', background: 'transparent' }}>
          <div style={styles.preferenceLabel}>Dark Mode</div>
          <div style={styles.preferenceDescription}>Switch to dark theme for better eye comfort</div>
        </div>
        <label style={styles.switch}>
          <input
            type="checkbox"
            style={styles.switchInput}
            checked={theme === 'dark'}
            onChange={e => handlePreferenceChange('darkMode', e.target.checked)}
          />
          <span style={{
            ...styles.switchSlider,
            ...(theme === 'dark' && styles.switchSliderActive)
          }}>
            <span style={{
              ...styles.switchSliderBefore,
              ...(theme === 'dark' && styles.switchSliderBeforeActive)
            }}></span>
          </span>
        </label>
      </div>
      <div style={{ ...styles.preferenceItem, border: 'none', borderBottom: `1px solid #f3f4f6` }}>
        <div style={{ flex: 1, padding: '0 16px 0 0', background: 'transparent' }}>
          <div style={styles.preferenceLabel}>Auto-archive completed tasks</div>
          <div style={styles.preferenceDescription}>Automatically archive tasks after 30 days</div>
        </div>
        <label style={styles.switch}>
          <input
            type="checkbox"
            style={styles.switchInput}
            checked={preferences.autoArchive}
            onChange={(e) => handlePreferenceChange('autoArchive', e.target.checked)}
          />
          <span style={{
            ...styles.switchSlider,
            ...(preferences.autoArchive && styles.switchSliderActive)
          }}>
            <span style={{
              ...styles.switchSliderBefore,
              ...(preferences.autoArchive && styles.switchSliderBeforeActive)
            }}></span>
          </span>
        </label>
      </div>
      <div style={{ ...styles.preferenceItem, border: 'none', borderBottom: `1px solid #f3f4f6` }}>
        <div style={{ flex: 1, padding: '0 16px 0 0', background: 'transparent' }}>
          <div style={styles.preferenceLabel}>Task reminders</div>
          <div style={styles.preferenceDescription}>Show notifications for upcoming deadlines</div>
        </div>
        <label style={styles.switch}>
          <input
            type="checkbox"
            style={styles.switchInput}
            checked={preferences.taskReminders}
            onChange={(e) => handlePreferenceChange('taskReminders', e.target.checked)}
          />
          <span style={{
            ...styles.switchSlider,
            ...(preferences.taskReminders && styles.switchSliderActive)
          }}>
            <span style={{
              ...styles.switchSliderBefore,
              ...(preferences.taskReminders && styles.switchSliderBeforeActive)
            }}></span>
          </span>
        </label>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div>
      <h2 style={styles.sectionTitle}>🔔 Notification Settings</h2>
      <div style={{ ...styles.preferenceItem, border: 'none', borderBottom: `1px solid #f3f4f6` }}>
        <div style={{ flex: 1, padding: '0 16px 0 0', background: 'transparent' }}>
          <div style={styles.preferenceLabel}>Email Notifications</div>
          <div style={styles.preferenceDescription}>Receive notifications via email</div>
        </div>
        <label style={styles.switch}>
          <input
            type="checkbox"
            style={styles.switchInput}
            checked={preferences.emailNotifications}
            onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
          />
          <span style={{
            ...styles.switchSlider,
            ...(preferences.emailNotifications && styles.switchSliderActive)
          }}>
            <span style={{
              ...styles.switchSliderBefore,
              ...(preferences.emailNotifications && styles.switchSliderBeforeActive)
            }}></span>
          </span>
        </label>
      </div>
      <div style={{ ...styles.preferenceItem, border: 'none', borderBottom: `1px solid #f3f4f6` }}>
        <div style={{ flex: 1, padding: '0 16px 0 0', background: 'transparent' }}>
          <div style={styles.preferenceLabel}>Push Notifications</div>
          <div style={styles.preferenceDescription}>Receive browser push notifications</div>
        </div>
        <label style={styles.switch}>
          <input
            type="checkbox"
            style={styles.switchInput}
            checked={preferences.pushNotifications}
            onChange={(e) => handlePreferenceChange('pushNotifications', e.target.checked)}
          />
          <span style={{
            ...styles.switchSlider,
            ...(preferences.pushNotifications && styles.switchSliderActive)
          }}>
            <span style={{
              ...styles.switchSliderBefore,
              ...(preferences.pushNotifications && styles.switchSliderBeforeActive)
            }}></span>
          </span>
        </label>
      </div>
    </div>
  );

  const renderIntegrationsTab = () => (
    <div>
      <h2 style={styles.sectionTitle}>🔗 Third-party Integrations</h2>
      {[{key:'slack',label:'Slack',desc:'Connect your Slack workspace to receive task notifications and updates'},
        {key:'google',label:'Google Calendar',desc:'Sync your tasks with Google Calendar for better time management'},
        {key:'github',label:'GitHub',desc:'Link your GitHub repositories to create tasks from issues and pull requests'}].map(({key,label,desc}) => (
        <div key={key} style={{ ...styles.integrationCard, border: 'none' }}>
          <div style={styles.integrationHeader}>
            <div style={styles.integrationName}>{label}</div>
            <span style={{
              ...styles.integrationStatus,
              ...(integrations[key].connected ? styles.statusConnected : styles.statusDisconnected)
            }}>
              {integrations[key].connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>{desc}</p>
          {integrations[key].connected && integrations[key].user && (
            <div style={{ color: '#2563eb', fontSize: 13, margin: '8px 0 0 0' }}>
              Connected as {integrations[key].user}
            </div>
          )}
          {integrations[key].connected ? (
            <button style={{ ...styles.button, marginTop: '12px', padding: '8px 16px', fontSize: '12px' }}
              onClick={() => setIntegrations(prev => ({ ...prev, [key]: { connected: false, user: null } }))}>
              Disconnect
            </button>
          ) : (
            <button style={{ ...styles.button, marginTop: '12px', padding: '8px 16px', fontSize: '12px' }}
              onClick={() => setIntegrationModal({ open: true, provider: key })}>
              Connect {label}
            </button>
          )}
        </div>
      ))}
      <IntegrationModal
        isOpen={integrationModal.open}
        provider={integrationModal.provider}
        onClose={() => setIntegrationModal({ open: false, provider: null })}
        onConnect={() => {
          const userMap = {
            slack: 'john.smith@company.com',
            google: 'john.smith@gmail.com',
            github: 'john-smith'
          };
          setIntegrations(prev => ({
            ...prev,
            [integrationModal.provider]: {
              connected: true,
              user: userMap[integrationModal.provider]
            }
          }));
        }}
      />
    </div>
  );

  const renderBillingTab = () => (
    <div>
      <h2 style={styles.sectionTitle}>💳 Billing & Subscription</h2>
      {/* Only show the active plan on the main screen */}
      <div style={{ ...styles.billingCard, border: 'none', background: '#fff', minWidth: 260, maxWidth: 400, marginBottom: 32 }}>
        <div style={styles.planName}>{subscription.plan} Plan</div>
        <div style={styles.planPrice}>{PLAN_PRICES[subscription.plan] === 0 ? 'Free' : `$${PLAN_PRICES[subscription.plan]}/month`}</div>
        <ul style={styles.planFeatures}>
          {PLAN_FEATURES[subscription.plan].map(f => (
            <li key={f} style={styles.planFeature}>{f}</li>
          ))}
        </ul>
        <div style={{ margin: '8px 0', fontWeight: 600, color: getPlanStatus().color, fontSize: 14 }}>
          {getPlanStatus().text} {subscription.status === 'canceled' && subscription.cancelAt && (
            <span style={{ color: '#64748b', fontWeight: 400 }}>
              (features end {dayjs(subscription.cancelAt).format('MMM D, YYYY')})
            </span>
          )}
        </div>
        <button style={{ ...styles.button, marginTop: 8 }} onClick={() => setShowSubModal(true)}>
          Manage Subscription
        </button>
      </div>
      <div style={{ ...styles.billingCard, border: 'none', background: '#fff' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>
          Payment Method
        </h3>
        {card ? (
          <>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>
              {card.brand} ending in {card.number.slice(-4)} • Expires {card.expiry}
            </p>
            <button
              style={{
                background: '#f3f4f6',
                color: '#6b7280',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
              onClick={() => setShowCardModal(true)}
            >
              Update Payment Method
            </button>
          </>
        ) : (
          <>
            <p style={{ color: '#dc2626', fontSize: '14px', marginBottom: '16px' }}>
              No payment method on file
            </p>
            <button
              style={{
                background: '#f3f4f6',
                color: '#6b7280',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
              onClick={() => setShowCardModal(true)}
            >
              Add Payment Method
            </button>
          </>
        )}
      </div>
      <ManageSubscriptionModal
        isOpen={showSubModal}
        onClose={() => setShowSubModal(false)}
        subscription={subscription}
        onChange={sub => {
          if (sub.status === 'canceled' && !sub.cancelAt) {
            sub.cancelAt = sub.nextBilling;
          }
          setSubscription(sub);
        }}
      />
      <PaymentMethodModal
        isOpen={showCardModal}
        onClose={() => setShowCardModal(false)}
        card={card}
        onSave={setCard}
        onDelete={() => setCard(null)}
      />
    </div>
  );

  const renderDangerTab = () => (
    <div>
      <h2 style={styles.sectionTitle}>⚠️ Danger Zone</h2>
      
      <div style={{ ...styles.dangerZone, border: 'none', background: 'none' }}>
        <h3 style={styles.dangerTitle}>Delete Account</h3>
        <p style={styles.dangerText}>
          Once you delete your account, there is no going back. Please be certain.
          All your data, teams, and tasks will be permanently deleted.
        </p>
        
        {!dangerZone.showDeleteConfirm ? (
          <button
            style={styles.dangerButton}
            onClick={() => setDangerZone(prev => ({ ...prev, showDeleteConfirm: true }))}
          >
            Delete Account
          </button>
        ) : (
          <div>
            <p style={{ color: '#dc2626', fontSize: '14px', marginBottom: '12px' }}>
              Type "DELETE" to confirm:
            </p>
            <input
              type="text"
              style={{
                ...styles.input,
                borderColor: '#dc2626',
                marginBottom: '12px'
              }}
              value={dangerZone.deletePassword}
              onChange={(e) => setDangerZone(prev => ({ ...prev, deletePassword: e.target.value }))}
              placeholder="Type DELETE to confirm"
            />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                style={styles.dangerButton}
                onClick={handleDeleteAccount}
              >
                Confirm Deletion
              </button>
              <button
                style={{
                  background: '#f3f4f6',
                  color: '#6b7280',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
                onClick={() => setDangerZone({ showDeleteConfirm: false, deletePassword: '' })}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'preferences':
        return renderPreferencesTab();
      case 'notifications':
        return renderNotificationsTab();
      case 'integrations':
        return renderIntegrationsTab();
      case 'billing':
        return renderBillingTab();
      case 'danger':
        return renderDangerTab();
      default:
        return renderProfileTab();
    }
  };

  return (
    <div style={styles.container} className={theme === 'dark' ? 'dark' : ''}>
      <Navbar user={user} handleLogout={handleLogout} />
      <div style={{ ...styles.header, border: `1.5px solid ${borderColor}` }}>
        <h1 style={styles.headerTitle}>Settings</h1>
        <p style={styles.headerSubtitle}>
          Manage your account settings, preferences, and integrations
        </p>
      </div>
      <div style={styles.content}>
        <aside style={styles.sidebar}>
          <div style={{ ...styles.tabList, border: `1.5px solid ${borderColor}` }}>
            {TABS.map(tab => (
              <button
                key={tab.key}
                style={{
                  ...styles.tabButton,
                  ...(activeTab === tab.key ? styles.tabButtonActive : {})
                }}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </aside>
        <main style={{ ...styles.mainContent, border: `1.5px solid ${borderColor}` }}>
          {renderTabContent()}
        </main>
      </div>
      <Notification
        isOpen={notification.isOpen}
        type={notification.type}
        message={notification.message}
        onClose={closeNotification}
      />
    </div>
  );
};

export default Settings; 