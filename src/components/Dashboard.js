import React from "react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const testCategories = [
    {
      id: "aptitude",
      title: "Aptitude Test",
      description: "Test your logical reasoning and problem-solving skills",
      icon: "fas fa-brain",
      color: "#667eea",
      questions: 25,
      duration: "30 min",
    },
    {
      id: "coding",
      title: "Coding Test",
      description: "Demonstrate your programming and algorithm skills",
      icon: "fas fa-code",
      color: "#764ba2",
      questions: 15,
      duration: "45 min",
    },
    {
      id: "english",
      title: "English Test",
      description: "Assess your communication and language proficiency",
      icon: "fas fa-language",
      color: "#f093fb",
      questions: 20,
      duration: "25 min",
    },
  ];

  const handleTestStart = (testId) => {
    console.log(`Starting ${testId} test`);
    // Here you would navigate to the specific test or show test instructions
  };

  return (
    <div className="dashboard-container">
      <nav className="main-navbar">
        {/* Left Navbar */}
        <div className="left-navbar">
          <Link to="/" className="logo">
            <i className="fas fa-home"></i> <span>Home</span>
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

        {/* Dashboard Navbar */}
        <nav className="dashboard-navbar">
          <div className="nav-left">
            <Link to="/" className="logo">
              <i className="fas fa-briefcase"></i> Embinsys
            </Link>
          </div>
          <div className="nav-center">
            <h1>Student Dashboard</h1>
          </div>
          <div className="nav-right">
            <div className="user-info">
              <i className="fas fa-user-circle"></i>
              <span>Welcome, Student</span>
            </div>
            <button className="logout-btn">
              <i className="fas fa-sign-out-alt"></i>
              Logout
            </button>
          </div>
        </nav>
      </nav>

      {/* Dashboard Content */}
      <div className="dashboard-content">
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
                  onClick={() => handleTestStart(test.id)}
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
    </div>
  );
};

export default Dashboard;
