// population-frontend/src/pages/Register.jsx
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
      <div className="auth-box auth-box-large">
        <div className="auth-header">
          <h1>Population System</h1>
          <h2>Create Account</h2>
        </div>
        
        {errors.general && (
          <div className="alert alert-error">
            {errors.general}
          </div>
        )}
        
        <form onSubmit={handleFormSubmit} className="auth-form">
          <div className="form-row">
            <div className="input-group">
              <label htmlFor="first_name">First Name *</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                required
                className={getErrorMessage('first_name') ? 'input-error' : ''}
              />
              {getErrorMessage('first_name') && (
                <span className="error-text">{getErrorMessage('first_name')}</span>
              )}
            </div>

            <div className="input-group">
              <label htmlFor="last_name">Last Name *</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                required
                className={getErrorMessage('last_name') ? 'input-error' : ''}
              />
              {getErrorMessage('last_name') && (
                <span className="error-text">{getErrorMessage('last_name')}</span>
              )}
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="username">Username *</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              autoComplete="username"
              className={getErrorMessage('username') ? 'input-error' : ''}
            />
            {getErrorMessage('username') && (
              <span className="error-text">{getErrorMessage('username')}</span>
            )}
          </div>

          <div className="input-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              autoComplete="email"
              className={getErrorMessage('email') ? 'input-error' : ''}
            />
            {getErrorMessage('email') && (
              <span className="error-text">{getErrorMessage('email')}</span>
            )}
          </div>

          <div className="input-group">
            <label htmlFor="role">Role *</label>
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

          <div className="form-row">
            <div className="input-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                autoComplete="new-password"
                className={getErrorMessage('password') ? 'input-error' : ''}
              />
              {getErrorMessage('password') && (
                <span className="error-text">{getErrorMessage('password')}</span>
              )}
            </div>

            <div className="input-group">
              <label htmlFor="password_confirm">Confirm Password *</label>
              <input
                type="password"
                id="password_confirm"
                name="password_confirm"
                value={formData.password_confirm}
                onChange={handleInputChange}
                required
                autoComplete="new-password"
                className={getErrorMessage('password_confirm') ? 'input-error' : ''}
              />
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
            {isSubmitting ? 'Creating account...' : 'Create Account'}
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