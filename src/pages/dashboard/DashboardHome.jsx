import './DashboardHome.css';

const DashboardHome = () => {
  return (
    <div className="dashboard-home">
      <div className="tabs-container">
        <button className="tab active">Today</button>
        <button className="tab">Planned</button>
      </div>

      <div className="home-grid">
        {/* TO-DO COLUMN */}
        <div className="kanban-section">
          <div className="section-header">
            <h3><span className="status-dot todo"></span> To-Do <span className="count">2</span></h3>
            <button className="add-btn">+</button>
          </div>

          <div className="task-card">
            <span className="badge bd-blue">3D DESIGN</span>
            <button className="options-btn">⋮</button>
            <h4>Refine AI Model Architecture and Data Pipeline</h4>
            <p className="card-desc">Update the transformer layers based on recent benchmarks from the DS research team.</p>
            <div className="card-footer">
              <div className="avatars small">
                <div className="avatar AJ">AJ</div>
                <div className="avatar">K</div>
              </div>
              <span className="due-date">📅 Oct 24</span>
            </div>
          </div>

          <div className="task-card">
            <span className="badge bd-orange">RESEARCH</span>
            <button className="options-btn">⋮</button>
            <h4>Analyze Competitor Feature Sets</h4>
            <p className="card-desc">Review top 5 productivity tools and identify AI integration gaps.</p>
            <div className="card-footer">
              <div className="avatars small">
                <div className="avatar">AJ</div>
              </div>
              <span className="due-date alert">❗ High Priority</span>
            </div>
          </div>

          <div className="task-card">
            <span className="badge bd-gray">DEVOPS</span>
            <button className="options-btn">⋮</button>
            <h4>Server Maintenance Window</h4>
            <div className="card-footer">
              <div className="avatars small">
                <div className="avatar outline"></div>
              </div>
              <span className="due-date">💬 2 Docs</span>
            </div>
          </div>
        </div>

        {/* IN PROGRESS COLUMN */}
        <div className="kanban-section">
          <div className="section-header">
            <h3><span className="status-dot progress"></span> In Progress <span className="count">2</span></h3>
            <button className="add-btn">+</button>
          </div>

          <div className="task-card">
            <span className="badge bd-blue">FRONTEND</span>
            <button className="options-btn">⋮</button>
            <h4>Implement Dark Mode Toggle</h4>
            <p className="card-desc">Adding tailwind dark: selectors across all legacy components.</p>
            <div className="progress-bar-container">
              <div className="progress-bar" style={{width: '65%'}}></div>
            </div>
            <div className="card-footer space-between">
              <div className="avatars small">
                <div className="avatar AJ">AJ</div>
                <div className="avatar">K</div>
              </div>
              <span className="progress-text">65% Done</span>
            </div>
          </div>

          <div className="task-card has-image">
            <span className="badge bd-green">MARKETING</span>
            <button className="options-btn">⋮</button>
            <h4>Social Media Assets for Launch</h4>
            
            {/* Using a solid distinct color block rather than generating an image */}
            <div className="card-image-placeholder">
              <span className="shimmer-text">Task preview</span>
            </div>

            <div className="card-footer">
              <div className="avatars small">
                 <div className="avatar">AJ</div>
              </div>
              <div className="card-actions">
                <span>📁</span>
                <span>📎</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardHome;
