import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, reset } from '../../store/slices/authSlice';

console.log('LoginForm mounted'); // Debug: check if remounting

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { email, password } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    console.log('useEffect', { isError, isSuccess, user, message });
    if (isError) {
      setIsSubmitting(false); // Always stop loading on error
      if (message && message.toLowerCase().includes('invalid credentials')) {
        setErrors({ 
          general: 'The email or password you entered is incorrect'
        });
      } else if (message && message.toLowerCase().includes('email')) {
        setErrors({ email: message });
      } else if (message && message.toLowerCase().includes('password')) {
        setErrors({ password: message });
      } else {
        setErrors({ 
          general: message || 'Unable to sign in. Please try again'
        });
      }
    }

    if (isSuccess && user) {
      setErrors({});
      setIsSubmitting(false);
      setFormData({ email: '', password: '' });
      navigate('/dashboard');
      dispatch(reset());
    }
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const validateForm = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    }
    return newErrors;
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    console.log('onChange', name, value);
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
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
  };

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(reset()); // Clear previous errors/loading before new login
    console.log('onSubmit', { email, password });
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false); // Stop loading if validation fails
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    const userData = { email, password };
    dispatch(login(userData));
  };

  console.log('LoginForm render', { formData, errors });

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
    labelRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '8px'
    },
    label: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#64748b',
      margin: 0
    },
    forgotLink: {
      color: '#2563eb',
      textDecoration: 'none',
      fontSize: '13px',
      fontWeight: '500',
      transition: 'color 0.2s ease'
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
          <h2 style={styles.title}>Welcome back</h2>
          <p style={styles.subtitle}>
            Sign in to continue to your dashboard
          </p>
        </div>

        <form style={styles.form} onSubmit={onSubmit}>
          {errors.general && (
            <div style={styles.generalError}>
              {errors.general}
            </div>
          )}

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

          <div style={styles.inputGroup}>
            <div style={styles.labelRow}>
              <label style={styles.label} htmlFor="password">
                password
              </label>
              <Link
                to="/forgot-password"
                style={styles.forgotLink}
                onMouseOver={e => e.target.style.color = '#1d4ed8'}
                onMouseOut={e => e.target.style.color = '#2563eb'}
              >
                forgot password?
              </Link>
            </div>
            <div style={styles.inputContainer}>
              <input
                style={{
                  ...styles.input,
                  ...(errors.password ? styles.inputError : {})
                }}
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
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
            {errors.password && (
              <div style={styles.errorText}>
                <span>⚠️</span>
                {errors.password}
              </div>
            )}
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
                Signing in...
              </div>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <div style={styles.securityBadge}>
          <span>🔒</span>
          <span>Secure login with enterprise encryption</span>
        </div>

        <div style={styles.linkSection}>
          <Link
            to="/register"
            style={styles.link}
            onMouseOver={e => e.target.style.color = '#1d4ed8'}
            onMouseOut={e => e.target.style.color = '#2563eb'}
          >
            Don't have an account? Create one →
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoginForm;