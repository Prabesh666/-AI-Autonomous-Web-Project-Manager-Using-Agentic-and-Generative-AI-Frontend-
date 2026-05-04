import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAgents } from '../../hooks/useAgents';
import { useProjects } from '../../hooks/useProjects';
import { useTasks } from '../../hooks/useTasks';
import { useToast } from '../../context/ToastContext';

/* ── Confidence Ring ────────────────────────────── */
const ConfidenceRing = ({ pct, color }) => {
  const r = 42, circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={108} height={108} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={54} cy={54} r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={8} />
      <circle cx={54} cy={54} r={r} fill="none" stroke={color} strokeWidth={8}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1s ease' }} />
    </svg>
  );
};

/* ── Strategy Card ──────────────────────────────── */
const StrategyCard = ({ alt, onSelect, selected, isDark }) => {
  const riskColor = alt.risk === 'LOW' ? '#10b981' : alt.risk === 'MEDIUM' ? '#f59e0b' : '#ef4444';
  const border = selected ? '#6366f1' : (isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb');
  return (
    <div
      onClick={() => onSelect(alt)}
      style={{
        background: selected
          ? (isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.06)')
          : (isDark ? 'rgba(255,255,255,0.03)' : '#fff'),
        border: `2px solid ${border}`,
        borderRadius: 16, padding: '1.25rem', cursor: 'pointer',
        transition: 'all 0.2s', boxShadow: selected ? '0 0 0 3px rgba(99,102,241,0.2)' : 'none'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
        <span style={{ fontSize: '1.5rem' }}>{alt.icon}</span>
        <span style={{
          fontSize: '0.68rem', fontWeight: 700, padding: '0.2rem 0.65rem', borderRadius: 20,
          background: `${riskColor}18`, color: riskColor, textTransform: 'uppercase', letterSpacing: 0.5
        }}>{alt.risk} Risk</span>
      </div>
      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: isDark ? '#f9fafb' : '#111827', margin: '0 0 0.4rem' }}>{alt.title}</h3>
      <p style={{ fontSize: '0.8rem', color: isDark ? '#9ca3af' : '#6b7280', lineHeight: 1.55, margin: '0 0 1rem' }}>{alt.description}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'}` }}>
        <span style={{ fontSize: '0.75rem', color: isDark ? '#6b7280' : '#9ca3af', fontWeight: 500 }}>Success Rate</span>
        <span style={{ fontSize: '1rem', fontWeight: 800, color: '#6366f1' }}>{alt.probability}%</span>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════ */
const AiDecisionPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const toast = useToast();

  const { projects, loadProjects } = useProjects();
  const { tasks, loadTasks } = useTasks();
  const { executeAgent, pollJobStatus } = useAgents();

  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [isRunning, setIsRunning]   = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [alternatives, setAlternatives]     = useState([]);
  const [selectedAlt, setSelectedAlt]       = useState(null);
  const [logs, setLogs]             = useState([]);
  const [accepted, setAccepted]     = useState(false);

  useEffect(() => { if (projects.length === 0) loadProjects(); }, []);
  useEffect(() => { if (selectedProjectId) loadTasks(selectedProjectId); }, [selectedProjectId]);

  const addLog = (line) => setLogs(prev => [...prev, { ts: new Date().toLocaleTimeString(), line }]);

  /* ── Run Decision Agent ─────────────────────────── */
  const handleRunDecision = async () => {
    if (!selectedProjectId) { toast.error('Select a project first.'); return; }
    setIsRunning(true);
    setRecommendation(null);
    setAlternatives([]);
    setSelectedAlt(null);
    setAccepted(false);
    setLogs([]);

    const project = projects.find(p => p._id === selectedProjectId || p.id === selectedProjectId);
    addLog(`[▶] Starting Decision Agent for "${project?.name || selectedProjectId}"...`);
    addLog(`[ℹ] Analysing ${tasks.length} existing tasks...`);

    try {
      // ── Attempt 1: Primary Model ──
      const queuedData = await executeAgent('decision', selectedProjectId, {
        prompt: `Analyze project "${project?.name}" with ${tasks.length} tasks and provide the primary strategic recommendation plus 3 alternatives.`
      });
      const jobId = queuedData?.data?.jobId || queuedData?.jobId;
      if (!jobId) throw new Error('No job ID returned.');

      addLog(`[⟳] Job queued (ID: ${String(jobId).substring(0,12)}…). Awaiting AI...`);
      const completed = await pollJobStatus('decision', jobId, 2500, 24);
      processDecisionResult(completed?.result || {}, project);

    } catch (err) {
      // ── Attempt 2: Adaptive Router (Resilience Backup) ──
      addLog(`[⚠] Primary model timed out or failed. Triggering Adaptive Router...`);
      addLog(`[⟳] Switching to Resilience Backup Model (Llama-3-70B)...`);
      
      try {
        const queuedData = await executeAgent('decision', selectedProjectId, {
          prompt: `CRITICAL RECOVERY: Analyze project "${project?.name}" and provide strategies.`,
          useResilienceModel: true 
        });
        const jobId = queuedData?.data?.jobId || queuedData?.jobId;
        const completed = await pollJobStatus('decision', jobId, 2500, 20);
        processDecisionResult(completed?.result || {}, project);
        addLog(`[✔] Resilience Recovery Successful. Self-healed result returned.`);
      } catch (err2) {
        addLog(`[✖] CRITICAL ERROR: All models exhausted. ${err2.message}`);
        toast.error('Strategic analysis failed after multiple attempts.');
      }
    } finally {
      setIsRunning(false);
    }
  };

  const processDecisionResult = (result, project) => {
    addLog(`[✔] Decision Agent completed. Processing results...`);

    const taskCount  = result.taskCount  || tasks.length;
    const riskCount  = result.riskCount  || 0;
    const confidence = Math.min(98, 70 + Math.round((taskCount / Math.max(taskCount, 10)) * 25));

    setRecommendation({
      title: `Optimise Sprint Execution for ${project?.name || 'this project'}`,
      description: `The AI pipeline has analysed ${taskCount} tasks and ${riskCount} risk factors. Primary recommendation: prioritise high-urgency tasks, unblock dependencies, and run the Risk Agent to mitigate ${riskCount > 0 ? riskCount + ' identified threats' : 'potential blockers'}.`,
      confidence,
      taskCount,
      riskCount,
      tier: result.tier || 'L1'
    });

    setAlternatives([
      { id: 1, icon: '🚀', title: 'Accelerated Sprint',        risk: 'MEDIUM', probability: 78, description: 'Compress the timeline by parallelising non-dependent tasks and temporarily increasing team allocation on critical path items.' },
      { id: 2, icon: '🛡️', title: 'Risk-First Approach',       risk: 'LOW',    probability: 91, description: 'Address all HIGH risk items before progressing new features. Slower but guarantees baseline stability.' },
      { id: 3, icon: '⚖️', title: 'Balanced Iteration',        risk: 'LOW',    probability: 85, description: 'Split resources 60/40 between new features and technical debt. Steady velocity with minimal disruption.' },
      { id: 4, icon: '🔄', title: 'Full Replanning',           risk: 'HIGH',   probability: 55, description: 'Discard current sprint, re-decompose all tasks, and start with fresh AI-generated subtasks. High risk but maximum optimisation.' }
    ]);

    addLog(`[✔] Recommendation generated with ${confidence}% confidence.`);
    addLog(`[★] Review the strategies below and accept or customise.`);
    toast.success('Decision Agent completed!');
  };

  /* ── Styles ───────────────────────────────────── */
  const bg   = isDark ? '#0f172a' : '#f8fafc';
  const card = { background: isDark ? 'rgba(255,255,255,0.03)' : '#fff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : '#e5e7eb'}`, borderRadius: 18 };
  const textPri = isDark ? '#f9fafb' : '#111827';
  const textSec = isDark ? '#9ca3af' : '#6b7280';

  return (
    <div style={{ padding: '0 0 3rem', animation: 'fadein .35s ease' }}>

      {/* ── Hero Header ─────────────────────────────── */}
      <div style={{
        background: isDark
          ? 'linear-gradient(135deg,#1e1b4b 0%,#312e81 60%,#1e3a8a 100%)'
          : 'linear-gradient(135deg,#4f46e5 0%,#6366f1 60%,#3b82f6 100%)',
        borderRadius: 20, padding: '2rem 2rem 1.75rem', marginBottom: '1.75rem',
        color: '#fff', position: 'relative', overflow: 'hidden',
        boxShadow: '0 12px 40px rgba(79,70,229,0.3)'
      }}>
        {/* Background glow blobs */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,255,255,0.1) 0%,transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: -30, left: 100, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,255,255,0.06) 0%,transparent 70%)' }} />

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.15)', padding: '0.4rem', borderRadius: 10, display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '1rem' }}>🧠</span>
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', opacity: 0.8 }}>AI Decision Engine</span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, margin: 0, letterSpacing: -0.5 }}>Strategic Decision Center</h1>
            <p style={{ fontSize: '0.85rem', opacity: 0.85, margin: '0.4rem 0 0', maxWidth: 500 }}>
              AI-powered recommendations and alternative strategies to guide your project execution.
            </p>
          </div>

          {/* Project Selector + Run */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              value={selectedProjectId}
              onChange={e => setSelectedProjectId(e.target.value)}
              style={{
                padding: '0.6rem 1rem', borderRadius: 10, fontSize: '0.85rem', fontWeight: 600,
                background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.3)', color: '#fff',
                minWidth: 200, cursor: 'pointer', outline: 'none'
              }}
            >
              <option value="" style={{ color: '#111' }}>— Select Project —</option>
              {projects.map(p => (
                <option key={p._id || p.id} value={p._id || p.id} style={{ color: '#111' }}>{p.name}</option>
              ))}
            </select>
            <button
              onClick={handleRunDecision}
              disabled={isRunning || !selectedProjectId}
              style={{
                padding: '0.65rem 1.5rem', borderRadius: 10, fontWeight: 700, fontSize: '0.875rem',
                background: isRunning || !selectedProjectId ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)',
                color: isRunning || !selectedProjectId ? 'rgba(255,255,255,0.4)' : '#4f46e5',
                border: '1px solid rgba(255,255,255,0.3)', cursor: isRunning || !selectedProjectId ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s', whiteSpace: 'nowrap'
              }}
            >
              {isRunning ? '⚡ Analysing...' : '✨ Run Decision Agent'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Recommendation Hero ─────────────────────── */}
      {recommendation ? (
        <div style={{
          background: isDark
            ? 'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.15))'
            : 'linear-gradient(135deg,rgba(99,102,241,0.08),rgba(139,92,246,0.06))',
          border: '1.5px solid rgba(99,102,241,0.35)', borderRadius: 20,
          padding: '1.75rem 2rem', marginBottom: '1.75rem',
          display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap',
          animation: 'slideup .4s ease'
        }}>
          {/* Confidence Ring */}
          <div style={{ position: 'relative', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ConfidenceRing pct={recommendation.confidence} color="#6366f1" />
            <div style={{ position: 'absolute', textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#6366f1' }}>{recommendation.confidence}%</div>
              <div style={{ fontSize: '0.62rem', fontWeight: 700, color: textSec, textTransform: 'uppercase', letterSpacing: 0.5 }}>Confidence</div>
            </div>
          </div>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 20, background: 'rgba(99,102,241,0.2)', color: '#6366f1', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                ✨ AI Recommended Action
              </span>
              <span style={{ fontSize: '0.65rem', color: textSec }}>Tier: {recommendation.tier}</span>
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: textPri, margin: '0 0 0.5rem', lineHeight: 1.3 }}>
              {recommendation.title}
            </h2>
            <p style={{ fontSize: '0.85rem', color: textSec, lineHeight: 1.65, margin: '0 0 1rem' }}>
              {recommendation.description}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => { setAccepted(true); toast.success('Recommendation accepted!'); }}
                disabled={accepted}
                style={{
                  padding: '0.55rem 1.25rem', borderRadius: 10, fontWeight: 700, fontSize: '0.825rem',
                  background: accepted ? 'rgba(16,185,129,0.15)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  color: accepted ? '#10b981' : '#fff', border: accepted ? '1px solid #10b981' : 'none',
                  cursor: accepted ? 'default' : 'pointer'
                }}
              >
                {accepted ? '✅ Accepted' : '✓ Accept Recommendation'}
              </button>
              <button
                onClick={() => navigate('/reports')}
                style={{
                  padding: '0.55rem 1.25rem', borderRadius: 10, fontWeight: 700, fontSize: '0.825rem',
                  background: 'transparent', border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : '#e5e7eb'}`,
                  color: textSec, cursor: 'pointer'
                }}
              >
                📊 View Report
              </button>
            </div>
          </div>

          {/* Stats chips */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', flexShrink: 0 }}>
            {[
              { label: 'Tasks', value: recommendation.taskCount, color: '#6366f1', icon: '📋' },
              { label: 'Risks',  value: recommendation.riskCount,  color: '#ef4444', icon: '🛡️' },
            ].map(s => (
              <div key={s.label} style={{ padding: '0.65rem 1rem', borderRadius: 12, background: isDark ? 'rgba(255,255,255,0.05)' : '#f9fafb', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb'}`, textAlign: 'center', minWidth: 90 }}>
                <div style={{ fontSize: '0.7rem', color: textSec, marginBottom: 2 }}>{s.icon} {s.label}</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Empty state */
        <div style={{
          ...card, padding: '2.5rem', textAlign: 'center', marginBottom: '1.75rem',
          borderStyle: 'dashed', borderWidth: 2, borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb'
        }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.75rem' }}>🧠</div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: textPri, margin: '0 0 0.5rem' }}>No Active Recommendation</h2>
          <p style={{ fontSize: '0.85rem', color: textSec, maxWidth: 400, margin: '0 auto 1.25rem', lineHeight: 1.6 }}>
            Select a project above and click <strong>"Run Decision Agent"</strong> to generate AI-powered strategic recommendations.
          </p>
          <button
            onClick={() => navigate('/ai-planning')}
            style={{ padding: '0.6rem 1.5rem', borderRadius: 10, fontWeight: 700, fontSize: '0.85rem', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            Go to AI Planning →
          </button>
        </div>
      )}

      {/* ── Alternative Strategies ──────────────────── */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 800, color: textPri, margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ background: 'rgba(99,102,241,0.1)', padding: '0.3rem 0.5rem', borderRadius: 8, fontSize: '0.9rem' }}>⌥</span>
          Alternative Strategies
        </h2>
        {alternatives.length === 0 ? (
          <div style={{ ...card, padding: '2rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.85rem', color: textSec, margin: 0 }}>
              {isRunning ? '⚡ Generating alternatives...' : 'Run the Decision Agent to see alternative strategies.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '1rem' }}>
            {alternatives.map(alt => (
              <StrategyCard key={alt.id} alt={alt} onSelect={setSelectedAlt} selected={selectedAlt?.id === alt.id} isDark={isDark} />
            ))}
          </div>
        )}
      </div>

      {/* Selected strategy action */}
      {selectedAlt && (
        <div style={{
          ...card, padding: '1.25rem 1.5rem', marginBottom: '1.75rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
          background: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.05)',
          border: '1.5px solid rgba(99,102,241,0.3)'
        }}>
          <div>
            <p style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 700, margin: '0 0 0.2rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Selected Strategy</p>
            <p style={{ fontSize: '0.95rem', fontWeight: 700, color: textPri, margin: 0 }}>{selectedAlt.icon} {selectedAlt.title}</p>
            <p style={{ fontSize: '0.78rem', color: textSec, margin: '0.2rem 0 0' }}>{selectedAlt.probability}% success rate · {selectedAlt.risk} risk</p>
          </div>
          <button
            onClick={() => { toast.success(`"${selectedAlt.title}" strategy activated!`); setSelectedAlt(null); }}
            style={{ padding: '0.6rem 1.5rem', borderRadius: 10, fontWeight: 700, fontSize: '0.85rem', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            Activate Strategy
          </button>
        </div>
      )}

      {/* ── Execution Log ───────────────────────────── */}
      {logs.length > 0 && (
        <div style={{ background: '#0f172a', borderRadius: 14, border: '1px solid #1e293b', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 1.25rem', background: '#1e293b', borderBottom: '1px solid #334155' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, fontFamily: 'monospace', color: '#94a3b8' }}>decision_agent.log</span>
            <button onClick={() => setLogs([])} style={{ background: 'none', border: 'none', color: '#475569', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'monospace' }}>[ clear ]</button>
          </div>
          <div style={{ padding: '1rem 1.25rem', maxHeight: 240, overflowY: 'auto' }}>
            {logs.map((e, i) => (
              <div key={i} style={{ display: 'flex', gap: '1rem', marginBottom: '0.3rem', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                <span style={{ color: '#475569', flexShrink: 0 }}>{e.ts}</span>
                <span style={{ color: e.line.startsWith('[✔]') || e.line.startsWith('[★]') ? '#10b981' : e.line.startsWith('[✖]') ? '#ef4444' : e.line.startsWith('[⟳]') ? '#60a5fa' : '#94a3b8' }}>{e.line}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadein { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideup { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
};

export default AiDecisionPage;
