import './AiDecisionPage.css';

const AiDecisionPage = () => {
  const alternatives = [
    {
      id: 1,
      title: "Delay non-critical bug fixes",
      desc: "Focus exclusively on feature parity for the upcoming release. Postpone 12 minor bugs to Sprint 5.",
      probability: "82%",
      tag: "LOW RISK"
    },
    {
      id: 2,
      title: "Add automated QA tests",
      desc: "Integrate Playwright tests for critical paths now to save 40+ hours in manual testing phase.",
      probability: "75%",
      tag: "HIGH EFFORT"
    },
    {
      id: 3,
      title: "Extend sprint by 2 days",
      desc: "Push the sprint end date by 48 hours to ensure zero debt handover of the API documentation.",
      probability: "60%",
      tag: "MEDIUM RISK"
    }
  ];

  return (
    <div className="ai-decision-wrapper">
      <header className="decision-header">
        <div className="breadcrumb">
          <span>Projects</span> / <span>Sprint 4 Review</span> / <strong>AI Decisions</strong>
        </div>
      </header>

      <div className="hero-recommendation-card">
        <div className="hero-content">
          <div className="hero-label">
            <span className="icon">✨</span>
            AI RECOMMENDED NEXT ACTION
          </div>
          <h1 className="hero-title">Reallocate Backend Resources to Sprint 4</h1>
          <p className="hero-desc">
            Based on current velocity and the upcoming Alpha release, shifting two backend developers from the maintenance backlog will reduce release risk by 18%. The impact on the maintenance queue is estimated at a 3-day delay.
          </p>
          
          <div className="hero-badges">
            <span className="badge high-impact">High Impact</span>
            <span className="badge medium-effort">Medium Effort</span>
          </div>

          <div className="hero-actions">
            <button className="btn-primary-action">Accept Recommendation</button>
            <button className="btn-secondary">Modify Suggestion</button>
            <button className="btn-secondary">Ask AI Why?</button>
          </div>
        </div>

        <div className="hero-stats">
          <div className="probability-circle large">
            <svg viewBox="0 0 36 36" className="circular-chart">
              <path className="circle-bg"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path className="circle success-stroke"
                strokeDasharray="94, 100"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <text x="18" y="20.35" className="percentage">94%</text>
            </svg>
            <span className="stat-label">Analysis complete</span>
            <p className="stat-desc">Processed 1.2M data points including sprint history and member performance.</p>
          </div>
        </div>
      </div>

      <div className="alternatives-section">
        <div className="section-header-row">
          <h2 className="section-title">Alternative Strategies</h2>
          <span className="last-updated">Last evaluated 2 minutes ago</span>
        </div>

        <div className="alternatives-grid">
          {alternatives.map(alt => (
            <div key={alt.id} className="alt-card">
              <div className="alt-card-header">
                <div className="icon-wrapper">
                  <span className="icon">
                    {alt.id === 1 ? '🎯' : alt.id === 2 ? '⚙️' : '⏱️'}
                  </span>
                </div>
                <span className={`tag ${alt.tag.toLowerCase().replace(' ', '-')}`}>
                  {alt.tag}
                </span>
              </div>
              <h3 className="alt-card-title">{alt.title}</h3>
              <p className="alt-card-desc">{alt.desc}</p>
              
              <div className="alt-card-footer">
                <span className="footer-label">Success Probability</span>
                <span className="footer-value">{alt.probability}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="info-banner">
        <div className="banner-content">
          <span className="bulb-icon">💡</span>
          <div>
            <strong>Did you know?</strong>
            <p>AI Decision Agent continuously monitors 50+ project variables. It correctly predicted 92% of sprint bottlenecks last quarter.</p>
          </div>
        </div>
        <button className="btn-outline-light">View Insights Library</button>
      </div>
    </div>
  );
};

export default AiDecisionPage;
