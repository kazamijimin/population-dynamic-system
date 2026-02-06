import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import './Auth.css';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { handleLogin, currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    const result = await handleLogin(credentials.username, credentials.password);
    
    if (result.success) {
      // Redirect based on user role
      const user = result.user || currentUser;
      if (user?.role === 'manager') {
        navigate('/manager/dashboard');
      } else {
        navigate('/admin/dashboard');
      }
    } else {
      setErrorMsg(result.message || 'Login failed');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="auth-wrapper">
      {/* Decorative coffee beans */}
      <div className="coffee-beans">
        <span className="bean bean-1">☕</span>
        <span className="bean bean-2">☕</span>
        <span className="bean bean-3">☕</span>
      </div>
      
      <div className="auth-box">
        {/* Coffee cup icon */}
        <div className="auth-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 1v3M10 1v3M14 1v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        <div className="auth-header">
          <h1>Population System</h1>
          <p className="auth-subtitle">Welcome back! Please sign in to continue</p>
        </div>
        
        {errorMsg && (
          <div className="alert alert-error">
            <span className="alert-icon">!</span>
            {errorMsg}
          </div>
        )}
        
        <form onSubmit={handleFormSubmit} className="auth-form">
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </span>
              <input
                type="text"
                id="username"
                name="username"
                value={credentials.username}
                onChange={handleInputChange}
                required
                autoComplete="username"
                placeholder="Enter username"
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input
                type="password"
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleInputChange}
                required
                autoComplete="current-password"
                placeholder="Enter password"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don&apos;t have an account? <Link to="/register">Create one</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;