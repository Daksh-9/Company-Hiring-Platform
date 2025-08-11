import React, { useState } from 'react';

const MyProfile = () => {
  const [profile, setProfile] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    collegeName: 'Tech University',
    branch: 'Computer Science',
    yearOfStudy: '3',
    rollNumber: 'CS2023001',
    testsCompleted: 5,
    averageScore: 85,
    certificates: 2
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile(profile);
  };

  const handleSave = () => {
    setProfile(editedProfile);
    setIsEditing(false);
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
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-trophy"></i>
            </div>
            <div className="stat-info">
              <h4>Tests Completed</h4>
              <span className="stat-number">{profile.testsCompleted}</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <div className="stat-info">
              <h4>Average Score</h4>
              <span className="stat-number">{profile.averageScore}%</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-certificate"></i>
            </div>
            <div className="stat-info">
              <h4>Certificates</h4>
              <span className="stat-number">{profile.certificates}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;

