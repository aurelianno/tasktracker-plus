import { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../../services/authService';
import { useTheme } from '../../ThemeContext';
import { useEffect } from 'react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const { setTheme } = useTheme();
  useEffect(() => { setTheme('light'); }, [setTheme]);

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await authService.forgotPassword(email);
      setIsSuccess(true);
    } catch (error) {
      setError(error.response?.data?.message || 'Unable to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #e8f4f8 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    card: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      padding: '48px 40px',
      width: '100%',
      maxWidth: '440px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.6)'
    },
    logoSection: {
      textAlign: 'center',
      marginBottom: '40px'
    },
    logo: {
      width: '64px',
      height: '64px',
      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      borderRadius: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 16px',
      boxShadow: '0 12px 30px rgba(37, 99, 235, 0.3)',
      color: 'white',
      fontSize: '28px',
      fontWeight: 'bold'
    },
    brandText: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#1e293b',
      margin: '0 0 4px 0'
    },
    enterpriseText: {
      fontSize: '14px',
      color: '#64748b',
      fontWeight: '500',
      margin: 0
    },
    header: {
      textAlign: 'center',
      marginBottom: '40px'
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#1e293b',
      margin: '0 0 8px 0'
    },
    subtitle: {
      fontSize: '16px',
      color: '#64748b',
      margin: 0,
      lineHeight: 1.5
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '32px'
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column'
    },
    label: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#64748b',
      margin: '0 0 8px 0'
    },
    input: {
      width: '100%',
      padding: '12px 0',
      border: 'none',
      borderBottom: '1px solid #e5e7eb',
      fontSize: '16px',
      fontFamily: 'inherit',
      background: 'transparent',
      color: '#1e293b',
      transition: 'border-color 0.2s ease',
      outline: 'none',
      boxSizing: 'border-box'
    },
    inputError: {
      borderBottomColor: '#ef4444'
    },
    errorText: {
      fontSize: '14px',
      color: '#ef4444',
      marginTop: '8px',
      lineHeight: 1.4,
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    submitButton: {
      width: '100%',
      padding: '16px',
      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: '0 8px 25px rgba(37, 99, 235, 0.3)',
      marginTop: '16px'
    },
    submitButtonDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed'
    },
    successMessage: {
      padding: '24px',
      background: 'rgba(16, 185, 129, 0.1)',
      border: '1px solid rgba(16, 185, 129, 0.2)',
      borderRadius: '12px',
      color: '#065f46',
      fontSize: '14px',
      lineHeight: 1.6,
      textAlign: 'center',
      marginBottom: '24px'
    },
    successIcon: {
      width: '48px',
      height: '48px',
      background: 'rgba(16, 185, 129, 0.1)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 16px',
      fontSize: '24px'
    },
    linkSection: {
      textAlign: 'center',
      marginTop: '32px',
      paddingTop: '24px',
      borderTop: '1px solid #e5e7eb'
    },
    link: {
      color: '#2563eb',
      textDecoration: 'none',
      fontWeight: '500',
      fontSize: '14px',
      transition: 'color 0.2s ease'
    },
    loadingSpinner: {
      width: '20px',
      height: '20px',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      borderTop: '2px solid white',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginRight: '8px'
    },
    infoBox: {
      padding: '16px',
      background: 'rgba(37, 99, 235, 0.05)',
      border: '1px solid rgba(37, 99, 235, 0.1)',
      borderRadius: '8px',
      marginTop: '20px'
    },
    infoText: {
      fontSize: '13px',
      color: '#475569',
      lineHeight: 1.5,
      margin: 0
    }
  };

  if (isSuccess) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.logoSection}>
            <div style={styles.logo}>T</div>
            <h1 style={styles.brandText}>TaskTracker+</h1>
            <p style={styles.enterpriseText}>Enterprise Edition</p>
          </div>

          <div style={styles.header}>
            <div style={styles.successIcon}>✉️</div>
            <h2 style={styles.title}>Check your email</h2>
            <p style={styles.subtitle}>
              We've sent password reset instructions to your email
            </p>
          </div>

          <div style={styles.successMessage}>
            <p style={{margin: '0 0 12px 0', fontWeight: '600'}}>Reset link sent</p>
            <p style={{margin: 0}}>
              If an account with <strong>{email}</strong> exists, you'll receive an email with 
              instructions to reset your password within the next few minutes.
            </p>
          </div>

          <div style={styles.infoBox}>
            <p style={styles.infoText}>
              <strong>Didn't receive the email?</strong><br/>
              • Check your spam folder<br/>
              • Make sure you entered the correct email<br/>
              • The reset link expires in 10 minutes
            </p>
          </div>

          <div style={styles.linkSection}>
            <Link
              to="/login"
              style={styles.link}
              onMouseOver={e => e.target.style.color = '#1d4ed8'}
              onMouseOut={e => e.target.style.color = '#2563eb'}
            >
              ← Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logoSection}>
          <div style={styles.logo}>T</div>
          <h1 style={styles.brandText}>TaskTracker+</h1>
          <p style={styles.enterpriseText}>Enterprise Edition</p>
        </div>

        <div style={styles.header}>
          <h2 style={styles.title}>Reset your password</h2>
          <p style={styles.subtitle}>
            Enter your email and we'll send you reset instructions
          </p>
        </div>

        <form style={styles.form} onSubmit={onSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="email">
              email
            </label>
            <input
              style={{
                ...styles.input,
                ...(error ? styles.inputError : {})
              }}
              id="email"
              name="email"
              type="text"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              onFocus={e => {
                if (!error) {
                  e.target.style.borderBottomColor = '#2563eb';
                }
              }}
              onBlur={e => {
                if (!error) {
                  e.target.style.borderBottomColor = '#e5e7eb';
                }
              }}
            />
            {error && (
              <div style={styles.errorText}>
                <span>⚠️</span>
                {error}
              </div>
            )}
          </div>

          <button
            type="submit"
            style={{
              ...styles.submitButton,
              ...(isLoading ? styles.submitButtonDisabled : {})
            }}
            disabled={isLoading}
            onMouseOver={e => {
              if (!isLoading) {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 12px 35px rgba(37, 99, 235, 0.4)';
              }
            }}
            onMouseOut={e => {
              if (!isLoading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 25px rgba(37, 99, 235, 0.3)';
              }
            }}
          >
            {isLoading ? (
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <div style={styles.loadingSpinner}></div>
                Sending reset link...
              </div>
            ) : (
              'Send reset instructions'
            )}
          </button>
        </form>

        <div style={styles.infoBox}>
          <p style={styles.infoText}>
            <strong>🔒 Secure process:</strong> We'll send a secure link that expires in 10 minutes. 
            Your account stays protected throughout the reset process.
          </p>
        </div>

        <div style={styles.linkSection}>
          <Link
            to="/login"
            style={styles.link}
            onMouseOver={e => e.target.style.color = '#1d4ed8'}
            onMouseOut={e => e.target.style.color = '#2563eb'}
          >
            ← Back to sign in
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ForgotPassword;