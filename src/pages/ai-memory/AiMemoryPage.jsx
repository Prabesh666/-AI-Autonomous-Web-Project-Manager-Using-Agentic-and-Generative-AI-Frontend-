import './AiMemoryPage.css';

const AiMemoryPage = () => {
  const events = [
    {
      id: 1,
      status: 'active',
      agent: 'System',
      title: 'Workflow Triggered',
      desc: 'Automated operational workflow A0B7 has been initiated based on real-time sensor telemetry.',
      time: 'Just now',
      icon: '⚡'
    },
    {
      id: 2,
      status: 'accepted',
      agent: 'Decision Agent',
      title: 'Decision Recommendation Accepted',
      desc: 'Budget reallocation recommendation for Q3 marketing sprint has been approved and committed.',
      time: '28 mins ago',
      icon: '✓'
    },
    {
      id: 3,
      status: 'success',
      agent: 'Reviewer',
      title: 'Review Performed',
      desc: 'Compliance check on the latest architecture proposal passed with 98% confidence score.',
      time: '45 mins ago',
      icon: '🛡️'
    },
    {
      id: 4,
      status: 'warning',
      agent: 'Planner',
      title: 'Tasks Created',
      desc: 'Generated 12 new user tasks for the "Infrastructure Scaling" milestone based on the approved plan.',
      time: '1 hour ago',
      icon: '📝'
    },
    {
      id: 5,
      status: 'completed',
      agent: 'Planner',
      title: 'AI Plan Generated',
      desc: 'Strategic roadmap for Project Alpha has been drafted. Analysis includes resource estimation and timeline projections.',
      time: '2 hours ago',
      icon: '📄'
    }
  ];

  return (
    <div className="ai-memory-wrapper">
      <header className="memory-header">
        <div className="memory-title">
          <h1>AI Project Memory</h1>
        </div>
        
        <div className="memory-actions">
          <div className="avatar-admin">Alex R.</div>
        </div>
      </header>

      <div className="memory-content">
        <div className="audit-header">
          <div className="audit-text">
            <h2>Audit Trail</h2>
            <p>Chronological history of AI decisions and system activities.</p>
          </div>
          <div className="audit-filters">
            <span className="filter-label">Filter by Agent:</span>
            <select className="filter-select">
              <option>All Agents</option>
              <option>Planner Agent</option>
              <option>Decision Agent</option>
              <option>Reviewer Agent</option>
            </select>
          </div>
        </div>

        <div className="timeline-container">
          <div className="timeline-line"></div>
          
          <div className="timeline-events">
            {events.map((event) => (
              <div key={event.id} className="timeline-item">
                <div className={`timeline-icon ${event.status}`}>
                  {event.icon}
                </div>
                
                <div className="timeline-card">
                  <div className="card-top-row">
                    <div className="card-badges">
                      <span className={`status-badge ${event.status}`}>
                        {event.status.toUpperCase()}
                      </span>
                      <span className="agent-badge">
                        <span className="dot"></span> Agent: {event.agent}
                      </span>
                    </div>
                    <span className="timestamp">{event.time}</span>
                  </div>
                  
                  <h3 className="event-title">{event.title}</h3>
                  <p className="event-desc">{event.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="timeline-footer">
            <button className="btn-load-more">
              <span className="icon">↺</span> Load Earlier Events
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiMemoryPage;
