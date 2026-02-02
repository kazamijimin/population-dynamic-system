// population-frontend/src/contexts/AuthProvider.jsx
import { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { 
  loginRequest, 
  registerRequest, 
  logoutRequest, 
  fetchCurrentUser 
} from '../api/users.api';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    verifyAuthentication();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verifyAuthentication = async () => {
    try {
      const userData = await fetchCurrentUser();
      setCurrentUser(userData);
    } catch {
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (username, password) => {
    try {
      setAuthError(null);
      const response = await loginRequest(username, password);
      if (response.success) {
        setCurrentUser(response.user);
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      setAuthError(message);
      return { success: false, message };
    }
  };

  const handleRegister = async (registrationData) => {
    try {
      setAuthError(null);
      const response = await registerRequest(registrationData);
      if (response.success) {
        setCurrentUser(response.user);
        return { success: true };
      }
      return { success: false, errors: response.errors };
    } catch (err) {
      const errors = err.response?.data?.errors || { general: 'Registration failed' };
      setAuthError(errors);
      return { success: false, errors };
    }
  };

  const handleLogout = async () => {
    try {
      await logoutRequest();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setCurrentUser(null);
    }
  };

  const value = {
    currentUser,
    isLoading,
    authError,
    handleLogin,
    handleRegister,
    handleLogout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};