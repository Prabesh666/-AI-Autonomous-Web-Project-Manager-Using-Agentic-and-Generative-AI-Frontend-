import { useState } from 'react';
import './ActivityLog.css';

// Real backend integration pending or to be populated
const activities = [];

const ActivityLog = () => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
      setSelectAll(false);
    } else {
      setSelectedIds(activities.map(a => a.id));
      setSelectAll(true);
    }
  };

  const toggleSelect = (id) => {
    const newSelected = selectedIds.includes(id) 
      ? selectedIds.filter(i => i !== id)
      : [...selectedIds, id];
    
    setSelectedIds(newSelected);
    setSelectAll(newSelected.length === activities.length && activities.length > 0);
  };

  return (
    <div className="activity-log-container">
      <div className="activity-log-header">
        <div>
          <h1 className="activity-log-title">Workflow Activity Log</h1>
          <p className="activity-log-subtitle">Real-time monitoring of system and user events</p>
        </div>
        <div className="activity-log-actions">
          <button className="btn-filter">
            <span className="icon">⬇️</span> Filter
          </button>
          <button className="btn-export">
            <span className="icon">⬇️</span> Export Log
          </button>
        </div>
      </div>

      <div className="activity-log-content">
        <div className="activity-log-toolbar">
          <div className="toolbar-left">
            <label className="checkbox-wrapper">
              <input type="checkbox" checked={selectAll} onChange={toggleSelectAll} />
              <span className="checkbox-label">Select All</span>
            </label>
            <span className="toolbar-divider">|</span>
            <button className="toolbar-btn">Archive</button>
            <button className="toolbar-btn">Delete</button>
          </div>
          <div className="toolbar-right">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input type="text" placeholder="Search events..." />
            </div>
          </div>
        </div>

        <div className="activity-list">
          {activities.length === 0 ? (
            <div className="no-activities-msg" style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>
              No activities found.
            </div>
          ) : (
            activities.map(activity => (
            <div key={activity.id} className={`activity-item ${selectedIds.includes(activity.id) ? 'selected' : ''}`}>
              <div className="activity-left">
                <input 
                  type="checkbox" 
                  checked={selectedIds.includes(activity.id)} 
                  onChange={() => toggleSelect(activity.id)} 
                />
                <div className={`activity-icon-container ${activity.iconColor}`}>
                  {activity.icon}
                </div>
                <div className="activity-details">
                  <div className="activity-title-row">
                    <span className="activity-type">{activity.type}</span>
                    {activity.badge && (
                      <span className={`activity-badge ${activity.badgeType}`}>
                        {activity.badge}
                      </span>
                    )}
                  </div>
                  <p className="activity-description">{activity.description}</p>
                </div>
              </div>
              <div className="activity-right">
                <div className="activity-time">
                  {activity.time.split('\n').map((line, i) => (
                    <span key={i} className={i === 0 ? 'time-primary' : 'time-secondary'}>
                      {line}
                    </span>
                  ))}
                </div>
                <div className="activity-avatar">
                  {activity.user.avatar}
                </div>
              </div>
            </div>
            ))
          )}
        </div>

        <div className="activity-log-footer">
          <button className="btn-load-older">Load older activity</button>
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;
