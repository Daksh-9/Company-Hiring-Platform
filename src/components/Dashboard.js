import React from "react";
import { Link, Routes, Route, useNavigate } from "react-router-dom";
import MyProfile from "./MyProfile";
import MCQTest from "./Assessments/MCQTest";
import CodingTest from "./Assessments/CodingTest";
import ParagraphTest from "./Assessments/ParagraphTest";
import Help from "./Help";

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear any stored user data
    localStorage.removeItem('user');
    sessionStorage.clear();
    // Redirect to login page
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      {/* Persistent Navbar */}
      <nav className="dashboard-navbar">
        <div className="nav-left">
          <Link to="/dashboard" className="logo">
            <i className="fas fa-briefcase"></i> Embinsys

          </Link>
          <ul>
            <li>
              <Link to="/job-profiles">
                <i className="fas fa-briefcase"></i> <span>Job Profiles</span>
              </Link>
            </li>
            <li>
              <Link to="/my-profile">
                <i className="fas fa-user"></i> <span>My Profile</span>
              </Link>
            </li>
            <li>
              <Link to="/assessments">
                <i className="fas fa-tasks"></i> <span>Assessments</span>
              </Link>
            </li>
            <li>
              <Link to="/help">
                <i className="fas fa-question-circle"></i> <span>Help</span>
              </Link>
            </li>
          </ul>
        </div>
        <div className="nav-center">
          <h1>Student Dashboard</h1>
        </div>
        <div className="nav-right">
          <div className="nav-links">
            <Link to="/dashboard/profile" className="nav-link">
              <i className="fas fa-user"></i> My Profile
            </Link>
            <Link to="/dashboard/assessments" className="nav-link">
              <i className="fas fa-tasks"></i> Assessments
            </Link>
            <Link to="/dashboard/help" className="nav-link">
              <i className="fas fa-question-circle"></i> Help
            </Link>
          </div>
          <div className="user-info">
            <i className="fas fa-user-circle"></i>
            <span>Welcome, Student</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            Logout
          </button>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="dashboard-content">
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/profile" element={<MyProfile />} />
          <Route path="/assessments" element={<AssessmentsHome />} />
          <Route path="/assessments/mcq" element={<MCQTest />} />
          <Route path="/assessments/coding" element={<CodingTest />} />
          <Route path="/assessments/paragraph" element={<ParagraphTest />} />
          <Route path="/help" element={<Help />} />
        </Routes>
      </div>
    </div>
  );
};

// Dashboard Home Component
const DashboardHome = () => {
  const navigate = useNavigate();
  const testCategories = [
    {
      id: "mcq",
      title: "MCQ Test",
      description: "Test your knowledge with multiple choice questions",
      icon: "fas fa-brain",
      color: "#667eea",
      questions: 25,
      duration: "30 min",
      route: "/dashboard/assessments/mcq"
    },
    {
      id: "coding",
      title: "Coding Test",
      description: "Demonstrate your programming and algorithm skills",
      icon: "fas fa-code",
      color: "#764ba2",
      questions: 15,
      duration: "45 min",
      route: "/dashboard/assessments/coding"
    },
    {
      id: "paragraph",
      title: "Paragraph Test",
      description: "Assess your communication and writing skills",
      icon: "fas fa-pen-fancy",
      color: "#f093fb",
      questions: 20,
      duration: "25 min",
      route: "/dashboard/assessments/paragraph"
    },
  ];
  const handleLogout = () => {
    // Clear any stored user data
    localStorage.removeItem('user');
    sessionStorage.clear();

    // Redirect to login page
    navigate('/landingPage');
  };

  const handleTestStart = (route) => {
    window.location.href = route;
  };

  return (
    <div className="dashboard-home">
      <div className="dashboard-header">
        <h2>Available Tests</h2>
        <p>Select a test to begin your assessment</p>
      </div>

      <div className="tests-grid">
        {testCategories.map((test) => (
          <div key={test.id} className="test-card">
            <div
              className="test-icon"
              style={{ backgroundColor: test.color }}
            >
              <i className={test.icon}></i>
            </div>
            <div className="test-info">
              <h3>{test.title}</h3>
              <p>{test.description}</p>
              <div className="test-details">
                <span>
                  <i className="fas fa-question-circle"></i> {test.questions}{" "}
                  Questions
                </span>
                <span>
                  <i className="fas fa-clock"></i> {test.duration}
                </span>
              </div>
              <button
                className="start-test-btn"
                onClick={() => handleTestStart(test.route)}
                style={{ backgroundColor: test.color }}
              >
                <i className="fas fa-play"></i>
                Start Test
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-trophy"></i>
          </div>
          <div className="stat-info">
            <h4>Tests Completed</h4>
            <span className="stat-number">0</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-chart-line"></i>
          </div>
          <div className="stat-info">
            <h4>Average Score</h4>
            <span className="stat-number">--</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-certificate"></i>
          </div>
          <div className="stat-info">
            <h4>Certificates</h4>
            <span className="stat-number">0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Assessments Home Component
const AssessmentsHome = () => {
  const assessments = [
    {
      id: "mcq",
      title: "MCQ Test",
      description: "Test your knowledge with multiple choice questions",
      icon: "fas fa-brain",
      color: "#667eea",
      route: "/dashboard/assessments/mcq"
    },
    {
      id: "coding",
      title: "Coding Test",
      description: "Demonstrate your programming and algorithm skills",
      icon: "fas fa-code",
      color: "#764ba2",
      route: "/dashboard/assessments/coding"
    },
    {
      id: "paragraph",
      title: "Paragraph Test",
      description: "Assess your communication and writing skills",
      icon: "fas fa-pen-fancy",
      color: "#f093fb",
      route: "/dashboard/assessments/paragraph"
    },
  ];

  return (
    <div className="assessments-home">
      <div className="dashboard-header">
        <h2>Available Assessments</h2>
        <p>Choose an assessment to begin</p>
      </div>

      <div className="tests-grid">
        {assessments.map((assessment) => (
          <div key={assessment.id} className="test-card">
            <div
              className="test-icon"
              style={{ backgroundColor: assessment.color }}
            >
              <i className={assessment.icon}></i>
            </div>
            <div className="test-info">
              <h3>{assessment.title}</h3>
              <p>{assessment.description}</p>
              <Link to={assessment.route} className="start-test-btn" style={{ backgroundColor: assessment.color }}>
                <i className="fas fa-play"></i>
                Start Assessment
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
