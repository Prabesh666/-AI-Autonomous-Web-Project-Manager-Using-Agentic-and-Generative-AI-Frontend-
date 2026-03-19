import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useProjects } from '../../hooks/useProjects';
import { useTasks } from '../../hooks/useTasks';
import { useToast } from '../../context/ToastContext';
import TaskModal from './TaskModal';


/* ── Column config ─────────────────────────────────── */
const COLUMNS = [
  { title: 'To Do',       key: 'pending',     dot: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: '#f59e0b' },
  { title: 'In Progress', key: 'in-progress', dot: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: '#3b82f6' },
  { title: 'Completed',   key: 'completed',   dot: '#10b981', bg: 'rgba(16,185,129,0.08)', border: '#10b981' },
];

/* ══════════════════════════════════════════════════════
   PROJECT DETAILS PAGE  (Kanban Task Board)
══════════════════════════════════════════════════════ */
const ProjectDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const toast = useToast();

  const { projects, loadProjects } = useProjects();
  const { tasks, loading, error, loadTasks, addTask, editTaskContent, removeTask, getGroupedTasks } = useTasks();

  const [project, setProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks');

  /* Load project info */
  useEffect(() => {
    if (projects.length === 0) loadProjects();
    else {
      const found = projects.find(p => p._id === id || p.id === id);
      if (found) setProject(found);
    }
  }, [id, projects, loadProjects]);

  /* Load tasks */
  useEffect(() => { if (id) loadTasks(id); }, [id, loadTasks]);

  /* Handlers */
  const handleSaveTask = async (taskData) => {
    try {
      if (editingTask) {
        await editTaskContent(editingTask._id || editingTask.id, taskData);
        toast.success('Task updated');
      } else {
        await addTask(taskData);
        toast.success('Task created');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save task');
      throw err;
    }
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);
    try {
      await removeTask(taskToDelete._id || taskToDelete.id);
      toast.success(`"${taskToDelete.title}" deleted`);
      setTaskToDelete(null);
    } catch (err) { toast.error(err.message || 'Delete failed'); }
    finally { setIsDeleting(false); }
  };

  const groupedTasks = getGroupedTasks();
  const totalTasks = (tasks || []).length;

  /* ── Tab styles ────────────────────────────────── */
  const tabBase = {
    padding: '0.6rem 0',
    fontSize: '0.82rem',
    fontWeight: 600,
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    transition: 'all 0.2s',
  };
  const tabActive = (color) => ({ ...tabBase, borderBottomColor: color, color });
  const tabInactive = { ...tabBase, color: isDark ? '#6b7280' : '#9ca3af' };

  /* ── Not Found ─────────────────────────────────── */
  if (!project && projects.length > 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: isDark ? '#d1d5db' : '#374151' }}>Project Not Found</h2>
        <button onClick={() => navigate('/projects')} style={{
          marginTop: '1rem', padding: '0.5rem 1.25rem', background: 'rgba(59,130,246,0.1)',
          color: '#3b82f6', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
        }}>Back to Projects</button>
      </div>
    );
  }

  /* ── Render ────────────────────────────────────── */
  return (
    <div className="pd-page" style={{ animation: 'pdFadeIn 0.3s ease both' }}>

      {/* ─── Back button ────────────────────────── */}
      <button
        onClick={() => navigate('/projects')}
        className="pd-back-btn"
        style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
      >
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Projects
      </button>

      {/* ─── Project Header Card ────────────────── */}
      <div className="pd-header-card" style={{
        background: isDark ? '#1f2937' : '#ffffff',
        border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
      }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: isDark ? '#f9fafb' : '#111827', letterSpacing: '-0.02em' }}>
            {project ? project.name : 'Loading…'}
          </h1>
          <p style={{ fontSize: '0.82rem', color: isDark ? '#9ca3af' : '#6b7280', marginTop: '0.375rem', maxWidth: '600px', lineHeight: 1.5 }}>
            {project?.description || 'No description provided.'}
          </p>
        </div>
        {activeTab === 'tasks' && (
          <button
            onClick={() => { setEditingTask(null); setIsModalOpen(true); }}
            className="pd-add-task-btn"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Task
          </button>
        )}
      </div>

      {/* ─── Tabs ───────────────────────────────── */}
      <div style={{
        display: 'flex', gap: '1.5rem',
        borderBottom: `1px solid ${isDark ? '#1f2937' : '#e5e7eb'}`,
        marginTop: '1.25rem', marginBottom: '1.25rem',
      }}>
        <button onClick={() => setActiveTab('tasks')} style={activeTab === 'tasks' ? tabActive('#3b82f6') : tabInactive}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Kanban Board
          <span style={{
            padding: '0.1rem 0.45rem', borderRadius: '8px', fontSize: '0.68rem', fontWeight: 700,
            background: activeTab === 'tasks' ? 'rgba(59,130,246,0.12)' : (isDark ? '#374151' : '#f3f4f6'),
            color: activeTab === 'tasks' ? '#3b82f6' : '#9ca3af',
          }}>{totalTasks}</span>
        </button>
        <button onClick={() => setActiveTab('ai')} style={activeTab === 'ai' ? tabActive('#8b5cf6') : tabInactive}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          AI Workspace
        </button>
        <button onClick={() => setActiveTab('reports')} style={activeTab === 'reports' ? tabActive('#10b981') : tabInactive}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Reports
        </button>
      </div>

      {/* ─── Tab Content ────────────────────────── */}
      {activeTab === 'ai' ? (
        <div style={{
          padding: '2.5rem', textAlign: 'center', borderRadius: '14px',
          background: isDark ? '#1f2937' : '#f9fafb',
          border: `1px dashed ${isDark ? '#374151' : '#d1d5db'}`,
        }}>
          <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="#8b5cf6" style={{ margin: '0 auto 0.75rem' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: isDark ? '#f9fafb' : '#111827' }}>AI Workspace</h3>
          <p style={{ fontSize: '0.82rem', color: '#9ca3af', marginTop: '0.25rem' }}>
            AI-powered analysis and suggestions for this project will appear here.
          </p>
        </div>
      ) : activeTab === 'reports' ? (
        <div style={{
          padding: '2.5rem', textAlign: 'center', borderRadius: '14px',
          background: isDark ? '#1f2937' : '#f9fafb',
          border: `1px dashed ${isDark ? '#374151' : '#d1d5db'}`,
        }}>
          <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="#10b981" style={{ margin: '0 auto 0.75rem' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: isDark ? '#f9fafb' : '#111827' }}>Project Reports</h3>
          <p style={{ fontSize: '0.82rem', color: '#9ca3af', marginTop: '0.25rem' }}>
            Go to the <button onClick={() => navigate('/reports')} style={{ color: '#3b82f6', cursor: 'pointer', background: 'none', border: 'none', textDecoration: 'underline', fontWeight: 600, fontSize: 'inherit' }}>Reports page</button> to submit and view project reports.
          </p>
        </div>
      ) : (
        /* ─── Kanban Task Board ──────────────────── */
        <>
          {loading && (tasks || []).length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
              <div className="pd-spinner-lg" />
            </div>
          ) : error ? (
            <div style={{
              maxWidth: 460, margin: '2rem auto', padding: '1.5rem',
              background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '14px', textAlign: 'center',
            }}>
              <p style={{ color: '#ef4444', fontWeight: 600, marginBottom: '0.5rem' }}>Failed to load tasks</p>
              <p style={{ color: '#9ca3af', fontSize: '0.82rem', marginBottom: '1rem' }}>{error}</p>
              <button onClick={() => loadTasks(id)} style={{
                padding: '0.5rem 1.25rem', background: '#ef4444', color: '#fff',
                border: 'none', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
              }}>Retry</button>
            </div>
          ) : (
            <div className="pd-kanban-grid">
              {COLUMNS.map(col => {
                const colTasks = groupedTasks[col.key] || [];
                return (
                  <div key={col.key} className="pd-kanban-col" style={{
                    background: isDark ? '#111827' : '#f9fafb',
                    border: `1px solid ${isDark ? '#1f2937' : '#e5e7eb'}`,
                  }}>
                    {/* Column header */}
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '0.75rem 1rem', marginBottom: '0.5rem',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.dot }} />
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: isDark ? '#d1d5db' : '#374151', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {col.title}
                        </span>
                      </div>
                      <span style={{
                        padding: '0.1rem 0.45rem', borderRadius: '8px',
                        fontSize: '0.68rem', fontWeight: 700,
                        background: isDark ? '#1f2937' : '#ffffff',
                        color: isDark ? '#9ca3af' : '#6b7280',
                        border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                      }}>{colTasks.length}</span>
                    </div>

                    {/* Cards */}
                    <div className="pd-kanban-cards">
                      {colTasks.length === 0 ? (
                        <div style={{
                          padding: '1.5rem', textAlign: 'center',
                          border: `2px dashed ${isDark ? '#374151' : '#d1d5db'}`,
                          borderRadius: '10px', margin: '0 0.75rem',
                        }}>
                          <p style={{ fontSize: '0.78rem', color: '#9ca3af' }}>No tasks</p>
                        </div>
                      ) : colTasks.map(task => (
                        <div
                          key={task._id || task.id}
                          className="pd-task-card"
                          style={{
                            background: isDark ? '#1f2937' : '#ffffff',
                            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                            borderLeft: `3px solid ${col.border}`,
                          }}
                        >
                          <h4 style={{
                            fontSize: '0.85rem', fontWeight: 700,
                            color: isDark ? '#f9fafb' : '#111827',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>{task.title}</h4>
                          <p style={{
                            fontSize: '0.78rem', color: isDark ? '#9ca3af' : '#6b7280',
                            lineHeight: 1.5, marginTop: '0.25rem',
                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                          }}>
                            {task.description || 'No description'}
                          </p>
                          {/* Actions */}
                          <div className="pd-task-actions">
                            <button onClick={() => { setEditingTask(task); setIsModalOpen(true); }} title="Edit" style={{ padding: '0.25rem', background: 'none', border: 'none', cursor: 'pointer', color: isDark ? '#6b7280' : '#9ca3af' }}>
                              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                            <button onClick={() => setTaskToDelete(task)} title="Delete" style={{ padding: '0.25rem', background: 'none', border: 'none', cursor: 'pointer', color: isDark ? '#6b7280' : '#9ca3af' }}>
                              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ─── Task Modal ────────────────────────── */}
      {isModalOpen && (
        <TaskModal
          isOpen={isModalOpen}
          task={editingTask}
          projectId={id}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveTask}
        />
      )}

      {/* ─── Delete Confirmation ───────────────── */}
      {taskToDelete && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 60,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: isDark ? '#1f2937' : '#ffffff',
            borderRadius: '16px', padding: '1.75rem', width: '100%', maxWidth: '380px',
            textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(239,68,68,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem',
            }}>
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#ef4444">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: isDark ? '#f9fafb' : '#111827', marginBottom: '0.375rem' }}>Delete Task</h3>
            <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '1.5rem' }}>
              Delete <strong style={{ color: isDark ? '#f9fafb' : '#111827' }}>"{taskToDelete.title}"</strong>? This cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.625rem' }}>
              <button onClick={() => setTaskToDelete(null)} disabled={isDeleting} style={{
                padding: '0.5rem 1.25rem', borderRadius: '8px',
                border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                background: 'transparent', color: isDark ? '#9ca3af' : '#6b7280',
                fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer',
              }}>Cancel</button>
              <button onClick={confirmDelete} disabled={isDeleting} style={{
                padding: '0.5rem 1.25rem', borderRadius: '8px',
                border: 'none', background: '#ef4444', color: '#fff',
                fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                opacity: isDeleting ? 0.6 : 1,
              }}>{isDeleting ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailsPage;
