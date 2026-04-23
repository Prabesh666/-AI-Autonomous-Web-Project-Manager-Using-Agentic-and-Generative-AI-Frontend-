import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { createProject } from '../../api/projects';
import { runAgent, getAgentJobStatus } from '../../api/agents';
import './CreateProjectPage.css';

/* ── Template prompts ──────────────────────────────── */
const TEMPLATES = [
  { label: '💻 Web App', prompt: 'Build a modern web application with user authentication, dashboard, and real-time notifications.' },
  { label: '📱 Mobile App', prompt: 'Create a cross-platform mobile app with push notifications, offline support, and social login.' },
  { label: '🔬 Research Project', prompt: 'Set up a research project with literature review milestones, data collection phases, and analysis tasks.' },
  { label: '🛒 E-commerce', prompt: 'Build an e-commerce platform with product catalog, cart system, payment integration, and order tracking.' },
];

/* ── Gear illustration SVG ─────────────────────────── */
const GearIllustration = ({ isDark }) => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="80" height="80" rx="20" fill={isDark ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.08)'} />
    <path d="M40 28a2 2 0 012 2v2.06a8.94 8.94 0 013.29 1.36l1.46-1.46a2 2 0 012.83 2.83l-1.46 1.46A8.94 8.94 0 0149.48 40H51.5a2 2 0 010 4h-2.06a8.94 8.94 0 01-1.36 3.29l1.46 1.46a2 2 0 01-2.83 2.83l-1.46-1.46A8.94 8.94 0 0142 51.48V53.5a2 2 0 01-4 0v-2.06a8.94 8.94 0 01-3.29-1.36l-1.46 1.46a2 2 0 01-2.83-2.83l1.46-1.46A8.94 8.94 0 0130.52 44H28.5a2 2 0 010-4h2.06a8.94 8.94 0 011.36-3.29l-1.46-1.46a2 2 0 012.83-2.83l1.46 1.46A8.94 8.94 0 0138 32.52V30a2 2 0 012-2zm0 10a4 4 0 100 8 4 4 0 000-8z"
      fill={isDark ? '#60a5fa' : '#3b82f6'} opacity="0.85" />
    {/* decorative smaller gear top-right */}
    <path d="M56 20a1 1 0 011 1v1a4.47 4.47 0 011.65.68l.73-.73a1 1 0 011.41 1.41l-.73.73A4.47 4.47 0 0160.74 26H61.75a1 1 0 010 2h-1a4.47 4.47 0 01-.68 1.65l.73.73a1 1 0 01-1.41 1.41l-.73-.73A4.47 4.47 0 0157 31.74v1a1 1 0 01-2 0v-1a4.47 4.47 0 01-1.65-.68l-.73.73a1 1 0 01-1.41-1.41l.73-.73A4.47 4.47 0 0151.26 28h-1a1 1 0 010-2h1a4.47 4.47 0 01.68-1.65l-.73-.73a1 1 0 011.41-1.41l.73.73A4.47 4.47 0 0155 22.26v-1a1 1 0 011-1zm0 5a2 2 0 100 4 2 2 0 000-4z"
      fill={isDark ? '#60a5fa' : '#3b82f6'} opacity="0.4" />
  </svg>
);

