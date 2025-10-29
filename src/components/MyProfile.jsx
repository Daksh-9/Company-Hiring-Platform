import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MyProfile = () => {
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [stats, setStats] = useState({ 
    testsCompleted: 0,
    averageScore: 0, // UPDATED: Changed from highestScore to averageScore
    lastTestInfo: { type: '--', score: '--' },
  });
  const navigate = useNavigate();

  const fetchStats = useCallback(async (token, userId) => {
    if (!token || !userId) return;

    try {
      // 1. Fetch general test results (MCQ, Paragraph)
      const generalResultsPromise = axios.get('/api/results', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // 2. Fetch coding test results
      const codingSubmissionsPromise = axios.get('/api/coding-submissions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const [generalRes, codingRes] = await Promise.all([generalResultsPromise, codingSubmissionsPromise]);
      
      const generalResults = (generalRes.data.results || []).map(r => ({ 
        score: r.score, 
        completedAt: new Date(r.completedAt).getTime(), 
        type: r.testType
      }));

      const codingResults = (codingRes.data.submissions || [])
        .filter(s => s.overallResult?.score !== undefined)
        .map(s => ({
          score: s.overallResult.score,
          completedAt: new Date(s.submittedAt).getTime(),
          type: 'Coding'
        }));
        
      const allResults = [...generalResults, ...codingResults];

      const completed = allResults.length;
      let avgScore = 0; // UPDATED: Variable for average score
      let lastTest = { type: '--', score: '--' };
      const allScores = allResults.map(r => r.score);

      if (completed > 0) {
        // Calculate Average Score
        const totalScore = allScores.reduce((sum, score) => sum + score, 0);
        avgScore = Math.round(totalScore / completed); // Calculate and round the average
        
        // Find Last Test
        const sortedByDate = allResults.sort((a, b) => b.completedAt - a.completedAt);
        lastTest = {
          type: sortedByDate[0].type,
          score: sortedByDate[0].score
        };
      }

      setStats({
        testsCompleted: completed,
        averageScore: avgScore, // UPDATED: Setting average score
        lastTestInfo: lastTest
      });

    } catch (err) {
      console.error('Error fetching student stats:', err);
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem('userToken');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) {
      navigate('/login');
      return;
    }
    
    try {
      // Fetch user profile data
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setEditedProfile(data);
      } else {
        setError('Failed to fetch profile data.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
      // Fetch detailed statistics after profile is loaded
      fetchStats(token, userId);
    }
  }, [navigate, fetchStats]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    const token = localStorage.getItem('userToken');
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editedProfile)
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
        setIsEditing(false);
      } else {
        setError('Failed to update profile.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile(profile);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return <div className="text-center p-6">Loading profile...</div>;
  }
  
  if (error) {
    return <div className="text-center text-red-500 p-6">{error}</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>My Profile</h2>
        <p>Manage your personal information and view your progress</p>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-avatar">
            <i className="fas fa-user-circle"></i>
          </div>
          
          <div className="profile-info">
            {isEditing ? (
              <div className="edit-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={editedProfile.firstName}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={editedProfile.lastName}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editedProfile.email}
                    onChange={handleChange}
                    disabled
                  />
                </div>
                
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={editedProfile.phone}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>College Name</label>
                  <input
                    type="text"
                    name="collegeName"
                    value={editedProfile.collegeName}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Branch</label>
                    <input
                      type="text"
                      name="branch"
                      value={editedProfile.branch}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Year of Study</label>
                    <input
                      type="text"
                      name="yearOfStudy"
                      value={editedProfile.yearOfStudy}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Roll Number</label>
                  <input
                    type="text"
                    name="rollNumber"
                    value={editedProfile.rollNumber}
                    onChange={handleChange}
                    disabled
                  />
                </div>
                
                <div className="form-actions">
                  <button className="btn btn-primary" onClick={handleSave}>
                    <i className="fas fa-save"></i>
                    Save Changes
                  </button>
                  <button className="btn btn-secondary" onClick={handleCancel}>
                    <i className="fas fa-times"></i>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="profile-details">
                <div className="profile-name">
                  <h3>{profile.firstName} {profile.lastName}</h3>
                  <p className="profile-email">{profile.email}</p>
                </div>
                
                <div className="profile-stats">
                  <div className="stat-item">
                    <i className="fas fa-phone"></i>
                    <span>{profile.phone}</span>
                  </div>
                  <div className="stat-item">
                    <i className="fas fa-university"></i>
                    <span>{profile.collegeName}</span>
                  </div>
                  <div className="stat-item">
                    <i className="fas fa-graduation-cap"></i>
                    <span>{profile.branch} - Year {profile.yearOfStudy}</span>
                  </div>
                  <div className="stat-item">
                    <i className="fas fa-id-card"></i>
                    <span>{profile.rollNumber}</span>
                  </div>
                </div>
                
                <div className="profile-actions">
                  <button className="btn btn-primary" onClick={handleEdit}>
                    <i className="fas fa-edit"></i>
                    Edit Profile
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="profile-stats-grid">
          {/* Card 1: Tests Completed */}
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-tasks"></i>
            </div>
            <div className="stat-info">
              <h4>Tests Completed</h4>
              <span className="stat-number">{stats.testsCompleted}</span>
            </div>
          </div>
          
          {/* Card 2: Average Score (Updated) */}
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #00c6ff, #0072ff)' }}>
              <i className="fas fa-chart-line"></i> {/* Changed icon to chart-line */}
            </div>
            <div className="stat-info">
              <h4>Average Score</h4> {/* Changed title to Average Score */}
              <span className="stat-number">{stats.averageScore}%</span> {/* Displaying average score */}
            </div>
          </div>
          
          {/* Card 3: Last Test Taken (Kept) */}
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb, #f5576c)' }}>
              <i className="fas fa-history"></i>
            </div>
            <div className="stat-info">
              <h4>Last Test Taken</h4>
              <span className="stat-number">{stats.lastTestInfo.type}</span>
              <p className="text-sm text-gray-500 mt-1">Score: {stats.lastTestInfo.score}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;