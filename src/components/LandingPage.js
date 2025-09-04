import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="landing-container">
      <nav className="navbar navbar-dark">
        <Link to="/" className="logo brand">
          <img src="/logo.png" alt="Embinsys" className="brand-logo" />
        </Link>
        <div className="nav-buttons">
          <Link to="/login" className="btn-nav">Log In</Link>
          <Link to="/register" className="btn-nav primary">Register</Link>
        </div>
      </nav>
      
      <section className="hero-section">
        <div className="hero-content">
          <h1>Find Your Dream Job</h1>
          <p>Connect with top employers and discover opportunities that match your skills and aspirations. Join thousands of professionals who have found their perfect career path.</p>
          <div className="hero-buttons">
            <Link to="/register" className="btn-hero primary">
              <i className="fas fa-user-plus"></i>
              Get Started
            </Link>
            <Link to="/login" className="btn-hero secondary">
              <i className="fas fa-sign-in-alt"></i>
              Log In
            </Link>
          </div>
        </div>
      </section>
      
      <section className="features-section">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-search"></i>
            </div>
            <h3>Smart Job Search</h3>
            <p>Find the perfect job with our intelligent matching algorithm that considers your skills, experience, and preferences.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-building"></i>
            </div>
            <h3>Top Companies</h3>
            <p>Connect with leading companies from various industries and discover opportunities that align with your career goals.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <h3>Career Growth</h3>
            <p>Track your application progress and get insights to improve your profile and increase your chances of landing your dream job.</p>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <Link to="/" className="logo brand">
              <img src="/logo.png" alt="Embinsys" className="brand-logo" />
            </Link>
            <p>Empowering careers through better hiring.</p>
          </div>
          <div className="footer-links">
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
            <a href="mailto:support@example.com">Support</a>
          </div>
          <div className="footer-copy">
            <span>© {new Date().getFullYear()} Embinsys. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 