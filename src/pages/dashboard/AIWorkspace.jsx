import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useProjects } from '../../hooks/useProjects';
import { useTasks } from '../../hooks/useTasks';
import { useAgents } from '../../hooks/useAgents';
import { useToast } from '../../context/ToastContext';

/* ══════════════════════════════════════════════════════
   AI PLANNING WORKSPACE (AI Planning)
══════════════════════════════════════════════════════ */
const AIWorkspace = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const toast = useToast();
  
  const { projects, loadProjects } = useProjects();
  const { tasks, loadTasks } = useTasks();
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const { loadingMap, resultsMap, executeAgent, clearResult } = useAgents();

  useEffect(() => {
    if (projects.length === 0) loadProjects();
  }, [projects, loadProjects]);

  useEffect(() => {
    if (selectedProjectId) {
      loadTasks(selectedProjectId);
    }
  }, [selectedProjectId, loadTasks]);

  const handleRunEngine = async (type) => {
    if (!selectedProjectId) {
      toast.error('Please select a project first.');
      return;
    }

    let payload = { projectId: selectedProjectId };

    // Dynamically build payloads based on engine/agent requirements
    if (type === 'scoring') {
      // Precise payload mapping for Scoring Engine per Postman screenshot
      const formattedTasks = tasks.map(t => ({
        name: t.title || t.name || 'Untitled Task',
        priority: t.priority || 'medium',
        riskLevel: t.riskLevel || 'low'
      }));
      payload = { tasks: formattedTasks };
    } else if (type === 'replanning') {
      // Precise payload mapping for Replanning Engine per latest screenshot
      const formattedTasks = tasks.map(t => ({
        id: t._id || t.id || t.name,
        dependencies: t.dependencies || []
      }));
      payload = { 
        failedTaskId: formattedTasks[0]?.id || 'task_001', 
        tasks: formattedTasks 
      };
    } else if (type === 'dependency') {
      // Precise payload mapping for Dependency Engine per latest screenshot
      const formattedTasks = tasks.map(t => ({
        id: t._id || t.id || t.name,
        dependencies: t.dependencies || []
      }));
      payload = { tasks: formattedTasks };
    } else {
      payload = { ...payload, stage: 'start' };
    }

    try {
      // Final precision dispatch
      let finalPayload = payload;
      if (type === 'rule') finalPayload = { stage: 'start' };
      
      await executeAgent(type, finalPayload);
      toast.success(`${type} module executed.`);
    } catch (err) {
      toast.error(err.message || `Failed to run ${type}.`);
    }
  };

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
              AI Engine Control Center
            </span>
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
            Autonomous Operations
          </h1>
          <p style={{ fontSize: '1.05rem', opacity: 0.9, maxWidth: '600px', lineHeight: 1.6 }}>
            Execute highly-specialized ML engines manually to process business rules, compute risk scores, adjust dependencies, and orchestrate replanning.
          </p>
        </div>
      </div>

      {/* ── Selection Area ────────────────────────── */}
      <div style={{ ...cardStyle, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '280px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: isDark ? '#9ca3af' : '#64748b', marginBottom: '0.5rem' }}>
            1. Select Active Project Context
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
            <option value="">Awaiting project selection...</option>
            {projects.map(p => (
              <option key={p._id || p.id} value={p._id || p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Agents Grid ───────────────────────────── */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: isDark ? '#9ca3af' : '#64748b', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          AI Agents
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          {[
            { id: 'decision', name: 'Decision Agent', icon: '🧠', desc: 'Evaluates project trade-offs and provides optimized direction.' },
            { id: 'task', name: 'Task Agent', icon: '📝', desc: 'Decomposes high-level goals into granular, actionable sub-tasks.' },
            { id: 'risk', name: 'Risk Agent', icon: '🛡️', desc: 'Identifies potential failures and suggests mitigation strategies.' },
            { id: 'ethics', name: 'Ethics Agent', icon: '⚖️', desc: 'Ensures compliance with safety guidelines and ethical standards.' },
            { id: 'report', name: 'Report Agent', icon: '📊', desc: 'Generates executive summaries and health status reports.' }
          ].map(agent => (
            <div key={agent.id} style={{ ...cardStyle, padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>{agent.icon}</span>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: textPrimary(isDark) }}>{agent.name}</h3>
              </div>
              <p style={{ fontSize: '0.78rem', color: isDark ? '#9ca3af' : '#64748b', lineHeight: 1.4, marginBottom: '1rem' }}>{agent.desc}</p>
              <button
                onClick={() => handleRunEngine(agent.id)}
                disabled={loadingMap[agent.id] || !selectedProjectId}
                style={{
                  width: '100%', padding: '0.5rem',
                  background: loadingMap[agent.id] || !selectedProjectId ? (isDark ? '#374151' : '#e2e8f0') : 'rgba(139, 92, 246, 0.1)',
                  border: `1px solid ${loadingMap[agent.id] || !selectedProjectId ? 'transparent' : 'rgba(139, 92, 246, 0.4)'}`,
                  color: loadingMap[agent.id] || !selectedProjectId ? (isDark ? '#6b7280' : '#94a3b8') : '#8b5cf6',
                  borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem',
                  cursor: loadingMap[agent.id] || !selectedProjectId ? 'not-allowed' : 'pointer'
                }}
              >
                {loadingMap[agent.id] ? 'Running...' : 'Run Agent'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Engines Grid ──────────────────────────── */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: isDark ? '#9ca3af' : '#64748b', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Autonomous Engines
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {[
            { id: 'rule', name: 'Rule Engine', icon: '⚙️', desc: 'Validates constraints and enforces strict project governance rules.' },
            { id: 'scoring', name: 'Scoring Engine', icon: '🎯', desc: 'Calculates priority scores, risk metrics, and workload balancing.' },
            { id: 'dependency', name: 'Dependency Engine', icon: '🔗', desc: 'Analyzes cross-task relationships and detects critical path blockers.' },
            { id: 'replanning', name: 'Replanning Engine', icon: '🔄', desc: 'Auto-adjusts timelines and resources to compensate for delays.' }
          ].map(engine => (
            <div key={engine.id} style={{ ...cardStyle }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: textPrimary(isDark), marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>{engine.icon}</span> {engine.name}
              </h3>
              <p style={{ fontSize: '0.85rem', color: isDark ? '#9ca3af' : '#64748b', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                {engine.desc}
              </p>
              <button
                onClick={() => handleRunEngine(engine.id)}
                disabled={loadingMap[engine.id] || !selectedProjectId}
                style={{
                  width: '100%', padding: '0.75rem',
                  background: loadingMap[engine.id] || !selectedProjectId ? (isDark ? '#374151' : '#e2e8f0') : 'rgba(59, 130, 246, 0.1)',
                  border: `1px solid ${loadingMap[engine.id] || !selectedProjectId ? 'transparent' : 'rgba(59, 130, 246, 0.4)'}`,
                  color: loadingMap[engine.id] || !selectedProjectId ? (isDark ? '#6b7280' : '#94a3b8') : '#3b82f6',
                  borderRadius: '8px', fontWeight: 600,
                  cursor: loadingMap[engine.id] || !selectedProjectId ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {loadingMap[engine.id] ? 'Executing...' : `Execute ${engine.name}`}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Console Output Area ──────────────────────── */}
      {Object.keys(resultsMap).length > 0 && (
        <div style={{
          background: '#0f172a', borderRadius: '14px', border: '1px solid #1e293b', 
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)', overflow: 'hidden', animation: 'fadeIn 0.4s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.5rem', background: '#1e293b', borderBottom: '1px solid #334155' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#10b981">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M4 15V9a2 2 0 012-2h12a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2z" />
               </svg>
               <span style={{ color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 600, fontFamily: 'monospace' }}>engine_execution.log</span>
             </div>
             <button onClick={() => Object.keys(resultsMap).forEach(clearResult)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'monospace' }}>
               [ clear ]
             </button>
          </div>
          <div style={{ padding: '1.5rem', maxHeight: '400px', overflowY: 'auto' }}>
            {Object.entries(resultsMap).map(([key, data]) => (
              <div key={key} style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px dashed #334155' }}>
                <div style={{ color: '#3b82f6', marginBottom: '0.8rem', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.85rem' }}>
                  &gt; Output stream for [{key}] module at {new Date().toLocaleTimeString()}
                </div>
                <pre style={{ margin: 0, color: '#10b981', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                  {JSON.stringify(data?.data || data, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
      
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