/* ════════════════════════════════════════════════════════
   CREATE PROJECT PAGE
════════════════════════════════════════════════════════ */
const CreateProjectPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AppContext);
  const { theme } = useTheme();
  const toast = useToast();
  const isDark = theme === 'dark';

  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState(0); // 0=idle 1=creating 2=AI running 3=done
  const [error, setError] = useState('');

  // step labels
  const STEPS = [
    { label: 'Creating project record...', icon: '📁' },
    { label: 'AI generating tasks & milestones...', icon: '⚡' },
    { label: 'Done! Taking you to your project...', icon: '✅' },
  ];

  /* ── Poll job until done ─────────────────────────── */
  const pollJob = (jobId, interval = 2500, max = 24) =>
    new Promise((resolve, reject) => {
      let attempts = 0;
      const tick = async () => {
        attempts++;
        try {
          const res = await getAgentJobStatus(jobId);
          const job = res?.data || res;
          if (job.status === 'completed') return resolve(job);
          if (job.status === 'failed')    return reject(new Error(job.error?.message || 'AI job failed'));
          if (attempts >= max)            return resolve(job); // timeout — navigate anyway
          setTimeout(tick, interval);
        } catch (e) { reject(e); }
      };
      tick();
    });

  /* ── Generate handler ────────────────────────────── */
  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setStep(1);
    setError('');

    try {
      /* Step 1: create the project */
      const result = await createProject({
        name: prompt.slice(0, 80),
        description: prompt,
        created_by: user?.email,
      });

      const projectData = result?.data || result;
      const projectId   = projectData?._id || projectData?.id;
      if (!projectId) throw new Error('Project created but no ID returned from server.');

      /* Step 2: enqueue AI agent */
      setStep(2);
      const agentRes = await runAgent('planner', projectId, { prompt });
      const jobId    = agentRes?.data?.jobId || agentRes?.jobId;

      if (jobId) {
        /* Step 2b: poll until the job finishes */
        await pollJob(jobId);
      }

      /* Step 3: done */
      setStep(3);
      toast.success('Project plan generated successfully!');
      setTimeout(() => navigate(`/projects/${projectId}`), 800);

    } catch (err) {
      console.error(err);
      const serverData = err?.response?.data;
      const detailedError = Array.isArray(serverData?.errors)
        ? serverData.errors.map(e => e.message).join(', ')
        : serverData?.message || err.message || 'Failed to generate project. Please try again.';
      setError(detailedError);
      toast.error(detailedError);
      setIsGenerating(false);
      setStep(0);
    }
  };

  const handleCancel = () => {
    setIsGenerating(false);
    setStep(0);
    setError('');
  };

  const handleTemplateClick = (templatePrompt) => {
    if (isGenerating) return;
    setPrompt(templatePrompt);
  };

  /* ────────────────────────────────────────────────── */
  return (
    <div className="create-project-wrapper">
      {/* Header */}
      <header className="create-header">
        <div className="breadcrumb">
          <span>Projects</span> / <strong>Create New AI Project</strong>
        </div>
      </header>

      {/* Main content */}
      <div className="creation-container">
        <div className="creation-card">
          {/* Illustration */}
          <div className="icon-header">
            <GearIllustration isDark={isDark} />
          </div>

          <h1 className="creation-title">Describe Your Project Idea</h1>
          <p className="creation-desc">
            Our AI will analyze your prompt to generate a full project structure,
            including milestones, specific tasks, and suggested team roles.
          </p>

          {/* Error */}
          {error && (
            <div className="create-error-alert">
              <span>⚠️ {error}</span>
              <button onClick={() => setError('')}>✕</button>
            </div>
          )}

          {/* Textarea */}
          <div className="prompt-area">
            <textarea
              className="prompt-input"
              placeholder="Example: I want to build a task management web app for students that includes gamification features and calendar integration..."
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              disabled={isGenerating}
              rows={5}
            />
            <div className="prompt-count">
              {prompt.length} / 2000
            </div>
          </div>

          {/* Actions */}
          <div className="action-row">
            <button
              className={`btn-generate ${isGenerating ? 'generating' : ''}`}
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
            >
              {isGenerating ? (
                <>
                  <span className="gen-spinner" />
                  Generating AI Plan...
                </>
              ) : (
                <>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate AI Plan
                </>
              )}
            </button>
            {isGenerating && (
              <button className="btn-cancel" onClick={handleCancel}>Cancel</button>
            )}
          </div>

          {/* Step progress while generating */}
          {isGenerating && (
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {STEPS.map((s, i) => {
                const idx = i + 1;
                const isDone    = step > idx;
                const isActive  = step === idx;
                const isPending = step < idx;
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.6rem 0.875rem', borderRadius: 10,
                    background: isDone ? 'rgba(16,185,129,0.08)' : isActive ? 'rgba(99,102,241,0.08)' : 'transparent',
                    border: `1px solid ${ isDone ? 'rgba(16,185,129,0.2)' : isActive ? 'rgba(99,102,241,0.2)' : 'transparent'}`,
                    transition: 'all 0.3s',
                    opacity: isPending ? 0.4 : 1,
                  }}>
                    <span style={{ fontSize: '1rem' }}>
                      {isDone ? '✅' : isActive ? s.icon : '○'}
                    </span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: isDone ? '#10b981' : isActive ? '#6366f1' : 'inherit' }}>
                      {s.label}
                    </span>
                    {isActive && (
                      <div style={{ marginLeft: 'auto', width: 14, height: 14, border: '2px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

          {/* Quick Templates */}
          <div className="quick-templates">
            <span className="templates-label">QUICK TEMPLATES</span>
            <div className="templates-row">
              {TEMPLATES.map(t => (
                <button
                  key={t.label}
                  className={`template-btn ${prompt === t.prompt ? 'active' : ''}`}
                  onClick={() => handleTemplateClick(t.prompt)}
                  disabled={isGenerating}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="trust-badges">
          <div className="badge-item">
            <div className="badge-icon">🛡️</div>
            <div>
              <strong>Secure Data</strong>
              <p>Your project ideas are encrypted and private.</p>
            </div>
          </div>
          <div className="badge-item">
            <div className="badge-icon">⚡</div>
            <div>
              <strong>Fast Generation</strong>
              <p>Get a complete roadmap in under 30 seconds.</p>
            </div>
          </div>
          <div className="badge-item">
            <div className="badge-icon">🧩</div>
            <div>
              <strong>Smart Integration</strong>
              <p>Syncs automatically with your team calendar.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectPage;
