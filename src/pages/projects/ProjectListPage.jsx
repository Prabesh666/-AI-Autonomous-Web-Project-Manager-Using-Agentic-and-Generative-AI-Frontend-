import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useProjects } from '../../hooks/useProjects';
import ProjectModal from './ProjectModal';
import { useToast } from '../../context/ToastContext';
import './ProjectListPage.css';

/* ── Status color map ──────────────────────────────── */
const STATUS_MAP = {
  Active:        { bg: 'rgba(16,185,129,0.12)', color: '#059669' },
  'In Progress': { bg: 'rgba(59,130,246,0.12)', color: '#2563eb' },
  'On Hold':     { bg: 'rgba(245,158,11,0.12)', color: '#d97706' },
  Completed:     { bg: 'rgba(107,114,128,0.12)', color: '#6b7280' },
};
const fallbackStatus = { bg: 'rgba(107,114,128,0.08)', color: '#9ca3af' };

/* ── Skeleton card for loading ─────────────────────── */
const SkeletonCard = ({ isDark }) => (
  <div className="proj-skeleton-card" style={{
    background: isDark ? '#1f2937' : '#ffffff',
    border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
    borderRadius: '14px',
    padding: '1.25rem',
    display: 'flex', flexDirection: 'column', gap: '0.75rem',
  }}>
    <div className="proj-shimmer" style={{ height: 14, width: '60%', borderRadius: 6, background: isDark ? '#374151' : '#e5e7eb' }} />
    <div className="proj-shimmer" style={{ height: 10, width: '100%', borderRadius: 4, background: isDark ? '#374151' : '#e5e7eb' }} />
    <div className="proj-shimmer" style={{ height: 10, width: '80%', borderRadius: 4, background: isDark ? '#374151' : '#e5e7eb' }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
      <div className="proj-shimmer" style={{ height: 22, width: 60, borderRadius: 12, background: isDark ? '#374151' : '#e5e7eb' }} />
      <div className="proj-shimmer" style={{ height: 22, width: 22, borderRadius: 6, background: isDark ? '#374151' : '#e5e7eb' }} />
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════
   PROJECT LIST PAGE
══════════════════════════════════════════════════════ */
const ProjectListPage = () => {
  const {
    projects,
    loading,
    error,
    loadProjects,
    addProject,
    editProject,
    removeProject,
  } = useProjects();

  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const toast = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => { loadProjects(); }, [loadProjects]);

  /* Filtered list */
  const filtered = (projects || []).filter(p =>
    !search || p.name?.toLowerCase().includes(search.toLowerCase())
  );

  /* Handlers */
  const handleOpenCreate = () => navigate('/projects/new');
  const handleOpenEdit = (p) => { setEditingProject(p); setIsModalOpen(true); };

  const handleSave = async (data) => {
    try {
      if (editingProject) {
        await editProject(editingProject._id || editingProject.id, data);
        toast.success('Project updated');
      } else {
        await addProject(data);
        toast.success('Project created');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save project');
      throw err;
    }
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    try {
      await removeProject(projectToDelete._id || projectToDelete.id);
      toast.success(`"${projectToDelete.name}" deleted`);
      setProjectToDelete(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    } finally {
      setIsDeleting(false);
    }
  };

  /* ── Render ──────────────────────────────────────── */
  return (
    <div className="proj-page" style={{ animation: 'projFadeIn 0.35s ease both' }}>

      {/* ── Header ─────────────────────────────────── */}
      <div className="proj-header" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '1rem',
        paddingBottom: '1rem', marginBottom: '1.5rem',
        borderBottom: `1px solid ${isDark ? '#1f2937' : '#e5e7eb'}`,
      }}>
        <div>
          <h1 style={{
            fontSize: '1.5rem', fontWeight: 800,
            color: isDark ? '#f9fafb' : '#111827',
            letterSpacing: '-0.02em',
          }}>
            Projects
          </h1>
          <p style={{ fontSize: '0.82rem', color: isDark ? '#6b7280' : '#9ca3af', marginTop: '0.25rem' }}>
            Manage your active projects and workflows.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.375rem',
            background: isDark ? '#1f2937' : '#f9fafb',
            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
            borderRadius: '10px', padding: '0.4rem 0.75rem',
            width: '200px',
          }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#9ca3af', flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                border: 'none', outline: 'none', background: 'transparent',
                color: isDark ? '#f9fafb' : '#111827',
                fontSize: '0.82rem', width: '100%',
              }}
            />
          </div>
          {/* New project button */}
          <button
            onClick={handleOpenCreate}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.55rem 1rem',
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              color: '#fff', border: 'none', borderRadius: '10px',
              fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
              transition: 'all 0.2s',
            }}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </button>
        </div>
      </div>

      {/* ── Loading State ──────────────────────────── */}
      {loading && projects.length === 0 ? (
        <div className="proj-grid">
          {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} isDark={isDark} />)}
        </div>
      ) : error && projects.length === 0 ? (
        /* ── Error State ─────────────────────────── */
        <div style={{
          maxWidth: '460px', margin: '3rem auto', padding: '1.5rem',
          background: 'rgba(239,68,68,0.06)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: '14px', textAlign: 'center',
        }}>
          <p style={{ color: '#ef4444', fontWeight: 600, marginBottom: '0.5rem' }}>Failed to load projects</p>
          <p style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>
          <button
            onClick={loadProjects}
            style={{
              padding: '0.5rem 1.25rem', background: '#ef4444', color: '#fff',
              border: 'none', borderRadius: '8px', fontSize: '0.82rem',
              fontWeight: 600, cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      ) : filtered.length === 0 && !search ? (
        /* ── Empty State ─────────────────────────── */
        <div style={{
          padding: '3rem 2rem', textAlign: 'center',
          border: `2px dashed ${isDark ? '#374151' : '#d1d5db'}`,
          borderRadius: '16px',
          background: isDark ? '#111827' : '#ffffff',
        }}>
          <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor"
            style={{ margin: '0 auto 1rem', color: '#9ca3af' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: isDark ? '#f9fafb' : '#111827' }}>No projects yet</h3>
          <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '0.375rem' }}>Get started by creating your first project.</p>
          <button
            onClick={handleOpenCreate}
            style={{
              marginTop: '1.25rem', padding: '0.55rem 1.25rem',
              background: 'rgba(59,130,246,0.1)', color: '#3b82f6',
              border: 'none', borderRadius: '8px', fontSize: '0.85rem',
              fontWeight: 600, cursor: 'pointer',
            }}
          >
            Create First Project
          </button>
        </div>
      ) : filtered.length === 0 && search ? (
        /* ── No results for search ───────────────── */
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <p style={{ color: '#9ca3af', fontSize: '0.95rem' }}>No projects matching "{search}"</p>
        </div>
      ) : (
        /* ── Project Grid ────────────────────────── */
        <div className="proj-grid">
          {filtered.map((project) => {
            const pid = project._id || project.id;
            const status = project.status || 'Active';
            const s = STATUS_MAP[status] || fallbackStatus;

            return (
              <div
                key={pid}
                className="proj-card"
                style={{
                  background: isDark ? '#1f2937' : '#ffffff',
                  border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '14px',
                  display: 'flex', flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer',
                }}
                onClick={() => navigate(`/projects/${pid}`)}
              >
                {/* Card body */}
                <div style={{ padding: '1.25rem 1.25rem 0.75rem', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h3 style={{
                      fontSize: '0.95rem', fontWeight: 700,
                      color: isDark ? '#f9fafb' : '#111827',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      flex: 1, marginRight: '0.5rem',
                    }}>
                      {project.name}
                    </h3>
                    <span style={{
                      padding: '0.2rem 0.6rem', borderRadius: '10px',
                      fontSize: '0.68rem', fontWeight: 700,
                      background: s.bg, color: s.color,
                      whiteSpace: 'nowrap', flexShrink: 0,
                    }}>
                      {status}
                    </span>
                  </div>
                  <p style={{
                    fontSize: '0.82rem', color: isDark ? '#9ca3af' : '#6b7280',
                    lineHeight: 1.5,
                    display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {project.description || 'No description provided.'}
                  </p>
                </div>

                {/* Card footer */}
                <div
                  className="proj-card-footer"
                  style={{
                    padding: '0.5rem 1.25rem',
                    borderTop: `1px solid ${isDark ? '#374151' : '#f3f4f6'}`,
                    display: 'flex', justifyContent: 'flex-end', gap: '0.375rem',
                  }}
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    onClick={() => navigate(`/projects/${pid}`)}
                    className="proj-footer-btn"
                    style={{
                      padding: '0.35rem 0.75rem', borderRadius: '6px',
                      fontSize: '0.75rem', fontWeight: 600,
                      background: 'rgba(59,130,246,0.08)', color: '#3b82f6',
                      border: 'none', cursor: 'pointer', marginRight: 'auto',
                    }}
                  >
                    View Tasks
                  </button>
                  <button
                    onClick={() => handleOpenEdit(project)}
                    title="Edit"
                    style={{
                      padding: '0.3rem', borderRadius: '6px',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: isDark ? '#6b7280' : '#9ca3af',
                    }}
                  >
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setProjectToDelete(project)}
                    title="Delete"
                    style={{
                      padding: '0.3rem', borderRadius: '6px',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: isDark ? '#6b7280' : '#9ca3af',
                    }}
                  >
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Project Create/Edit Modal ─────────────── */}
      {isModalOpen && (
        <ProjectModal
          isOpen={isModalOpen}
          project={editingProject}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}

      {/* ── Delete Confirmation Modal ────────────── */}
      {projectToDelete && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: isDark ? '#1f2937' : '#ffffff',
            borderRadius: '16px', padding: '1.75rem', width: '100%', maxWidth: '380px',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%',
              background: 'rgba(239,68,68,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem',
            }}>
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#ef4444">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: isDark ? '#f9fafb' : '#111827', marginBottom: '0.375rem' }}>
              Delete Project
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '1.5rem' }}>
              Delete <strong style={{ color: isDark ? '#f9fafb' : '#111827' }}>{projectToDelete.name}</strong>? This cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.625rem' }}>
              <button
                onClick={() => setProjectToDelete(null)}
                disabled={isDeleting}
                style={{
                  padding: '0.5rem 1.25rem', borderRadius: '8px',
                  border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                  background: 'transparent',
                  color: isDark ? '#9ca3af' : '#6b7280',
                  fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                style={{
                  padding: '0.5rem 1.25rem', borderRadius: '8px',
                  border: 'none', background: '#ef4444', color: '#fff',
                  fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                  opacity: isDeleting ? 0.6 : 1,
                }}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectListPage;
