import { useState } from 'react';
import './ActivityLog.css';

const MOCK_ACTIVITIES = [
  {
    id: 1,
    type: 'Task updated',
    badge: 'NON-PRIORITY',
    badgeType: 'warning',
    description: 'Alex Rivera modified Homepage Redesign documentation',
    time: '2 mins ago\n10:42 AM',
    user: { name: 'Alex Rivera', avatar: 'AR' },
    icon: '📝',
    iconColor: 'blue'
  },
  {
    id: 2,
    type: 'AI Review completed',
    badge: 'SYSTEM',
    badgeType: 'success',
    description: 'Automated code analysis finished for branch feature/auth',
    time: '1 hour ago\n09:15 AM',
    user: { name: 'System', avatar: 'AI' },
    icon: '🧠',
    iconColor: 'green'
  },
  {
    id: 3,
    type: 'New project created',
    badge: '',
    badgeType: '',
    description: 'Sarah Johnson initialized "Q4 Marketing Campaign"',
    time: '3 hours ago\n07:30 AM',
    user: { name: 'Sarah Johnson', avatar: 'SJ' },
    icon: '➕',
    iconColor: 'blue'
  },
  {
    id: 4,
    type: 'New user invited',
    badge: '',
    badgeType: '',
    description: 'Marcus Chen invited liam.smith@company.com to Team Alpha',
    time: '5 hours ago\n05:12 AM',
    user: { name: 'Marcus Chen', avatar: 'MC' },
    icon: '👤',
    iconColor: 'blue'
  },
  {
    id: 5,
    type: 'Connection error detected',
    badge: 'CRITICAL',
    badgeType: 'danger',
    description: 'Database connection timeout on production cluster node-2',
    time: 'Yesterday\n11:45 PM',
    user: { name: 'System Error', avatar: '❌' },
    icon: '⚠️',
    iconColor: 'red'
  }
];

const ActivityLog = () => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
      setSelectAll(false);
    } else {
      setSelectedIds(MOCK_ACTIVITIES.map(a => a.id));
      setSelectAll(true);
    }
  };

  const toggleSelect = (id) => {
    const newSelected = selectedIds.includes(id) 
      ? selectedIds.filter(i => i !== id)
      : [...selectedIds, id];
    
    setSelectedIds(newSelected);
    setSelectAll(newSelected.length === MOCK_ACTIVITIES.length);
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
          {MOCK_ACTIVITIES.map(activity => (
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
          ))}
        </div>

        <div className="activity-log-footer">
          <button className="btn-load-older">Load older activity</button>
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;
