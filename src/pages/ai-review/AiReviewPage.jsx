import { useState } from 'react';
import './AiReviewPage.css';

const AiReviewPage = () => {
  const [messages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "I've completed the analysis of the Alpha Release roadmap. Overall, the project structure is sound, but I've noticed a few bottlenecks in the deployment automation pipeline that could delay the release by 4 days.",
      suggestionAction: {
        text: "Would you like me to re-allocate the DevOps resources from the QA sync to prioritize the CI/CD fix?",
      }
    },
    {
      id: 2,
      sender: 'user',
      text: "Yes, let's prioritize that. Also, check if we need to update the documentation for the API endpoints before the Alpha."
    },
    {
      id: 3,
      sender: 'ai',
      text: "Understood. I am reassigning Sarah and updating the project timeline. I've also added 3 new sub-tasks for the API documentation review.",
      timelineUpdate: "Project timeline updated for sprint 4"
    }
  ]);

  return (
    <div className="ai-review-wrapper">
      {/* Left Chat Window */}
      <div className="review-chat-section">
        <header className="chat-header">
          <div className="header-breadcrumbs">
            <span className="breadcrumb-path">AI Web PM</span> / <strong>Alpha Release Planning</strong>
          </div>
          <div className="header-actions">
            <button className="icon-btn">🔍</button>
            <button className="icon-btn">🔔</button>
            <button className="icon-btn share-btn">Share</button>
          </div>
        </header>

        <div className="chat-timeline">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-message ${msg.sender}`}>
              {msg.sender === 'ai' && (
                <div className="avatar ai-avatar">
                  <span className="icon">🤖</span>
                </div>
              )}
              
              <div className="message-content">
                <p>{msg.text}</p>

                {msg.suggestionAction && (
                  <div className="suggestion-box">
                    <span className="suggestion-label">SUGGESTED ACTION</span>
                    <p>{msg.suggestionAction.text}</p>
                  </div>
                )}
                
                {msg.timelineUpdate && (
                  <div className="timeline-update-box">
                    <span className="icon">⏱️</span>
                    <span>{msg.timelineUpdate}</span>
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="avatar user-avatar">
                  <span className="icon">👤</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="chat-input-area">
          <div className="input-field-wrapper">
            <span className="input-icon">✨</span>
            <input type="text" placeholder="Ask AI to manage tasks, updates, or insights..." />
            <button className="btn-send">Send</button>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="review-sidebar-section">
        <h3 className="sidebar-title">⚡ AI Project Review</h3>
        
        <div className="review-score-card">
          <div className="score-header">
            <span>PROJECT HEALTH</span>
            <span className="status-badge stable">Stable</span>
          </div>
          <div className="score-circle">
            <svg viewBox="0 0 36 36" className="circular-chart">
              <path className="circle-bg"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path className="circle"
                strokeDasharray="75, 100"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <text x="18" y="20.35" className="percentage">75%</text>
            </svg>
            <div className="score-details">
              <strong>24 / 32 tasks</strong>
              <span>Milestone: Alpha Release</span>
            </div>
          </div>
        </div>

        <div className="insights-card">
          <div className="insight-item success">
            <span className="icon">✓</span>
            <div>
              <strong>On-track</strong>
              <p>Task structure is well-defined and logical. Current velocity is 15% above average.</p>
            </div>
          </div>
          
          <div className="insight-item warning">
            <span className="icon">⚡</span>
            <div>
              <strong>Improvements</strong>
              <ul>
                <li>2 missing tasks in the deployment flow detected.</li>
                <li>Timeline optimization possible for sprint 4.</li>
              </ul>
            </div>
          </div>
          
          <div className="insight-item danger">
            <span className="icon">⚠️</span>
            <div>
              <strong>Risk Alert</strong>
              <p>Resource overload in the Dev team for next week based on current task assignments.</p>
            </div>
          </div>
        </div>

        <button className="btn-primary-glow full-width">
          ✨ Apply AI Improvements
        </button>
      </div>
    </div>
  );
};

export default AiReviewPage;
