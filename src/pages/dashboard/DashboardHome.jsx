import { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { fetchProjects } from '../../api/projects';
import { fetchTasksByProject } from '../../api/tasks';
import './DashboardHome.css';

/* ─── Skeleton card ──────────────────────────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="task-card task-card--skeleton">
    <div className="skeleton-line skeleton-badge" />
    <div className="skeleton-line skeleton-title" />
    <div className="skeleton-line skeleton-desc" />
    <div className="skeleton-line skeleton-desc short" />
    <div className="skeleton-footer">
      <div className="skeleton-circle" />
      <div className="skeleton-line skeleton-date" />
    </div>
  </div>
);

/* ─── Priority badge ─────────────────────────────────────────────────────────── */
const priorityBadge = (priority) => {
  if (!priority) return null;
  const map = {
    high:   { cls: 'priority-badge priority-high',   label: '❗ High Priority' },
    medium: { cls: 'priority-badge priority-medium', label: '⚡ Medium' },
    low:    { cls: 'priority-badge priority-low',    label: '✓ Low' },
  };
  const item = map[priority?.toLowerCase()] || map.medium;
  return <span className={item.cls}>{item.label}</span>;
};

/* ─── Category badge colours ─────────────────────────────────────────────────── */
const categoryClass = (cat) => {
  const map = {
    'ux design': 'bd-blue',
    design: 'bd-blue',
    frontend: 'bd-indigo',
    backend: 'bd-purple',
    research: 'bd-orange',
    devops: 'bd-gray',
    marketing: 'bd-green',
    qa: 'bd-yellow',
  };
  return map[(cat || '').toLowerCase()] || 'bd-gray';
};

/* ─── Progress bar ───────────────────────────────────────────────────────────── */
const ProgressBar = ({ value }) => (
  <div className="progress-bar-container">
    <div className="progress-bar" style={{ width: `${value}%` }} />
  </div>
);

/* ─── Avatar stack ───────────────────────────────────────────────────────────── */
const AvatarStack = ({ names = [] }) => {
  const colors = ['av-blue', 'av-purple', 'av-green', 'av-orange', 'av-pink'];
  return (
    <div className="avatars small">
      {names.slice(0, 3).map((n, i) => (
        <div key={i} className={`avatar ${colors[i % colors.length]}`}>
          {(n || '?')[0].toUpperCase()}
        </div>
      ))}
    </div>
  );
};

/* ─── Task Card ──────────────────────────────────────────────────────────────── */
const TaskCard = ({ task, onClick }) => {
  const category = task.category || task.tags?.[0] || 'General';
  const hasProgress = task.progress != null;
  const hasImage = task.has_image || task.thumbnail;

  return (
    <div className="task-card" onClick={() => onClick?.(task)}>
      <div className="card-top-row">
        <span className={`badge ${categoryClass(category)}`}>
          {category.toUpperCase()}
        </span>
        <button className="options-btn" onClick={(e) => e.stopPropagation()}>⋯</button>
      </div>

      <h4>{task.title || task.name}</h4>

      {task.description && (
        <p className="card-desc">{task.description}</p>
      )}

      {hasImage && (
        <div className="card-image-placeholder">
          <span className="shimmer-text">Task preview</span>
        </div>
      )}

      {hasProgress && (
        <>
          <ProgressBar value={task.progress} />
          <div className="progress-label-row">
            <span className="progress-text">{task.progress}% Done</span>
          </div>
        </>
      )}

      <div className="card-footer">
        <AvatarStack names={task.assignees || task.members || []} />
        <div className="card-meta">
          {task.due_date && (
            <span className="due-date">
              📅 {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
          {!task.due_date && task.docs_count > 0 && (
            <span className="due-date">💬 {task.docs_count} Docs</span>
          )}
          {task.priority && priorityBadge(task.priority)}
        </div>
      </div>
    </div>
  );
};

/* ─── Kanban Column ──────────────────────────────────────────────────────────── */
const KanbanColumn = ({ title, status, dot, tasks, loading, onAddTask }) => (
  <div className="kanban-section">
    <div className="section-header">
      <h3>
        <span className={`status-dot ${dot}`} />
        {title}
        <span className="count">{tasks.length}</span>
      </h3>
      <button className="add-btn" onClick={onAddTask} title={`Add ${title} task`}>+</button>
    </div>

    {loading
      ? [1, 2].map(i => <SkeletonCard key={i} />)
      : tasks.length === 0
        ? (
          <div className="empty-column">
            <span>No {title.toLowerCase()} tasks</span>
          </div>
        )
        : tasks.map(t => <TaskCard key={t.id || t._id} task={t} />)
    }
  </div>
);

/* ─── Stat Pill ──────────────────────────────────────────────────────────────── */
const StatPill = ({ icon, label, value, color }) => (
  <div className={`stat-pill stat-pill--${color}`}>
    <span className="stat-icon">{icon}</span>
    <div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
const DashboardHome = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* friendly greeting */
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0] || 'there';

  /* ── fetch data ─────────────────────────────────────────────────────────── */
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const projectList = await fetchProjects();
      const proj = Array.isArray(projectList)
        ? projectList
        : projectList.results || projectList.projects || [];
      setProjects(proj);

      if (proj.length > 0) {
        const allTasks = await Promise.all(
          proj.slice(0, 3).map(p =>
            fetchTasksByProject(p.id || p._id).catch(() => [])
          )
        );
        const flat = allTasks.flat();
        const normalized = Array.isArray(flat) ? flat : flat.tasks || flat.results || [];
        setTasks(normalized);
      }
    } catch (err) {
      console.error(err);
      setError('Could not load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  /* ── filter logic ───────────────────────────────────────────────────────── */
  const today = new Date().toISOString().split('T')[0];

  const filteredTasks = tasks.filter(t => {
    const matchSearch =
      !searchQuery ||
      (t.title || t.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchTab =
      activeTab === 'today'
        ? !t.due_date || t.due_date?.startsWith(today) || t.status !== 'done'
        : t.due_date && t.due_date > today;

    return matchSearch && matchTab;
  });

  const todoTasks     = filteredTasks.filter(t => ['todo', 'to-do', 'pending', 'open'].includes((t.status || '').toLowerCase()));
  const inProgTasks   = filteredTasks.filter(t => ['in_progress', 'in-progress', 'active', 'doing'].includes((t.status || '').toLowerCase()));
  // fallback: if status values don't match, split evenly
  const displayTodo   = todoTasks.length > 0 || inProgTasks.length > 0 ? todoTasks   : filteredTasks.slice(0, Math.ceil(filteredTasks.length / 2));
  const displayInProg = todoTasks.length > 0 || inProgTasks.length > 0 ? inProgTasks : filteredTasks.slice(Math.ceil(filteredTasks.length / 2));

  /* ── stats ──────────────────────────────────────────────────────────────── */
  const totalTasks  = tasks.length;
  const doneTasks   = tasks.filter(t => (t.status || '').toLowerCase() === 'done').length;
  const highPrio    = tasks.filter(t => (t.priority || '').toLowerCase() === 'high').length;
  const completion  = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

  /* ─────────────────────────────────────────────────────────────────────── */
  return (
    <div className="dashboard-home">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="dashboard-header">
        <div className="dashboard-header__left">
          <div className="greeting-row">
            <span className="greeting-emoji">👋</span>
            <div>
              <h1 className="page-title">Project Dashboard</h1>
              <p className="greeting-sub">{greeting}, {firstName}! Here's your workspace overview.</p>
            </div>
          </div>
        </div>

        <div className="dashboard-header__right">
          {/* Search */}
          <div className="dash-search">
            <svg className="dash-search__icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="dash-search__input"
            />
            {searchQuery && (
              <button className="dash-search__clear" onClick={() => setSearchQuery('')}>✕</button>
            )}
          </div>

          {/* New Project CTA */}
          <button
            className="btn-new-project"
            onClick={() => navigate('/projects/new')}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </button>
        </div>
      </div>

      {/* ── Stats row ──────────────────────────────────────────────────── */}
      <div className="stats-row">
        <StatPill icon="📋" label="Total Tasks"    value={totalTasks}  color="blue"   />
        <StatPill icon="✅" label="Completed"       value={doneTasks}   color="green"  />
        <StatPill icon="⚡" label="High Priority"  value={highPrio}    color="orange" />
        <StatPill icon="📈" label="Completion"      value={`${completion}%`} color="purple" />
      </div>

      {/* ── Error banner ───────────────────────────────────────────────── */}
      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={loadData} className="retry-btn">Retry</button>
        </div>
      )}

      {/* ── Tabs ───────────────────────────────────────────────────────── */}
      <div className="tabs-container">
        {['today', 'planned'].map(tab => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === 'today' && <span className="tab-dot" />}
          </button>
        ))}
        <div className="tabs-refresh">
          <button className="refresh-btn" onClick={loadData} title="Refresh">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Kanban grid ────────────────────────────────────────────────── */}
      <div className="home-grid">
        <KanbanColumn
          title="To-Do"
          status="todo"
          dot="todo"
          tasks={displayTodo}
          loading={loading}
          onAddTask={() => navigate('/projects')}
        />
        <KanbanColumn
          title="In Progress"
          status="in_progress"
          dot="progress"
          tasks={displayInProg}
          loading={loading}
          onAddTask={() => navigate('/projects')}
        />
      </div>

    </div>
  );
};

export default DashboardHome;
