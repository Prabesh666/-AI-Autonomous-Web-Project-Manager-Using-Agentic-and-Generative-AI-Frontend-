import { useState } from 'react';
import './ProfilePage.css';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('Profile Information');

  const tabs = ['Profile Information', 'Activity Summary', 'Preferences'];

  return (
    <div className="profile-container">
      {/* Profile Header Card */}
      <div className="profile-header-card">
        <div className="profile-header-content">
          <div className="profile-avatar-wrapper">
            <img 
              src="https://randomuser.me/api/portraits/men/32.jpg" 
              alt="Alex Rivera" 
              className="profile-avatar"
            />
            <button className="btn-camera" aria-label="Change photo">
              📷
            </button>
          </div>
          <div className="profile-info">
            <div className="profile-name-row">
              <h1 className="profile-name">Alex Rivera</h1>
              <span className="account-badge">ADMIN ACCOUNT</span>
            </div>
            <p className="profile-role">AI Project Manager at Product Development</p>
            <div className="profile-contact-info">
              <span className="contact-item">✉️ alex.rivera@example.com</span>
              <span className="contact-item">📞 +1 (555) 012-3456</span>
              <span className="contact-item">📍 San Francisco, CA</span>
            </div>
          </div>
          <div className="profile-actions">
            <button className="btn-edit-profile">✏️ Edit Profile</button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="profile-tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              <span className="tab-icon">
                {tab === 'Profile Information' ? '👤 ' : tab === 'Activity Summary' ? '⏱️ ' : '⚙️ '}
              </span>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="profile-grid">
        {/* Left Column */}
        <div className="profile-col-left">
          {/* Personal Details Section */}
          <section className="profile-section">
            <h3 className="section-title">Personal Details</h3>
            <div className="details-list">
              <div className="detail-row">
                <span className="detail-label">Full Name</span>
                <span className="detail-value">Alex Rivera</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Job Title</span>
                <span className="detail-value">AI Project Manager</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Department</span>
                <span className="detail-value">Product Development</span>
              </div>
              <div className="detail-row align-top">
                <span className="detail-label">Bio</span>
                <span className="detail-value bio-text">
                  "Driving AI innovation through agile project management and strategic model deployment. 
                  Passionate about ethical AI and LLM optimization."
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Employee ID</span>
                <span className="detail-value">#EMP-9021-X</span>
              </div>
            </div>
          </section>

          {/* Skill Expertise Section */}
          <section className="profile-section">
            <h3 className="section-title">Skill Expertise</h3>
            <div className="skills-container">
              <span className="skill-tag">Project Management</span>
              <span className="skill-tag">Machine Learning</span>
              <span className="skill-tag">Agile/Scrum</span>
              <span className="skill-tag">LLM Fine-tuning</span>
              <span className="skill-tag">Strategic Planning</span>
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="profile-col-right">
          {/* Quick Stats Card */}
          <div className="stats-card">
            <h3 className="card-title">QUICK STATS</h3>
            <div className="stat-row">
              <span className="stat-label">Projects Lead</span>
              <span className="stat-value">12</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Active Tasks</span>
              <span className="stat-value">34</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Avg. Completion</span>
              <span className="stat-value">92%</span>
            </div>
          </div>

          {/* Security Card */}
          <div className="security-card">
            <h3 className="card-title">Security</h3>
            <div className="security-row">
              <span className="security-label">Two-Factor Auth</span>
              <span className="security-status success">ON</span>
            </div>
            <div className="security-row">
              <span className="security-label">Password Strength</span>
              <span className="security-status primary">STRONG</span>
            </div>
            <button className="btn-signout-all">Sign Out from All Devices</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
