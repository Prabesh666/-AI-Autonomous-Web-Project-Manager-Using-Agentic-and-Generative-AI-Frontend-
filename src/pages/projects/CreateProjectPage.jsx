import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { createProject } from '../../api/projects';
import { runAgent } from '../../api/agents';
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
  const { user } = useContext(AuthContext);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [error, setError] = useState('');

  /* ── Generate handler ────────────────────────────── */
  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError('');

    try {
      /* Step 1: create the project */
      setStatusText('Creating project...');
      const project = await createProject({
        name: prompt.slice(0, 80),
        description: prompt,
        created_by: user?.email,
      });

      const projectId = project?.id || project?._id || project?.project?.id;

      /* Step 2: run AI agent to generate milestones + tasks */
      setStatusText('AI is generating milestones and tasks...');
      await runAgent('project_plan', {
        projectId,
        prompt,
      });

      setStatusText('Done! Redirecting...');
      setTimeout(() => {
        navigate(projectId ? `/projects/${projectId}` : '/projects');
      }, 600);

    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || err.message || 'Failed to generate project. Please try again.');
      setIsGenerating(false);
      setStatusText('');
    }
  };

  const handleCancel = () => {
    setIsGenerating(false);
    setStatusText('');
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

          {/* Status text while generating */}
          {isGenerating && statusText && (
            <p className="status-message">
              <span className="pulse-dot" /> {statusText}
            </p>
          )}

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
