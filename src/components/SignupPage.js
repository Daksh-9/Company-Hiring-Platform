import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate

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
    terms: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Removed token state variables: token, isTokenValid, tokenCheckStatus, tokenMessage

  const navigate = useNavigate(); // Added useNavigate hook

  // Removed useEffect hook for token verification

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear specific error when input changes
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
     // Clear general form error when any input changes
    if (errors.form) {
       setErrors(prev => ({...prev, form: ''}));
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
    // Basic phone validation (e.g., 10 digits) - adjust regex as needed
    else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Phone number must be 10 digits';
    if (!formData.rollNumber.trim()) newErrors.rollNumber = 'Roll number is required';
    if (!formData.terms) newErrors.terms = 'You must agree to the terms of service';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return; // Validation remains
    setIsLoading(true);
    setErrors({}); // Clear previous errors on new submission

    try {
      // User data includes all form fields except the token
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        collegeName: formData.collegeName,
        branch: formData.branch,
        yearOfStudy: formData.yearOfStudy,
        rollNumber: formData.rollNumber,
        // terms field is usually not sent, handled by validation
      };

      console.log('📝 Sending registration data:', userData);

      const response = await fetch('/api/signup', { // Backend endpoint remains the same
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const result = await response.json();

      if (response.ok && result.success) { // Check response.ok as well
        console.log('✅ Registration successful:', result);
        alert('Registration successful! Check your email for login credentials.');
        navigate('/login'); // Redirect to login after successful registration
      } else {
        console.error('❌ Registration failed:', result.message);
        // Display general form error or specific field error if applicable
        setErrors(prev => ({ ...prev, form: result.message || 'Registration failed. Please try again.' }));
        // Optionally map specific backend errors back to form fields if needed
        // e.g., if (result.message.includes("Email already registered")) { setErrors(prev => ({...prev, email: result.message})); }
        alert(result.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('❌ Registration network error:', error);
      // Display general form error for network issues
      setErrors(prev => ({ ...prev, form: 'An error occurred during registration. Please check your network and try again.' }));
      alert('An error occurred during registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Removed conditional rendering based on tokenCheckStatus and isTokenValid

  // Render the original form directly
  return (
    <div className="container">
      <div className="form-container">
        <div className="form-header">
          <h1>Register Account</h1>
          <p>Join thousands of professionals and find your next opportunity</p>
        </div>
        {/* Display general form error */}
        {errors.form && <div className="error-message mb-4 text-center bg-red-100 p-2 rounded border border-red-300">{errors.form}</div>}
        <form className="register-form" onSubmit={handleSubmit}>
          {/* Form Row 1: First Name, Last Name */}
          <div className="form-row">
            <div className="form-group">
              <div className="input-icon">
                <i className="fas fa-user"></i>
                <input type="text" id="firstName" name="firstName" placeholder="First name" value={formData.firstName} onChange={handleChange} className={errors.firstName ? 'error' : ''} required />
              </div>
              {errors.firstName && <span className="error-message">{errors.firstName}</span>}
            </div>
            <div className="form-group">
              <div className="input-icon">
                <i className="fas fa-user"></i>
                <input type="text" id="lastName" name="lastName" placeholder="Last name" value={formData.lastName} onChange={handleChange} className={errors.lastName ? 'error' : ''} required />
              </div>
              {errors.lastName && <span className="error-message">{errors.lastName}</span>}
            </div>
          </div>

           {/* College Name */}
           <div className="form-group">
             <div className="input-icon">
               <i className="fas fa-university"></i>
               <input type="text" id="collegeName" name="collegeName" placeholder="College name" value={formData.collegeName} onChange={handleChange} className={errors.collegeName ? 'error' : ''} required />
             </div>
             {errors.collegeName && <span className="error-message">{errors.collegeName}</span>}
           </div>

           {/* Branch */}
           <div className="form-group">
             <select id="branch" name="branch" className={`form-select ${errors.branch ? 'error' : ''}`} value={formData.branch} onChange={handleChange} required >
               <option value="">Select branch</option>
               {/* Add your branch options here */}
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

           {/* Year of Study */}
           <div className="form-group">
             <select id="yearOfStudy" name="yearOfStudy" className={`form-select ${errors.yearOfStudy ? 'error' : ''}`} value={formData.yearOfStudy} onChange={handleChange} required >
               <option value="">Select year of study</option>
               <option value="1">1</option>
               <option value="2">2</option>
               <option value="3">3</option>
               <option value="4">4</option>
             </select>
             {errors.yearOfStudy && <span className="error-message">{errors.yearOfStudy}</span>}
           </div>

          {/* Email */}
          <div className="form-group">
            <div className="input-icon">
              <i className="fas fa-envelope"></i>
              <input type="email" id="email" name="email" placeholder="Email address" value={formData.email} onChange={handleChange} className={errors.email ? 'error' : ''} required />
            </div>
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          {/* Phone */}
          <div className="form-group">
            <div className="input-icon">
              <i className="fas fa-phone"></i>
              <input type="tel" id="phone" name="phone" placeholder="Phone number (10 digits)" value={formData.phone} onChange={handleChange} className={errors.phone ? 'error' : ''} required />
            </div>
            {errors.phone && <span className="error-message">{errors.phone}</span>}
          </div>

           {/* Roll Number */}
           <div className="form-group">
             <div className="input-icon">
               <i className="fas fa-id-card"></i>
               <input type="text" id="rollNumber" name="rollNumber" placeholder="Roll number" value={formData.rollNumber} onChange={handleChange} className={errors.rollNumber ? 'error' : ''} required />
             </div>
             {errors.rollNumber && <span className="error-message">{errors.rollNumber}</span>}
           </div>

          {/* Terms Checkbox */}
          <div className="form-options">
            <label className="checkbox-container">
              <input type="checkbox" name="terms" checked={formData.terms} onChange={handleChange} required />
              <span className="checkmark"></span>
              I agree to the <a href="#" className="terms-link">Terms of Service</a> and <a href="#" className="terms-link">Privacy Policy</a>
            </label>
             {/* Display terms error directly below checkbox */}
             {errors.terms && <span className="error-message" style={{ display: 'block', width: '100%', marginTop: '5px' }}>{errors.terms}</span>}
          </div>


          {/* Submit Button */}
          <button
            type="submit"
            className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {!isLoading && <i className="fas fa-user-plus"></i>}
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>

        {/* Divider and Footer */}
        <div className="divider"><span>or</span></div>
        <div className="form-footer">
          <p>Already have an account? <Link to="/login">Log in here</Link></p>
        </div>
      </div>
      <div className="image-container"> {/* Keep existing */}
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