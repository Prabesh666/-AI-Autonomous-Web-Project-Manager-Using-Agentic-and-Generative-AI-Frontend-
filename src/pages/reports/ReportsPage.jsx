import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useProjects } from '../../hooks/useProjects';
import { createReport, fetchReports } from '../../api/reports';
import { useAgents } from '../../hooks/useAgents';
import { useToast } from '../../context/ToastContext';
import './ReportsPage.css';

/* ── Helpers ───────────────────────────────────────── */
const fmtDate = (d) => {
  try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch { return '—'; }
};

/* ══════════════════════════════════════════════════════
   REPORTS PAGE
══════════════════════════════════════════════════════ */
const ReportsPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  /* ── State ─────────────────────────────────────── */
  const { projects, loading: projectsLoading, loadProjects } = useProjects();
  const [selectedProject, setSelectedProject] = useState('');
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [success, setSuccess] = useState('');
  const [formError, setFormError] = useState('');

  const { executeAgent, pollJobStatus } = useAgents();
  const toast = useToast();

  /* ── Load projects ─────────────────────────────── */
  useEffect(() => { 
    loadProjects(); 
  }, [loadProjects]);

  useEffect(() => {
    if (projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0]._id || projects[0].id);
    }
  }, [projects, selectedProject]);

  /* ── Load reports when project changes ─────────── */
  const loadReports = useCallback(async (pid) => {
    if (!pid) return;
    setReportsLoading(true);
    setError('');
    try {
      const data = await fetchReports(pid);
      const list = Array.isArray(data) ? data
        : Array.isArray(data?.data) ? data.data
        : Array.isArray(data?.reports) ? data.reports
        : Array.isArray(data?.results) ? data.results : [];
      setReports(list);
    } catch (err) {
      setError(err.message || 'Failed to load reports');
      setReports([]);
    } finally {
      setReportsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedProject) loadReports(selectedProject);
  }, [selectedProject, loadReports]);

  /* ── Submit report ─────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(''); setSuccess('');
    if (!title.trim() || !content.trim()) { setFormError('Title and content are required.'); return; }
    if (!selectedProject) { setFormError('Please select a project first.'); return; }

    setSubmitting(true);
    try {
      await createReport({ project: selectedProject, title, content });
      setTitle(''); setContent('');
      setSuccess('Report submitted successfully!');
      loadReports(selectedProject);
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setFormError(err.message || 'Failed to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAiGenerate = async () => {
    if (!selectedProject) {
      toast.error('Please select a project first.');
      return;
    }

    setIsGeneratingAi(true);
    try {
      toast.info('Initializing AI Report Agent...');
      
      const queuedData = await executeAgent('report', selectedProject, { prompt: "Generate a detailed project report summarizing the latest tasks and overall progress." });
      const jobId = queuedData?.data?.jobId || queuedData?.jobId;
      
      if (!jobId) throw new Error("Job orchestration failed to return a tracking ID.");

      toast.info('AI is drafting the report. Please wait...');
      
      // We pass the type 'report' but note the hook's executeAgent/pollJobStatus might use the agent router's output structure
      const completedJob = await pollJobStatus('report', jobId, 2500, 24);
      
      const res = completedJob?.result || {};
      
      // Permissive extraction to handle different backend structures
      let extractedTitle = res?.report?.reportData?.title || res?.reportData?.title || res?.report?.title || res?.title || '';
      let extractedContent = res?.report?.reportData?.content || res?.reportData?.content || res?.report?.content || res?.content || '';

      if (!extractedTitle && !extractedContent && typeof res?.report === 'string') {
        extractedTitle = 'AI Generated Report';
        extractedContent = res.report;
      }
      
      if (extractedTitle) setTitle(extractedTitle);
      if (extractedContent) setContent(extractedContent);
      
      if (extractedTitle || extractedContent) {
        toast.success('AI Report generated successfully!');
        // 🔄 Refresh the report list so the new report appears in history
        loadReports(selectedProject);
      } else {
        throw new Error('AI returned an empty report structure.');
      }
    } catch (err) {
      console.error("AI Report Generation Error:", err?.response?.data || err);
      toast.error(err?.response?.data?.message || err.message || 'Failed to generate AI report.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  /* ── Render ────────────────────────────────────── */
  return (
    <div className="reports-page" style={{ animation: 'rpFadeIn 0.35s ease both' }}>
      {/* Selector moved to the form column below */}

      {/* Two-column layout */}
      <div className="rp-columns">

        {/* ── Left: Create Report Form ────────────── */}
        <div className="rp-form-col">
          <div className="rp-card" style={{
            background: isDark ? '#1f2937' : '#ffffff',
            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
            borderRadius: '16px', padding: '1.5rem',
          }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: isDark ? '#f9fafb' : '#111827', marginBottom: '0.25rem' }}>
              📝 Submit New Report
            </h2>
            <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: '1.25rem' }}>
              Log documentation, meeting notes, or milestone summaries.
            </p>

            {/* 📍 NEW PROJECT SELECTOR LOCATION */}
            <div className="rp-project-select-container" style={{ marginBottom: '1.5rem' }}>
              <label className="rp-label" style={{ color: isDark ? '#d1d5db' : '#374151', marginBottom: '0.5rem', display: 'block' }}>
                Select Target Project <span style={{ color: '#ef4444' }}>*</span>
              </label>
              {projects.length > 0 ? (
                <select
                  value={selectedProject}
                  onChange={e => setSelectedProject(e.target.value)}
                  style={{
                    width: '100%', padding: '0.75rem 1rem', borderRadius: '12px',
                    border: `2px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                    background: isDark ? '#111827' : '#f9fafb',
                    color: isDark ? '#f9fafb' : '#111827',
                    fontSize: '0.9rem', fontWeight: 600,
                    outline: 'none', cursor: 'pointer',
                    transition: 'border-color 0.2s',
                  }}
                >
                  {projects.map(p => (
                    <option key={p._id || p.id} value={p._id || p.id}>{p.name}</option>
                  ))}
                </select>
              ) : (
                <div style={{ padding: '0.75rem', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '0.85rem' }}>
                  ⚠️ No projects found. Please create one in the Dashboard.
                </div>
              )}
            </div>

            {/* Success message */}
            {success && (
              <div className="rp-alert rp-success">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {success}
              </div>
            )}
            {/* Error message */}
            {formError && (
              <div className="rp-alert rp-error">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <label className="rp-label" style={{ color: isDark ? '#d1d5db' : '#374151' }}>
                Report Title <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Q3 Architecture Evaluation"
                className="rp-input"
                style={{
                  background: isDark ? '#111827' : '#f9fafb',
                  border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                  color: isDark ? '#f9fafb' : '#111827',
                }}
              />

              <label className="rp-label" style={{ color: isDark ? '#d1d5db' : '#374151', marginTop: '0.875rem' }}>
                Report Content <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Enter detailed report contents here..."
                rows={6}
                className="rp-textarea"
                style={{
                  background: isDark ? '#111827' : '#f9fafb',
                  border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                  color: isDark ? '#f9fafb' : '#111827',
                }}
              />

              <div className="rp-form-actions">
                <button
                  type="button"
                  onClick={handleAiGenerate}
                  disabled={isGeneratingAi || !selectedProject}
                  className="rp-ai-btn"
                >
                  {isGeneratingAi ? (
                    <><span className="rp-spinner" /> Generating...</>
                  ) : (
                    <><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> AI Generate</>
                  )}
                </button>

                <button
                  type="submit"
                  disabled={submitting || !selectedProject}
                  className="rp-submit-btn"
                >
                  {submitting ? (
                    <><span className="rp-spinner" /> Submitting...</>
                  ) : (
                    <><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> Submit Report</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ── Right: Report History ───────────────── */}
        <div className="rp-history-col">
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: isDark ? '#f9fafb' : '#111827', marginBottom: '1rem', paddingLeft: '0.125rem' }}>
            📋 Recent Reports
          </h2>

          {reportsLoading && reports.length === 0 ? (
            <div className="rp-empty-state" style={{
              background: isDark ? '#1f2937' : '#f9fafb',
              border: `1px dashed ${isDark ? '#374151' : '#d1d5db'}`,
            }}>
              <div className="rp-spinner-lg" />
              <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginTop: '0.75rem' }}>Loading reports...</p>
            </div>
          ) : !selectedProject ? (
            <div className="rp-empty-state" style={{
              background: isDark ? '#1f2937' : '#f9fafb',
              border: `1px dashed ${isDark ? '#374151' : '#d1d5db'}`,
            }}>
              <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="#9ca3af"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginTop: '0.5rem' }}>Select a project to view reports.</p>
            </div>
          ) : error ? (
            <div className="rp-empty-state" style={{
              background: 'rgba(239,68,68,0.05)',
              border: '1px dashed rgba(239,68,68,0.2)',
            }}>
              <p style={{ color: '#ef4444', fontSize: '0.85rem' }}>{error}</p>
              <button onClick={() => loadReports(selectedProject)} style={{
                marginTop: '0.75rem', padding: '0.4rem 1rem', background: '#ef4444',
                color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.78rem', cursor: 'pointer',
              }}>Retry</button>
            </div>
          ) : reports.length === 0 ? (
            <div className="rp-empty-state" style={{
              background: isDark ? '#1f2937' : '#f9fafb',
              border: `1px dashed ${isDark ? '#374151' : '#d1d5db'}`,
            }}>
              <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="#9ca3af"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <h3 style={{ color: isDark ? '#f9fafb' : '#111827', fontSize: '0.9rem', fontWeight: 600, marginTop: '0.5rem' }}>No reports yet</h3>
              <p style={{ color: '#9ca3af', fontSize: '0.78rem', marginTop: '0.25rem' }}>Submit a report using the form on the left.</p>
            </div>
          ) : (
            <div className="rp-report-list">
              {reports.map(report => (
                <div key={report._id || report.id} className="rp-report-card" style={{
                  background: isDark ? '#1f2937' : '#ffffff',
                  border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.375rem' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: isDark ? '#f9fafb' : '#111827' }}>
                      {report.title}
                    </h3>
                    <span style={{
                      padding: '0.15rem 0.5rem', borderRadius: '8px',
                      fontSize: '0.68rem', fontWeight: 600,
                      background: isDark ? '#374151' : '#f3f4f6',
                      color: isDark ? '#d1d5db' : '#6b7280',
                      whiteSpace: 'nowrap', flexShrink: 0,
                    }}>
                      {fmtDate(report.createdAt)}
                    </span>
                  </div>
                  <p style={{
                    fontSize: '0.82rem', color: isDark ? '#9ca3af' : '#6b7280',
                    lineHeight: 1.6, whiteSpace: 'pre-wrap',
                    display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {report.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
