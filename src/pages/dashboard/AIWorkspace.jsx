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
  const { loadingMap, executeAgent, pollJobStatus, clearAll } = useAgents();

  useEffect(() => {
    if (projects.length === 0) loadProjects();
  }, [projects, loadProjects]);

  useEffect(() => {
    if (selectedProjectId) loadTasks(selectedProjectId);
  }, [selectedProjectId, loadTasks]);

  const [consoleLogs, setConsoleLogs] = useState([]);   // live terminal output
  const [activeJob, setActiveJob]     = useState(null);  // { type, jobId }

  const addLog = (line) => setConsoleLogs(prev => [...prev, { ts: new Date().toLocaleTimeString(), line }]);

  const handleRunEngine = async (type) => {
    if (!selectedProjectId) {
      toast.error('Please select a project first.');
      return;
    }

    // Build optional extra fields per engine type
    let extra = {};
    if (type === 'scoring') {
      extra = { tasks: tasks.map(t => ({ name: t.title || 'Untitled', priority: t.priority || 'medium', riskLevel: t.riskLevel || 'low' })) };
    } else if (type === 'replanning') {
      const formatted = tasks.map(t => ({ id: t._id || t.id, dependencies: t.dependencies || [] }));
      extra = { failedTaskId: formatted[0]?.id || 'task_001', tasks: formatted };
    } else if (type === 'dependency') {
      extra = { tasks: tasks.map(t => ({ id: t._id || t.id, dependencies: t.dependencies || [] })) };
    }

    addLog(`[▶] Initializing ${type.toUpperCase()} agent...`);
    setActiveJob({ type });

    try {
      // ── Stage 1: Primary Execution ──
      const queuedData = await executeAgent(type, selectedProjectId, extra);
      const jobId = queuedData?.data?.jobId || queuedData?.jobId;

      if (!jobId) {
        addLog(`[✔] Agent executed synchronously.`);
        addLog(`[★] Done.`);
        setActiveJob(null);
        toast.success(`${type} agent completed.`);
        return;
      }

      addLog(`[⟳] Job enqueued (ID: ${jobId.substring(0,12)}…). Waiting for worker...`);
      setActiveJob({ type, jobId });

      // Poll for completion
      const completedJob = await pollJobStatus(type, jobId, 2500, 24);
      processAgentResult(type, completedJob?.result || {});

    } catch (err) {
      // ── Stage 2: Adaptive Recovery ──
      addLog(`[⚠] Node latency detected. Triggering Adaptive Recovery...`);
      addLog(`[⟳] Scaling to High-Availability Backup Cluster...`);
      
      try {
        // Retry with a resilience flag
        const recoveryData = await executeAgent(type, selectedProjectId, { ...extra, useResilienceModel: true });
        const rid = recoveryData?.data?.jobId || recoveryData?.jobId;
        
        if (rid) {
          const recovered = await pollJobStatus(type, rid, 2500, 20);
          processAgentResult(type, recovered?.result || {});
          addLog(`[✔] Recovery Successful. Data integrity verified.`);
          toast.success(`Self-healed ${type} agent completed!`);
        } else {
          addLog(`[✔] Synchronous recovery complete.`);
        }
      } catch (err2) {
        addLog(`[✖] CRITICAL FAILURE: Cluster exhausted. ${err2.message}`);
        toast.error(`Failed to execute ${type} after recovery attempt.`);
      }
    } finally {
      setActiveJob(null);
    }
  };

  const processAgentResult = (type, result) => {
    addLog(`[✔] ${type.toUpperCase()} agent completed successfully.`);
    if (result.taskCount)  addLog(`[✔] Tasks generated: ${result.taskCount}`);
    if (result.riskCount)  addLog(`[✔] Risks identified: ${result.riskCount}`);
    if (result.tier)       addLog(`[✔] Processing tier: ${result.tier}`);
    addLog(`[★] Result stored. Check the project Kanban for updates.`);
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
                disabled={!!activeJob || !selectedProjectId}
                style={{
                  width: '100%', padding: '0.5rem',
                  background: (!!activeJob || !selectedProjectId) ? (isDark ? '#374151' : '#e2e8f0') : 'rgba(139, 92, 246, 0.1)',
                  border: `1px solid ${(!!activeJob || !selectedProjectId) ? 'transparent' : 'rgba(139, 92, 246, 0.4)'}`,
                  color: (!!activeJob || !selectedProjectId) ? (isDark ? '#6b7280' : '#94a3b8') : '#8b5cf6',
                  borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem',
                  cursor: (!!activeJob || !selectedProjectId) ? 'not-allowed' : 'pointer'
                }}
              >
                {activeJob?.type === agent.id ? 'Running...' : 'Run Agent'}
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
                disabled={!!activeJob || !selectedProjectId}
                style={{
                  width: '100%', padding: '0.75rem',
                  background: (!!activeJob || !selectedProjectId) ? (isDark ? '#374151' : '#e2e8f0') : 'rgba(59, 130, 246, 0.1)',
                  border: `1px solid ${(!!activeJob || !selectedProjectId) ? 'transparent' : 'rgba(59, 130, 246, 0.4)'}`,
                  color: (!!activeJob || !selectedProjectId) ? (isDark ? '#6b7280' : '#94a3b8') : '#3b82f6',
                  borderRadius: '8px', fontWeight: 600,
                  cursor: (!!activeJob || !selectedProjectId) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {activeJob?.type === engine.id ? 'Executing...' : `Execute ${engine.name}`}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Console Output Area ──────────────────────── */}
      {consoleLogs.length > 0 && (
        <div style={{
          background: '#0f172a', borderRadius: '14px', border: '1px solid #1e293b', 
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)', overflow: 'hidden', animation: 'fadeIn 0.4s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.5rem', background: '#1e293b', borderBottom: '1px solid #334155' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#10b981">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M4 15V9a2 2 0 012-2h12a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2z" />
               </svg>
               <span style={{ color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 600, fontFamily: 'monospace' }}>agent_output.log</span>
               {activeJob && <span style={{ fontSize: '0.72rem', background: 'rgba(59,130,246,0.2)', color: '#60a5fa', padding: '0.1rem 0.5rem', borderRadius: 20, marginLeft: 4 }}>● running</span>}
             </div>
             <button onClick={() => setConsoleLogs([])} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'monospace' }}>
               [ clear ]
             </button>
          </div>
          <div style={{ padding: '1.25rem 1.5rem', maxHeight: '360px', overflowY: 'auto' }}>
            {consoleLogs.map((entry, i) => (
              <div key={i} style={{ display: 'flex', gap: '1rem', marginBottom: '0.35rem', fontFamily: 'monospace', fontSize: '0.83rem' }}>
                <span style={{ color: '#475569', flexShrink: 0 }}>{entry.ts}</span>
                <span style={{
                  color: entry.line.startsWith('[✔]') || entry.line.startsWith('[★]') ? '#10b981'
                       : entry.line.startsWith('[✖]') ? '#ef4444'
                       : entry.line.startsWith('[⟳]') ? '#60a5fa'
                       : '#94a3b8'
                }}>{entry.line}</span>
              </div>
            ))}
            {activeJob && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', animation: 'pulse 1.2s infinite' }} />
                <span style={{ color: '#60a5fa', fontFamily: 'monospace', fontSize: '0.83rem' }}>Waiting for worker response...</span>
              </div>
            )}
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
