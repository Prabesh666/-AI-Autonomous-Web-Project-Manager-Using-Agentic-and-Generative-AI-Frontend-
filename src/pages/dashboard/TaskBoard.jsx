import './TaskBoard.css';

const TaskBoard = () => {
  return (
    <div className="task-board">
      <div className="board-header">
        <div className="tabs-container">
          <button className="tab active">To-Do</button>
          <button className="tab">In Progress</button>
          <button className="tab">Review</button>
        </div>
        
        <div className="board-actions">
           {/* Add filter or view options if needed */}
        </div>
      </div>

      <div className="kanban-scroll-container">
        {/* TO-DO COLUMN */}
        <div className="kanban-column">
          <div className="column-header">
            <h3>To-Do <span className="count">2</span></h3>
            <button className="add-btn">⊕</button>
          </div>
          
          <div className="kanban-cards">
            {/* Card 1 */}
            <div className="task-card">
              <span className="badge bd-orange outline">High Priority</span>
              <button className="options-btn">⋮</button>
              <h4>Design System Audit</h4>
              <p className="card-desc">Review consistency across all mobile and web components for version 2.0.</p>
              
              <div className="card-footer">
                <div className="card-actions">
                  <span>📎 1</span>
                </div>
                <div className="avatars small">
                  <div className="avatar AJ">AJ</div>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="task-card">
              <span className="badge bd-green outline">Low Priority</span>
              <button className="options-btn">⋮</button>
              <h4>Weekly Sync Notes</h4>
              <p className="card-desc">Prepare meeting minutes from the previous sprint review.</p>
              
              <div className="card-footer">
                <div className="card-actions">
                  <span>💬 3</span>
                </div>
                <div className="avatars small">
                  <div className="avatar outline"></div>
                </div>
              </div>
            </div>

            {/* Faux Add Card Button */}
            <button className="add-task-btn">
              + Add New Task
            </button>
          </div>
        </div>

        {/* IN PROGRESS COLUMN */}
        <div className="kanban-column">
          <div className="column-header">
            <h3>In Progress <span className="count bg-blue">3</span></h3>
            <button className="add-btn">⊕</button>
          </div>
          
          <div className="kanban-cards">
            <div className="task-card active-drag">
              <span className="badge bd-orange outline">Medium Priority</span>
              <button className="options-btn">⋮</button>
              <h4>API Integration</h4>
              
              <div className="card-footer space-between mt-override">
                <div className="card-actions">
                  <span className="due-date">📅 2 May</span>
                </div>
                <div className="avatars small">
                  <div className="avatar blue">SB</div>
                  <div className="avatar">AJ</div>
                </div>
              </div>
            </div>
            
            <div className="task-card">
              <span className="badge bd-orange outline">High Priority</span>
              <button className="options-btn">⋮</button>
              <h4>Responsive Fixes</h4>
              <p className="card-desc">Fix the overlap issues on the dashboard view for iPad Pro displays.</p>
              
              <div className="card-footer space-between">
                <div className="card-actions">
                  <span className="due-date">📅 Tomorrow</span>
                </div>
                <div className="avatars small">
                  <div className="avatar orange">A</div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* REVIEW COLUMN */}
        <div className="kanban-column">
          <div className="column-header">
            <h3>Review <span className="count">1</span></h3>
            <button className="add-btn">⊕</button>
          </div>
          
          <div className="kanban-cards">
            <div className="task-card">
              <span className="badge bd-orange outline">Medium Priority</span>
              <button className="options-btn">⋮</button>
              <h4>User Feedback Survey</h4>
              <p className="card-desc">Summary of responses from the first Beta user group.</p>
              
              <div className="card-footer">
                <div className="card-actions">
                  <span className="due-date">📅 Pending Approval</span>
                </div>
                <div className="avatars small">
                  <div className="avatar outline"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TaskBoard;
