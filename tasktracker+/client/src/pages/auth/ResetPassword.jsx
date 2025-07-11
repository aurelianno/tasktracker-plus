import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import authService from '../../services/authService';
import { reset } from '../../store/slices/authSlice';
import { useTheme } from '../../ThemeContext';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme('light');
  }, [setTheme]);

  const { password, confirmPassword } = formData;

  useEffect(() => {
    if (!token) {
      navigate('/forgot-password');
    }
  }, [token, navigate]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    return newErrors;
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear confirm password error when either password field changes
    if (name === 'password' || name === 'confirmPassword') {
      if (errors.confirmPassword) {
        setErrors(prev => ({
          ...prev,
          confirmPassword: ''
        }));
      }
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const response = await authService.resetPassword(token, password);
      setIsSuccess(true);
      
      // Auto-redirect to dashboard after successful reset
      setTimeout(() => {
        dispatch(reset());
        navigate('/dashboard');
      }, 2000);
      
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reset password';
      if (message.includes('Invalid or expired')) {
        setErrors({ general: 'This reset link has expired or is invalid. Please request a new one.' });
      } else {
        setErrors({ general: message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^A-Za-z0-9]/)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);

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
      border: '1px solid rgba(255, 255, 255, 0.6)',
      position: 'relative'
    },
    logoSection: {
      textAlign: 'center',
      marginBottom: '32px'
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
      marginBottom: '32px'
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
      gap: '20px'
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
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
    generalError: {
      padding: '12px 16px',
      background: 'rgba(239, 68, 68, 0.1)',
      border: '1px solid rgba(239, 68, 68, 0.2)',
      borderRadius: '8px',
      color: '#dc2626',
      fontSize: '14px',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    passwordStrength: {
      display: 'flex',
      gap: '4px',
      marginTop: '8px'
    },
    strengthBar: {
      height: '3px',
      flex: 1,
      borderRadius: '2px',
      background: '#e5e7eb',
      transition: 'background 0.2s ease'
    },
    strengthBarActive: {
      background: '#10b981'
    },
    strengthText: {
      fontSize: '12px',
      color: '#64748b',
      marginTop: '4px'
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
      marginTop: '8px'
    },
    submitButtonDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed'
    },
    successMessage: {
      padding: '16px',
      background: 'rgba(16, 185, 129, 0.1)',
      border: '1px solid rgba(16, 185, 129, 0.2)',
      borderRadius: '12px',
      color: '#065f46',
      fontSize: '14px',
      lineHeight: 1.6,
      textAlign: 'center'
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
      marginTop: '24px',
      paddingTop: '24px',
      borderTop: '1px solid #e5e7eb'
    },
    link: {
      color: '#2563eb',
      textDecoration: 'none',
      fontWeight: '600',
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
            <div style={styles.successIcon}>✅</div>
            <h2 style={styles.title}>Password Reset Complete</h2>
            <p style={styles.subtitle}>
              Your password has been successfully updated
            </p>
          </div>

          <div style={styles.successMessage}>
            <p style={{margin: '0 0 12px 0', fontWeight: '600'}}>Success!</p>
            <p style={{margin: 0}}>
              You're now logged in and will be redirected to your dashboard in a moment.
            </p>
          </div>

          <div style={styles.linkSection}>
            <Link
              to="/dashboard"
              style={{...styles.link, fontSize: '16px', fontWeight: 'bold'}}
              onMouseOver={e => e.target.style.color = '#1d4ed8'}
              onMouseOut={e => e.target.style.color = '#2563eb'}
            >
              Go to Dashboard →
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
          <h2 style={styles.title}>Set New Password</h2>
          <p style={styles.subtitle}>
            Choose a strong password for your TaskTracker+ account
          </p>
        </div>

        <form style={styles.form} onSubmit={onSubmit}>
          {errors.general && (
            <div style={styles.generalError}>
              <span>⚠️</span>
              {errors.general}
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="password">
              new password
            </label>
            <input
              style={{
                ...styles.input,
                ...(errors.password ? styles.inputError : {})
              }}
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={onChange}
              onFocus={e => {
                if (!errors.password) {
                  e.target.style.borderBottomColor = '#2563eb';
                }
              }}
              onBlur={e => {
                if (!errors.password) {
                  e.target.style.borderBottomColor = '#e5e7eb';
                }
              }}
            />
            {errors.password && (
              <div style={styles.errorText}>
                <span>⚠️</span>
                {errors.password}
              </div>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="confirmPassword">
              confirm new password
            </label>
            <input
              style={{
                ...styles.input,
                ...(errors.confirmPassword ? styles.inputError : {})
              }}
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={onChange}
              onFocus={e => {
                if (!errors.confirmPassword) {
                  e.target.style.borderBottomColor = '#2563eb';
                }
              }}
              onBlur={e => {
                if (!errors.confirmPassword) {
                  e.target.style.borderBottomColor = '#e5e7eb';
                }
              }}
            />
            {errors.confirmPassword && (
              <div style={styles.errorText}>
                <span>⚠️</span>
                {errors.confirmPassword}
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
                Updating password...
              </div>
            ) : (
              'Update Password'
            )}
          </button>
        </form>

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

export default ResetPassword;