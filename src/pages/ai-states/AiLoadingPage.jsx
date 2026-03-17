import './AiLoadingPage.css';

const AiLoadingPage = () => {
  return (
    <div className="ai-loading-wrapper">
      <header className="planner-header">
        <div className="planner-title">
          <span className="icon">📄</span>
          <div className="title-text">
            <span className="breadcrumb">Projects / <strong>New Plan</strong></span>
          </div>
        </div>
        <div className="planner-actions">
          <span className="status-badge processing">
            <span className="spinner-small"></span>
            Processing Project...
          </span>
          <button className="icon-btn">🔔</button>
          <div className="avatar-small">A</div>
        </div>
      </header>

      <div className="planner-canvas">
        {/* Left Toolbar Skeleton */}
        <div className="canvas-toolbar">
          <div className="toolbar-item active">📝</div>
          <div className="toolbar-item">📁</div>
          <div className="toolbar-item">⚙️</div>
        </div>

        {/* Main Content Area */}
        <div className="canvas-main">
          {/* User Prompt Bubble */}
          <div className="user-prompt-overlay">
            <p>Architect a 4-week product roadmap for a new SaaS photo AI app iOS. Include key milestones, technical stack decisions, and a high-level marketing timeline.</p>
            <div className="avatar-tiny">👤</div>
          </div>

          {/* Central AI Processing Card */}
          <div className="ai-processing-card">
            <div className="card-header">
              <span className="ai-icon">✨</span>
              <span>AI ASSISTANT</span>
            </div>

            <h2 className="processing-title">AI is architecting your project...</h2>

            <div className="processing-steps">
              <div className="step completed">
                <div className="step-indicator">✓</div>
                <div className="step-content">
                  <strong>Analyzing project scope...</strong>
                  <span>Requirements and goals identified.</span>
                </div>
              </div>

              <div className="step active">
                <div className="step-indicator spinner-blue"></div>
                <div className="step-content">
                  <strong>Generating milestones...</strong>
                  <span>Mapping 4-week progression path.</span>
                </div>
              </div>

              <div className="step pending">
                <div className="step-indicator outline"></div>
                <div className="step-content">
                  <strong>Creating task breakdown...</strong>
                  <span>Defining granular action items.</span>
                </div>
              </div>
            </div>

            <div className="card-footer">
              <button className="btn-stop">Stop Generation</button>
            </div>
          </div>

          {/* Bottom Chat Bar Skeleton */}
          <div className="bottom-chat-bar">
            <div className="chat-input-skeleton">
              <span className="icon">✨</span>
              <span className="placeholder-text">AI Assistant is thinking...</span>
            </div>
            <button className="btn-send-skeleton" disabled>Send ↗</button>
          </div>
          <div className="bottom-helper-text">
            WAIT FOR CURRENT PLAN GENERATION TO COMPLETE
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiLoadingPage;
