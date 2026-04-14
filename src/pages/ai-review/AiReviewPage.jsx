import { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAgents } from '../../hooks/useAgents';
import { AppContext } from '../../context/AppContext';
import { useTasks } from '../../hooks/useTasks';
import { useToast } from '../../context/ToastContext';

const AiReviewPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const toast = useToast();
  const { projects, loadProjectById } = useContext(AppContext);
  const { tasks, loadTasks } = useTasks();
  const { executeAgent, pollJobStatus } = useAgents();

  const messagesEndRef = useRef(null);
  const [project, setProject] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: `Welcome! I'm your AI Review Agent. Click **"Run Full Audit"** above to trigger a complete analysis of this project — including task generation, risk assessment, and an executive report. Or ask me anything below.`
    }
  ]);

  // Load project and tasks on mount
  useEffect(() => {
    if (!projectId) { navigate('/projects', { replace: true }); return; }
    const cached = projects.find(p => p._id === projectId || p.id === projectId);
    if (cached) setProject(cached);
    else loadProjectById(projectId).then(p => { if (p) setProject(p); }).catch(() => {});
    loadTasks(projectId);
  }, [projectId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (sender, text, extra = {}) => {
    setMessages(prev => [...prev, { id: Date.now() + Math.random(), sender, text, ...extra }]);
  };

  /* ── Run Full AI Audit ───────────────────────── */
  const handleRunAudit = async () => {
    if (!projectId || isRunning) return;
    setIsRunning(true);
    addMessage('user', 'Run full AI audit on this project.');
    addMessage('ai', '⚡ Initiating AI audit pipeline. This may take up to 60 seconds...');

    try {
      const queuedData = await executeAgent('planner', projectId, {
        prompt: `Perform a complete audit of the project: ${project?.name || projectId}. Generate tasks, assess risks, and produce an executive report.`
      });
      const jobId = queuedData?.data?.jobId || queuedData?.jobId;
      if (!jobId) throw new Error('Failed to queue the audit job.');

      addMessage('ai', `⟳ Job queued (ID: ${String(jobId).substring(0, 12)}…). Polling for results...`);

      const completedJob = await pollJobStatus('planner', jobId, 2500, 24);
      const result = completedJob?.result || {};

      const taskCount = result.taskCount || 0;
      const riskCount = result.riskCount || 0;
      const tier      = result.tier || 'L0';

      addMessage('ai',
        `✅ **Audit Complete** (Tier: ${tier})\n\n` +
        `📋 **${taskCount} tasks** have been generated and added to your Kanban board.\n` +
        `🛡️ **${riskCount} risks** identified with mitigation strategies.\n\n` +
        `Navigate to the project Kanban board to see all generated work items.`,
        { isResult: true, taskCount, riskCount }
      );

      // Reload tasks after pipeline runs
      await loadTasks(projectId);
      toast.success(`AI Audit complete — ${taskCount} tasks, ${riskCount} risks.`);
    } catch (err) {
      addMessage('ai', `❌ **Audit Failed:** ${err.message || 'An error occurred during the AI pipeline.'}`);
      toast.error('Audit failed.');
    } finally {
      setIsRunning(false);
    }
  };

  /* ── Chat Send ───────────────────────────────── */
  const handleSend = () => {
    const text = chatInput.trim();
    if (!text) return;
    setChatInput('');
    addMessage('user', text);

    // Simple keyword-based local responses (AI chat stub)
    setTimeout(() => {
      let reply = "I'm analyzing your query. To run a full project scan, click **\"Run Full Audit\"** above.";
      const lower = text.toLowerCase();
      if (lower.includes('task')) reply = `This project currently has **${tasks.length} tasks** on the Kanban board. Run an audit to generate AI-powered tasks.`;
      else if (lower.includes('risk')) reply = 'Risk assessment is automatically performed during the full audit. Click **"Run Full Audit"** to generate risk data.';
      else if (lower.includes('status') || lower.includes('health')) {
        const done = tasks.filter(t => ['completed','done'].includes(t.status)).length;
        const pct  = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
        reply = `Project health: **${pct}% completion** (${done} of ${tasks.length} tasks done).`;
      } else if (lower.includes('help')) {
        reply = 'I can help you:\n• Run a full AI audit\n• Check task and risk counts\n• Review project health\n\nJust ask or click **"Run Full Audit"** to start!';
      }
      addMessage('ai', reply);
    }, 700);
  };

  /* ── Derived stats ───────────────────────────── */
  const doneTasks   = tasks.filter(t => ['completed','done'].includes((t.status||'').toLowerCase())).length;
  const inProg      = tasks.filter(t => ['in-progress','in_progress'].includes((t.status||'').toLowerCase())).length;
  const highRisk    = tasks.filter(t => (t.riskLevel||'').toLowerCase() === 'high').length;
  const completion  = tasks.length ? Math.round((doneTasks / tasks.length) * 100) : 0;
  const healthColor = completion >= 70 ? '#10b981' : completion >= 40 ? '#f59e0b' : '#ef4444';
  const healthLabel = completion >= 70 ? 'Good' : completion >= 40 ? 'Moderate' : 'Needs Attention';

  /* ── Styles ──────────────────────────────────── */
  const card = {
    background: isDark ? 'rgba(17,24,39,0.6)' : 'rgba(255,255,255,0.8)',
    backdropFilter: 'blur(10px)',
    borderRadius: 16,
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', animation: 'fade .35s ease' }}>

      {/* ── Header ───────────────────────────────── */}
      <div style={{
        background: isDark ? 'linear-gradient(135deg,#312e81,#1e1b4b)' : 'linear-gradient(135deg,#6366f1,#4f46e5)',
        padding: '1.25rem 1.75rem', borderRadius: 16, color: '#fff',
        marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: '0 8px 24px rgba(79,70,229,0.25)'
      }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>
            🤖 AI Review Agent
          </h1>
          <p style={{ fontSize: '0.8rem', opacity: 0.85, margin: '0.2rem 0 0' }}>
            {project?.name ? `Reviewing: ${project.name}` : `Project ID: ${projectId}`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={() => navigate(`/projects/${projectId}`)}
            style={{ padding: '0.5rem 1rem', borderRadius: 10, fontSize: '0.8rem', fontWeight: 600, border: '1px solid rgba(255,255,255,0.3)', background: 'transparent', color: '#fff', cursor: 'pointer' }}
          >
            ← Kanban
          </button>
          <button
            onClick={handleRunAudit}
            disabled={isRunning}
            style={{
              padding: '0.6rem 1.25rem', borderRadius: 10, fontSize: '0.85rem', fontWeight: 700,
              background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.35)',
              color: '#fff', cursor: isRunning ? 'not-allowed' : 'pointer', opacity: isRunning ? 0.7 : 1
            }}
          >
            {isRunning ? '⚡ Running Audit...' : '✨ Run Full Audit'}
          </button>
        </div>
      </div>

      {/* ── Grid ─────────────────────────────────── */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.25rem', overflow: 'hidden' }}>

        {/* Chat Panel */}
        <div style={{ ...card, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Messages */}
          <div style={{ flex: 1, padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {messages.map(msg => (
              <div key={msg.id} style={{
                maxWidth: '85%', alignSelf: msg.sender === 'ai' ? 'flex-start' : 'flex-end',
                background: msg.sender === 'ai'
                  ? (isDark ? 'linear-gradient(135deg,#1e3a8a,#1e1b4b)' : 'linear-gradient(135deg,#3b82f6,#6366f1)')
                  : (isDark ? '#374151' : '#f1f5f9'),
                color: msg.sender === 'ai' ? '#fff' : (isDark ? '#f3f4f6' : '#1e293b'),
                padding: '0.875rem 1.1rem', borderRadius: msg.sender === 'ai' ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
                fontSize: '0.875rem', lineHeight: 1.55, boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                whiteSpace: 'pre-wrap'
              }}>
                {msg.text.replace(/\*\*(.*?)\*\*/g, '$1')}
                {msg.isResult && (
                  <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ background: 'rgba(255,255,255,0.15)', padding: '0.25rem 0.75rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700 }}>
                      📋 {msg.taskCount} Tasks
                    </span>
                    <span style={{ background: 'rgba(255,255,255,0.15)', padding: '0.25rem 0.75rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700 }}>
                      🛡️ {msg.riskCount} Risks
                    </span>
                  </div>
                )}
              </div>
            ))}
            {isRunning && (
              <div style={{
                alignSelf: 'flex-start', background: isDark ? 'linear-gradient(135deg,#1e3a8a,#1e1b4b)' : 'linear-gradient(135deg,#3b82f6,#6366f1)',
                padding: '0.875rem 1.1rem', borderRadius: '18px 18px 18px 4px',
                display: 'flex', gap: 5
              }}>
                {[0, 0.2, 0.4].map((d, i) => (
                  <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff', animation: `chatPulse 1s ${d}s infinite` }} />
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '1rem 1.25rem', borderTop: `1px solid ${isDark ? '#1f2937' : '#e5e7eb'}` }}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Ask about tasks, risks, health..."
                style={{
                  flex: 1, padding: '0.7rem 1rem', borderRadius: 10, fontSize: '0.875rem',
                  background: isDark ? '#111827' : '#f8fafc',
                  border: `1px solid ${isDark ? '#374151' : '#e2e8f0'}`,
                  color: isDark ? '#fff' : '#1e293b', outline: 'none'
                }}
              />
              <button
                onClick={handleSend}
                style={{
                  padding: '0.7rem 1.25rem', borderRadius: 10, fontWeight: 700, fontSize: '0.85rem',
                  background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', cursor: 'pointer'
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
          {/* Project Health */}
          <div style={{ ...card, padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.82rem', fontWeight: 700, color: isDark ? '#9ca3af' : '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 1rem' }}>Project Health</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
                border: `4px solid ${healthColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.9rem', fontWeight: 800, color: healthColor
              }}>{completion}%</div>
              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: healthColor, margin: 0 }}>{healthLabel}</p>
                <p style={{ fontSize: '0.75rem', color: isDark ? '#9ca3af' : '#6b7280', margin: '0.2rem 0 0' }}>{doneTasks} of {tasks.length} tasks complete</p>
              </div>
            </div>
          </div>

          {/* Live Stats */}
          <div style={{ ...card, padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.82rem', fontWeight: 700, color: isDark ? '#9ca3af' : '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 0.875rem' }}>Live Stats</h3>
            {[
              { label: 'Total Tasks',   value: tasks.length, color: '#6366f1' },
              { label: 'In Progress',   value: inProg, color: '#f59e0b' },
              { label: 'Completed',     value: doneTasks, color: '#10b981' },
              { label: 'High Risk',     value: highRisk, color: '#ef4444' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', marginBottom: '0.5rem', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'}` }}>
                <span style={{ fontSize: '0.8rem', color: isDark ? '#9ca3af' : '#6b7280' }}>{s.label}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div style={{ ...card, padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.82rem', fontWeight: 700, color: isDark ? '#9ca3af' : '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 0.875rem' }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { label: '✨ Run AI Audit',        action: handleRunAudit },
                { label: '📋 View Kanban Board',   action: () => navigate(`/projects/${projectId}`) },
                { label: '📊 View Reports',        action: () => navigate('/reports') },
              ].map(btn => (
                <button key={btn.label} onClick={btn.action}
                  style={{
                    padding: '0.6rem 0.875rem', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600,
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb'}`,
                    background: isDark ? 'rgba(255,255,255,0.04)' : '#f9fafb',
                    color: isDark ? '#d1d5db' : '#374151', cursor: 'pointer', textAlign: 'left'
                  }}
                >{btn.label}</button>
              ))}
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes fade { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        @keyframes chatPulse { 0%,100% { opacity: 0.3; } 50% { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default AiReviewPage;
