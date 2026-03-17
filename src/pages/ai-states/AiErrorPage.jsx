import './AiErrorPage.css';

const AiErrorPage = () => {
  return (
    <div className="ai-error-wrapper">
      <header className="error-header">
        <div className="breadcrumb">
          <span>Workspace</span> / <strong>Current Project</strong>
        </div>
        
        <div className="error-header-actions">
          <div className="search-box-skeleton">
            <span className="icon">🔍</span>
            <span className="text">Search project files...</span>
          </div>
          <button className="btn-primary-skeleton">New Project</button>
        </div>
      </header>

      <div className="error-canvas">
        <div className="page-context">
          <h1>New Marketing Strategy</h1>
          <p>Drafting automation sequence for Q3 launch</p>
        </div>

        <div className="error-modal">
          <div className="error-icon-wrapper">
            <span className="error-icon">⚠️</span>
          </div>
          
          <h2 className="error-title">AI Processing Failed</h2>
          <p className="error-message">
            We couldn't generate your plan due to an unexpected server response. Your progress has been saved, and you can try again or adjust your prompt constraints to optimize the AI output.
          </p>

          <div className="error-actions">
            <button className="btn-primary-error">
              <span className="icon">↺</span> Retry
            </button>
            <button className="btn-secondary-error">
              <span className="icon">✏️</span> Edit Prompt
            </button>
          </div>

          <div className="error-footer">
            <span className="error-id">🛈 Response ID: 493-500-ERROR</span>
            <a href="#" className="contact-support">Contact Support</a>
          </div>
        </div>

        {/* Decorative background skeletons to simulate missing content */}
        <div className="skeleton-grid">
          <div className="skeleton-card"></div>
          <div className="skeleton-card"></div>
          <div className="skeleton-card"></div>
        </div>
      </div>
    </div>
  );
};

export default AiErrorPage;
