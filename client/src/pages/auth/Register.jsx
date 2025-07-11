import RegisterForm from '../../components/auth/RegisterForm';
import { useTheme } from '../../ThemeContext';
import { useEffect } from 'react';

const Register = () => {
  const { setTheme } = useTheme();
  useEffect(() => { setTheme('light'); }, [setTheme]);
  return <RegisterForm />;
};

export default Register;