import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './AIWorkspace.css';

const AIWorkspace = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="ai-workspace-layout">
      {/* 1. LEFT SIDEBAR */}
      <aside className="workspace-sidebar">
        <div className="ws-brand" onClick={() => navigate('/')}>
          <div className="logo-icon blue base"></div>
          <div className="brand-text">
            <h2>Workspace</h2>
            <span>AI Planning Mode</span>
          </div>
        </div>

        <nav className="ws-nav">
          <NavLink to="/dashboard" className="ws-nav-item">
            <span className="icon">㗊</span> Dashboard
          </NavLink>
          <NavLink to="/tasks" className="ws-nav-item">
            <span className="icon">✓</span> Tasks
          </NavLink>
          <div className="ws-nav-item active">
            <span className="icon">🧠</span> AI Logs
          </div>
          <div className="ws-nav-item">
            <span className="icon">👥</span> Team
          </div>
        </nav>

        <div className="ws-sidebar-footer">
          <button className="btn-new-project full-width">
            + New Project
          </button>
          <div className="user-profile-widget mt-4">
            <div className="user-avatar image placeholder"></div>
            <div className="user-info">
              <span className="user-name">Alex Rivera</span>
              <span className="user-plan">PRO PLAN</span>
            </div>
            <button className="settings-btn">⚙️</button>
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="ai-main-content">
        <header className="ai-topbar">
          <div className="breadcrumbs">
            <span>Projects › Current Review</span>
            <h2>AI Review</h2>
          </div>
          <div className="header-actions">
            <div className="search-bar light">
              <span className="search-icon">🔍</span>
              <input type="text" placeholder="Search insights..." />
            </div>
            <button className="icon-btn theme-btn" onClick={toggleTheme}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button className="icon-btn">🔗</button>
            <button className="icon-btn">⬇️</button>
          </div>
        </header>

        <div className="review-scroll-area">
          {/* Status Card */}
          <div className="status-overview-card">
            <div className="status-header">
              <div>
                <h3>Current Project Status</h3>
                <p>Reviewing system architecture and logic flows</p>
              </div>
              <div className="completion-rate">
                <span className="percent">75%</span>
                <span className="label">COMPLETED</span>
              </div>
            </div>
            <div className="progress-bar-container large">
              <div className="progress-bar blue" style={{ width: '75%' }}></div>
            </div>
            <div className="status-legend">
              <span className="legend-item"><span className="dot green"></span> 12 Resolved</span>
              <span className="legend-item"><span className="dot blue"></span> 3 In Progress</span>
              <span className="legend-item"><span className="dot red"></span> 1 Urgent</span>
            </div>
          </div>

          <div className="review-items-header">
            <h3>REVIEW ITEMS</h3>
            <a href="#">View All</a>
          </div>

          <div className="review-items-list">
            <div className="review-item-row resolved">
              <div className="item-icon green">⤨</div>
              <div className="item-content">
                <h4>Logic Flow Check</h4>
                <p>Validation of primary authentication handshake</p>
              </div>
              <span className="tag badge-green text-green">RESOLVED</span>
            </div>

            <div className="review-item-row in-progress">
              <div className="item-icon blue">📋</div>
              <div className="item-content">
                <h4>Edge Case Analysis</h4>
                <p>Testing high-concurrency database queries</p>
              </div>
              <span className="tag badge-blue text-blue">IN PROGRESS</span>
            </div>

            <div className="review-item-row high-priority">
              <div className="item-icon red">🛡️</div>
              <div className="item-content">
                <h4>Security Vulnerability</h4>
                <p>Potential data leak in public endpoint /api/v1/stats</p>
              </div>
              <span className="tag badge-red text-red">HIGH PRIORITY</span>
            </div>

            <div className="review-item-row pending">
              <div className="item-icon gray">☁️</div>
              <div className="item-content">
                <h4>Performance Optimization</h4>
                <p>Idle state CPU usage review</p>
              </div>
              <span className="tag badge-gray text-gray">PENDING</span>
            </div>
          </div>
        </div>

        {/* Pinned Ask AI Input */}
        <div className="ask-ai-widget">
          <div className="input-wrapper shadow">
            <button className="attach-btn">📎</button>
            <input type="text" placeholder="Ask AI about this review..." />
            <button className="voice-btn">🎤</button>
            <button className="send-btn blue-fill">➤</button>
          </div>
        </div>
      </main>

      {/* 3. RIGHT INSIGHTS SIDEBAR */}
      <aside className="insights-sidebar">
        <div className="insights-header">
          <h3>AI Insights</h3>
        </div>
        
        <div className="insights-scroll-area">
          <div className="insight-section">
            <h4>SUMMARY STATISTICS</h4>
            <div className="stats-row">
               <div className="stat-box">
                 <span className="stat-val">24</span>
                 <span className="stat-lbl">Total Checks</span>
               </div>
               <div className="stat-box">
                 <span className="stat-val blue">8.2s</span>
                 <span className="stat-lbl">Avg Latency</span>
               </div>
            </div>
          </div>

          <div className="insight-section">
            <h4>ACTIVE COLLABORATORS</h4>
            <div className="avatars medium">
              <div className="avatar">A</div>
              <div className="avatar">B</div>
              <div className="avatar">C</div>
              <div className="avatar label">+4</div>
            </div>
          </div>

          <div className="insight-section">
            <div className="ai-suggestion-card">
              <div className="card-header">
                 <span className="bulb-icon">💡</span>
                 <h5>AI Suggestion</h5>
              </div>
              <p>Consider upgrading the API gateway to handle the detected edge case latency peaks in the US-East region.</p>
            </div>
          </div>
        </div>

        <div className="insights-footer">
          <span>Server Status</span>
          <span className="status-indicator"><span className="dot green"></span> Operational</span>
        </div>
      </aside>
    </div>
  );
};

export default AIWorkspace;
