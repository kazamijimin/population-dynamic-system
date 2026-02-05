import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: '',
    role: 'manager'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { handleRegister } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    const result = await handleRegister(formData);
    
    if (result.success) {
      navigate('/admin/dashboard');
    } else {
      setErrors(result.errors || {});
    }
    setIsSubmitting(false);
  };

  const getErrorMessage = (field) => {
    if (errors[field]) {
      return Array.isArray(errors[field]) ? errors[field][0] : errors[field];
    }
    return null;
  };

  return (
    <div className="auth-wrapper">
      {/* Decorative coffee beans */}
      <div className="coffee-beans">
        <span className="bean bean-1">☕</span>
        <span className="bean bean-2">☕</span>
        <span className="bean bean-3">☕</span>
      </div>

      <div className="auth-box auth-box-large">
        {/* User plus icon */}
        <div className="auth-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="20" y1="8" x2="20" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="23" y1="11" x2="17" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <div className="auth-header">
          <h1>Population System</h1>
          <p className="auth-subtitle">Create your account to get started</p>
        </div>
        
        {errors.general && (
          <div className="alert alert-error">
            <span className="alert-icon">!</span>
            {errors.general}
          </div>
        )}
        
        <form onSubmit={handleFormSubmit} className="auth-form">
          <div className="form-row">
            <div className="input-group">
              <label htmlFor="first_name">First Name</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </span>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                  placeholder="John"
                  className={getErrorMessage('first_name') ? 'input-error' : ''}
                />
              </div>
              {getErrorMessage('first_name') && (
                <span className="error-text">{getErrorMessage('first_name')}</span>
              )}
            </div>

            <div className="input-group">
              <label htmlFor="last_name">Last Name</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </span>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                  placeholder="Doe"
                  className={getErrorMessage('last_name') ? 'input-error' : ''}
                />
              </div>
              {getErrorMessage('last_name') && (
                <span className="error-text">{getErrorMessage('last_name')}</span>
              )}
            </div>
          </div>

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
                value={formData.username}
                onChange={handleInputChange}
                required
                autoComplete="username"
                placeholder="johndoe"
                className={getErrorMessage('username') ? 'input-error' : ''}
              />
            </div>
            {getErrorMessage('username') && (
              <span className="error-text">{getErrorMessage('username')}</span>
            )}
          </div>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </span>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                autoComplete="email"
                placeholder="john@example.com"
                className={getErrorMessage('email') ? 'input-error' : ''}
              />
            </div>
            {getErrorMessage('email') && (
              <span className="error-text">{getErrorMessage('email')}</span>
            )}
          </div>

          <div className="input-group">
            <label htmlFor="role">Role</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </span>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
              >
                <option value="manager">Manager</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>

          <div className="form-row">
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
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className={getErrorMessage('password') ? 'input-error' : ''}
                />
              </div>
              {getErrorMessage('password') && (
                <span className="error-text">{getErrorMessage('password')}</span>
              )}
            </div>

            <div className="input-group">
              <label htmlFor="password_confirm">Confirm Password</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  type="password"
                  id="password_confirm"
                  name="password_confirm"
                  value={formData.password_confirm}
                  onChange={handleInputChange}
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className={getErrorMessage('password_confirm') ? 'input-error' : ''}
                />
              </div>
              {getErrorMessage('password_confirm') && (
                <span className="error-text">{getErrorMessage('password_confirm')}</span>
              )}
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
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;