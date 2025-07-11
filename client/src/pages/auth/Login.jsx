import LoginForm from '../../components/auth/LoginForm';
import { useTheme } from '../../ThemeContext';
import { useEffect } from 'react';

const Login = () => {
  const { setTheme } = useTheme();
  useEffect(() => { setTheme('light'); }, [setTheme]);
  return <LoginForm />;
};

export default Login;