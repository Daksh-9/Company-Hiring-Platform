import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
    remember: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.userId.trim()) newErrors.userId = 'User ID is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    setTimeout(() => {
      console.log('Log in attempt:', formData);
      setIsLoading(false);
      // Navigate to dashboard after successful login
      navigate('/dashboard');
    }, 2000);
  };

  return (
    <div className="container">
      <div className="form-container">
        <div className="form-header">
          <h1>Welcome Back</h1>
          <p>Log in to your account to continue</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="input-icon">
              <i className="fas fa-id-badge"></i>
              <input
                type="text"
                id="userId"
                name="userId"
                placeholder="User ID"
                value={formData.userId}
                onChange={handleChange}
                className={errors.userId ? 'error' : ''}
                required
              />
            </div>
            {errors.userId && <span className="error-message">{errors.userId}</span>}
          </div>

          <div className="form-group">
            <div className="input-icon">
              <i className="fas fa-lock"></i>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'error' : ''}
                required
              />
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <div className="form-options">
            <label className="checkbox-container">
              <input
                type="checkbox"
                name="remember"
                checked={formData.remember}
                onChange={handleChange}
              />
              <span className="checkmark"></span>
              Remember me
            </label>
            <a href="#" className="forgot-password">Forgot password?</a>
          </div>

          <button
            type="submit"
            className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {!isLoading && <i className="fas fa-sign-in-alt"></i>}
            {isLoading ? 'Logging In...' : 'Log In'}
          </button>
        </form>

        <div className="divider">
          <span>or</span>
        </div>

        <div className="form-footer">
          <p>Don't have an account? <Link to="/register">Register here</Link></p>
        </div>
      </div>

      <div className="image-container">
        <div className="overlay"></div>
        <div className="content">
          <h2>Welcome to Embinsys</h2>
          <p>Your gateway to professional growth and career opportunities. Log in to access your personalized dashboard and take your assessments.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 