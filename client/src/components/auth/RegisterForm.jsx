import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, reset } from '../../store/slices/authSlice';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { name, email, password, confirmPassword } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      if (message.toLowerCase().includes('already exists') || message.toLowerCase().includes('email')) {
        setErrors({ 
          email: 'An account with this email already exists'
        });
      } else if (message.toLowerCase().includes('name')) {
        setErrors({ name: message });
      } else if (message.toLowerCase().includes('password')) {
        setErrors({ password: message });
      } else {
        setErrors({ 
          general: message || 'Unable to create account. Please try again'
        });
      }
      setIsSubmitting(false);
    }

    if (isSuccess && user) {
      setErrors({});
      setIsSubmitting(false);
      navigate('/dashboard');
    }

    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    
    // Clear errors when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    if (errors.general) {
      setErrors(prev => ({
        ...prev,
        general: ''
      }));
    }
    
    // Clear confirm password error when either password field changes
    if (name === 'confirmPassword' || name === 'password') {
      if (errors.confirmPassword) {
        setErrors(prev => ({
          ...prev,
          confirmPassword: ''
        }));
      }
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    const userData = { name: name.trim(), email, password };
    dispatch(register(userData));
  };

  // Add password strength calculation
  const getPasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 6) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };
  const passwordStrength = getPasswordStrength(password);
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['#ef4444', '#f59e42', '#facc15', '#10b981'];

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
      maxWidth: '480px',
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
    inputRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '24px'
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
    inputContainer: {
      position: 'relative'
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
    inputFocused: {
      borderBottomColor: '#2563eb'
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
      fontSize: '14px',
      color: '#ef4444',
      marginBottom: '24px',
      lineHeight: 1.4,
      textAlign: 'center',
      fontWeight: '500',
      padding: '12px',
      background: 'rgba(239, 68, 68, 0.1)',
      borderRadius: '8px',
      border: '1px solid rgba(239, 68, 68, 0.2)'
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
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
      marginTop: '24px',
      padding: '20px',
      background: 'rgba(37, 99, 235, 0.05)',
      borderRadius: '12px',
      border: '1px solid rgba(37, 99, 235, 0.1)'
    },
    feature: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '13px',
      color: '#475569',
      fontWeight: '500'
    },
    securityBadge: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      marginTop: '24px',
      padding: '12px',
      background: 'rgba(16, 185, 129, 0.1)',
      borderRadius: '8px',
      fontSize: '13px',
      color: '#059669',
      fontWeight: '500'
    }
  };

  const currentLoading = isLoading || isSubmitting;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logoSection}>
          <div style={styles.logo}>T</div>
          <h1 style={styles.brandText}>TaskTracker+</h1>
          <p style={styles.enterpriseText}>Enterprise Edition</p>
        </div>

        <div style={styles.header}>
          <h2 style={styles.title}>Create your account</h2>
          <p style={styles.subtitle}>
            Join thousands of professionals using TaskTracker+
          </p>
        </div>

        <form style={styles.form} onSubmit={onSubmit}>
          {errors.general && (
            <div style={styles.generalError}>
              {errors.general}
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="name">
              name
            </label>
            <div style={styles.inputContainer}>
              <input
                style={{
                  ...styles.input,
                  ...(errors.name ? styles.inputError : {})
                }}
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={onChange}
                onFocus={e => {
                  if (!errors.name) {
                    e.target.style.borderBottomColor = '#2563eb';
                  }
                }}
                onBlur={e => {
                  if (!errors.name) {
                    e.target.style.borderBottomColor = '#e5e7eb';
                  }
                }}
              />
            </div>
            {errors.name && (
              <div style={styles.errorText}>
                <span>⚠️</span>
                {errors.name}
              </div>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="email">
              email
            </label>
            <div style={styles.inputContainer}>
              <input
                style={{
                  ...styles.input,
                  ...(errors.email ? styles.inputError : {})
                }}
                id="email"
                name="email"
                type="text"
                autoComplete="email"
                value={email}
                onChange={onChange}
                onFocus={e => {
                  if (!errors.email) {
                    e.target.style.borderBottomColor = '#2563eb';
                  }
                }}
                onBlur={e => {
                  if (!errors.email) {
                    e.target.style.borderBottomColor = '#e5e7eb';
                  }
                }}
              />
            </div>
            {errors.email && (
              <div style={styles.errorText}>
                <span>⚠️</span>
                {errors.email}
              </div>
            )}
          </div>

          <div style={styles.inputRow}>
            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="password">
                password
              </label>
              <div style={styles.inputContainer}>
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
              </div>
              {/* Password strength bar */}
              {password && (
                <div style={{ marginTop: 8 }}>
                  <div style={{
                    height: 6,
                    borderRadius: 4,
                    background: '#e5e7eb',
                    overflow: 'hidden',
                    marginBottom: 4
                  }}>
                    <div style={{
                      width: `${(passwordStrength / 4) * 100}%`,
                      height: '100%',
                      background: strengthColors[passwordStrength - 1] || '#ef4444',
                      transition: 'width 0.3s, background 0.3s'
                    }} />
                  </div>
                  <span style={{
                    fontSize: 12,
                    color: strengthColors[passwordStrength - 1] || '#ef4444',
                    fontWeight: 500
                  }}>
                    {strengthLabels[passwordStrength - 1] || 'Weak'}
                  </span>
                </div>
              )}
              {errors.password && (
                <div style={styles.errorText}>
                  <span>⚠️</span>
                  {errors.password}
                </div>
              )}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="confirmPassword">
                confirm password
              </label>
              <div style={styles.inputContainer}>
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
              </div>
              {errors.confirmPassword && (
                <div style={styles.errorText}>
                  <span>⚠️</span>
                  {errors.confirmPassword}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            style={{
              ...styles.submitButton,
              ...(currentLoading ? styles.submitButtonDisabled : {})
            }}
            disabled={currentLoading}
            onMouseOver={e => {
              if (!currentLoading) {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 12px 35px rgba(37, 99, 235, 0.4)';
              }
            }}
            onMouseOut={e => {
              if (!currentLoading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 25px rgba(37, 99, 235, 0.3)';
              }
            }}
          >
            {currentLoading ? (
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <div style={styles.loadingSpinner}></div>
                Creating account...
              </div>
            ) : (
              'Create account'
            )}
          </button>
        </form>

        <div style={styles.featuresGrid}>
          <div style={styles.feature}>
            <span>⚡</span>
            <span>Lightning fast</span>
          </div>
          <div style={styles.feature}>
            <span>🔒</span>
            <span>Enterprise security</span>
          </div>
          <div style={styles.feature}>
            <span>👥</span>
            <span>Team collaboration</span>
          </div>
          <div style={styles.feature}>
            <span>📊</span>
            <span>Advanced analytics</span>
          </div>
        </div>

        <div style={styles.securityBadge}>
          <span>🛡️</span>
          <span>SOC 2 compliant • Enterprise grade encryption</span>
        </div>

        <div style={styles.linkSection}>
          <Link
            to="/login"
            style={styles.link}
            onMouseOver={e => e.target.style.color = '#1d4ed8'}
            onMouseOut={e => e.target.style.color = '#2563eb'}
          >
            Already have an account? Sign in →
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

export default RegisterForm;