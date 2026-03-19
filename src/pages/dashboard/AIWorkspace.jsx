import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useProjects } from '../../hooks/useProjects';
import { useTasks } from '../../hooks/useTasks';
import { useNavigate } from 'react-router-dom';

/* ══════════════════════════════════════════════════════
   AI PLANNING WORKSPACE (AI Planning)
══════════════════════════════════════════════════════ */
const AIWorkspace = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  
  const { projects, loadProjects } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const { loading, loadTasks } = useTasks();

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    if (selectedProjectId) {
      loadTasks(selectedProjectId);
    }
  }, [selectedProjectId, loadTasks]);

  const selectedProject = projects.find(p => p._id === selectedProjectId || p.id === selectedProjectId);

  /* ── Styles ────────────────────────────────────── */
  const cardStyle = {
    background: isDark ? 'rgba(31, 41, 55, 0.6)' : 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}`,
    borderRadius: '16px',
    padding: '1.5rem',
    boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 24px rgba(0,0,0,0.04)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  };

  const gradientHeader = {
    background: isDark 
      ? 'linear-gradient(135deg, #1e3a8a 0%, #1e1b4b 100%)' 
      : 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)',
    padding: '2.5rem 2rem',
    borderRadius: '20px',
    color: '#fff',
    marginBottom: '2rem',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 10px 30px rgba(37, 99, 235, 0.2)',
  };

  const glowEffect = {
    position: 'absolute',
    top: '-20%',
    right: '-10%',
    width: '300px',
    height: '300px',
    background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
    borderRadius: '50%',
    pointerEvents: 'none',
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      
      {/* ── Header Section ────────────────────────── */}
      <div style={gradientHeader}>
        <div style={glowEffect} />
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ 
              background: 'rgba(255,255,255,0.2)', 
              backdropFilter: 'blur(8px)',
              padding: '0.5rem', borderRadius: '10px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', opacity: 0.9 }}>
              AI Strategic Planner
            </span>
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
            Smart Project Planning
          </h1>
          <p style={{ fontSize: '1.05rem', opacity: 0.9, maxWidth: '600px', lineHeight: 1.6 }}>
            Leverage advanced AI to generate roadmaps, optimize resources, and predict project bottlenecks before they happen.
          </p>
        </div>
      </div>

      {/* ── Selection Area ────────────────────────── */}
      <div style={{ ...cardStyle, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '280px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: isDark ? '#9ca3af' : '#64748b', marginBottom: '0.5rem' }}>
            Select Active Project
          </label>
          <select 
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              background: isDark ? '#111827' : '#f1f5f9',
              border: `1px solid ${isDark ? '#374151' : '#e2e8f0'}`,
              color: isDark ? '#f3f4f6' : '#1e293b',
              fontSize: '0.95rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="">Choose a project...</option>
            {projects.map(p => (
              <option key={p._id || p.id} value={p._id || p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        
        <button 
          disabled={!selectedProjectId || loading}
          style={{
            padding: '0.85rem 2rem',
            background: !selectedProjectId ? (isDark ? '#374151' : '#e2e8f0') : 'linear-gradient(135deg, #3b82f6, #6366f1)',
            color: !selectedProjectId ? (isDark ? '#6b7280' : '#94a3b8') : '#fff',
            border: 'none',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: !selectedProjectId ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            boxShadow: selectedProjectId ? '0 4px 12px rgba(99,102,241,0.3)' : 'none',
            marginTop: '1.25rem'
          }}
          onMouseEnter={e => { if(selectedProjectId) e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { if(selectedProjectId) e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          {loading ? 'Analyzing...' : 'Generate AI Plan ✨'}
        </button>
      </div>

      {/* ── Content Grid ──────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        
        {/* Resource Allocation */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: textPrimary(isDark), marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#3b82f6' }}>📊</span> Resource Optimization
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { label: 'Development', val: 85, color: '#3b82f6' },
              { label: 'Design', val: 40, color: '#ec4899' },
              { label: 'QA / Testing', val: 20, color: '#f59e0b' }
            ].map((item, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                  <span style={{ color: isDark ? '#d1d5db' : '#475569', fontWeight: 500 }}>{item.label}</span>
                  <span style={{ color: item.color, fontWeight: 700 }}>{item.val}%</span>
                </div>
                <div style={{ height: '8px', background: isDark ? '#374151' : '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${item.val}%`, height: '100%', background: item.color, borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Recommendations */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: textPrimary(isDark), marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#8b5cf6' }}>💡</span> AI Insights
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              "Parallelize backend setup to save 3 days.",
              "Documentation is a risk for Sprint 2.",
              "QA capacity alert for next week."
            ].map((text, i) => (
              <div key={i} style={{ 
                padding: '0.85rem', 
                background: isDark ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.05)', 
                borderLeft: '3px solid #3b82f6',
                borderRadius: '6px',
                fontSize: '0.88rem',
                color: isDark ? '#e5e7eb' : '#334155',
                lineHeight: 1.4
              }}>
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* Milestone Tracker */}
        <div style={{ ...cardStyle, gridColumn: 'span 1' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: textPrimary(isDark), marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#10b981' }}>🚩</span> Milestones
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {selectedProject ? (
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <p style={{ fontSize: '0.85rem', color: isDark ? '#9ca3af' : '#64748b' }}>Project: <strong style={{color: textPrimary(isDark)}}>{selectedProject.name}</strong></p>
                <button 
                  onClick={() => navigate(`/projects/${selectedProject._id || selectedProject.id}`)}
                  style={{
                    marginTop: '1rem',
                    padding: '0.5rem 1rem',
                    background: 'none',
                    border: '1px solid #3b82f6',
                    color: '#3b82f6',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  View Kanban Board
                </button>
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem', padding: '1rem' }}>Select a project to see milestones</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Styles defined as functions to handle theme */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

const textPrimary = (isDark) => isDark ? '#f9fafb' : '#0f172a';

export default AIWorkspace;
