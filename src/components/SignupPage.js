import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    collegeName: '',
    branch: '',
    yearOfStudy: '',
    email: '',
    phone: '',
    rollNumber: '',
    password: '',
    confirmPassword: '',
    userType: '',
    terms: false,
    newsletter: false
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

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
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.collegeName.trim()) newErrors.collegeName = 'College name is required';
    if (!formData.branch) newErrors.branch = 'Branch is required';
    if (!formData.yearOfStudy) newErrors.yearOfStudy = 'Year of study is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.rollNumber.trim()) newErrors.rollNumber = 'Roll number is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.userType) newErrors.userType = 'Please select an account type';
    if (!formData.terms) newErrors.terms = 'You must agree to the terms of service';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      // Prepare data for backend (matching our MongoDB schema)
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        userType: formData.userType,
        newsletter: formData.newsletter,
        // Additional fields for student registration
        collegeName: formData.collegeName,
        branch: formData.branch,
        yearOfStudy: formData.yearOfStudy,
        rollNumber: formData.rollNumber
      };

      console.log('📝 Sending registration data:', userData);

      // Make API call to backend
      const response = await fetch('http://localhost:5000/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Registration successful:', result);
        alert('Registration successful! Welcome to our platform.');
        // You can redirect to login page or dashboard here
        // window.location.href = '/login';
      } else {
        console.error('❌ Registration failed:', result.message);
        alert(result.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      alert('An error occurred. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        <div className="form-header">
          <h1>Register Account</h1>
          <p>Join thousands of professionals and find your next opportunity</p>
        </div>
        <form className="register-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <div className="input-icon">
                <i className="fas fa-user"></i>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={errors.firstName ? 'error' : ''}
                  required
                />
              </div>
              {errors.firstName && <span className="error-message">{errors.firstName}</span>}
            </div>
            <div className="form-group">
              <div className="input-icon">
                <i className="fas fa-user"></i>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={errors.lastName ? 'error' : ''}
                  required
                />
              </div>
              {errors.lastName && <span className="error-message">{errors.lastName}</span>}
            </div>
          </div>
          <div className="form-group">
            <div className="input-icon">
              <i className="fas fa-university"></i>
              <input
                type="text"
                id="collegeName"
                name="collegeName"
                placeholder="College name"
                value={formData.collegeName}
                onChange={handleChange}
                className={errors.collegeName ? 'error' : ''}
                required
              />
            </div>
            {errors.collegeName && <span className="error-message">{errors.collegeName}</span>}
          </div>
          <div className="form-group">
            <select
              id="branch"
              name="branch"
              className={`form-select ${errors.branch ? 'error' : ''}`}
              value={formData.branch}
              onChange={handleChange}
              required
            >
              <option value="">Select branch</option>
              <option value="EEE">EEE</option>
              <option value="ECE">ECE</option>
              <option value="MECH">MECH</option>
              <option value="Data Science">Data Science</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Cyber Security">Cyber Security</option>
              <option value="Artificial Intelligence and ML">Artificial Intelligence and ML</option>
              <option value="IoT">IoT</option>
            </select>
            {errors.branch && <span className="error-message">{errors.branch}</span>}
          </div>
          <div className="form-group">
            <select
              id="yearOfStudy"
              name="yearOfStudy"
              className={`form-select ${errors.yearOfStudy ? 'error' : ''}`}
              value={formData.yearOfStudy}
              onChange={handleChange}
              required
            >
              <option value="">Select year of study</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
            {errors.yearOfStudy && <span className="error-message">{errors.yearOfStudy}</span>}
          </div>
          <div className="form-group">
            <div className="input-icon">
              <i className="fas fa-envelope"></i>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                required
              />
            </div>
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>
          <div className="form-group">
            <div className="input-icon">
              <i className="fas fa-phone"></i>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="Phone number"
                value={formData.phone}
                onChange={handleChange}
                className={errors.phone ? 'error' : ''}
                required
              />
            </div>
            {errors.phone && <span className="error-message">{errors.phone}</span>}
          </div>
          <div className="form-group">
            <div className="input-icon">
              <i className="fas fa-id-card"></i>
              <input
                type="text"
                id="rollNumber"
                name="rollNumber"
                placeholder="Roll number"
                value={formData.rollNumber}
                onChange={handleChange}
                className={errors.rollNumber ? 'error' : ''}
                required
              />
            </div>
            {errors.rollNumber && <span className="error-message">{errors.rollNumber}</span>}
          </div>
          <div className="form-group">
            <div className="input-icon">
              <i className="fas fa-lock"></i>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Create password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'error' : ''}
                required
              />
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>
          <div className="form-group">
            <div className="input-icon">
              <i className="fas fa-lock"></i>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? 'error' : ''}
                required
              />
            </div>
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>
          <div className="form-group">
            <select
              id="userType"
              name="userType"
              className={`form-select ${errors.userType ? 'error' : ''}`}
              value={formData.userType}
              onChange={handleChange}
              required
            >
              <option value="">Select account type</option>
              <option value="jobseeker">Job Seeker</option>
              <option value="employer">Employer</option>
              <option value="recruiter">Recruiter</option>
            </select>
            {errors.userType && <span className="error-message">{errors.userType}</span>}
          </div>
          <div className="form-options">
            <label className="checkbox-container">
              <input
                type="checkbox"
                name="terms"
                checked={formData.terms}
                onChange={handleChange}
                required
              />
              <span className="checkmark"></span>
              I agree to the <a href="#" className="terms-link">Terms of Service</a> and <a href="#" className="terms-link">Privacy Policy</a>
            </label>
            {errors.terms && <span className="error-message">{errors.terms}</span>}
            <label className="checkbox-container">
              <input
                type="checkbox"
                name="newsletter"
                checked={formData.newsletter}
                onChange={handleChange}
              />
              <span className="checkmark"></span>
              Subscribe to our newsletter for job updates
            </label>
          </div>
          <button 
            type="submit" 
            className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {!isLoading && <i className="fas fa-user-plus"></i>}
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <div className="divider">
          <span>or</span>
        </div>
        <div className="form-footer">
          <p>Already have an account? <Link to="/login">Log in here</Link></p>
        </div>
      </div>
      <div className="image-container">
        <div className="overlay"></div>
        <div className="content">
          <h2>Start Your Journey</h2>
          <p>Create your profile and unlock access to thousands of job opportunities from leading companies worldwide.</p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 