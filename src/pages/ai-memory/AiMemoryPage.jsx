import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { fetchAuditLogs } from '../../api/audit';

/* ── helpers ─────────────────────────────────────── */
const RESOURCE_META = {
  Project:  { icon: '📁', color: '#6366f1', label: 'Project' },
  Task:     { icon: '✅', color: '#10b981', label: 'Task' },
  Agent:    { icon: '⚡', color: '#f59e0b', label: 'AI Agent' },
  Job:      { icon: '🤖', color: '#8b5cf6', label: 'AI Job' },
  Report:   { icon: '📊', color: '#3b82f6', label: 'Report' },
  Risk:     { icon: '🛡️', color: '#ef4444', label: 'Risk' },
  User:     { icon: '👤', color: '#06b6d4', label: 'User' },
  Auth:     { icon: '🔑', color: '#84cc16', label: 'Auth' },
  default:  { icon: '🔄', color: '#9ca3af', label: 'System' },
};

const getMeta = (resource = '') => {
  const key = Object.keys(RESOURCE_META).find(k => resource.toLowerCase().includes(k.toLowerCase()));
  return RESOURCE_META[key] || RESOURCE_META.default;
};

const actionLabel = (action = '') =>
  action.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const ALL_FILTER = 'All';

/* ══════════════════════════════════════════════════ */
const AiMemoryPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const [logs,       setLogs]       = useState([]);
  const [total,      setTotal]      = useState(0);
  const [page,       setPage]       = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [filter,     setFilter]     = useState(ALL_FILTER);
  const [search,     setSearch]     = useState('');
  const LIMIT = 20;

  const load = useCallback(async (pg = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetchAuditLogs({ page: pg, limit: LIMIT });
      const data = res?.data || res;
      setLogs(data.logs || []);
      setTotal(data.total || 0);
      setPage(pg);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(1); }, [load]);

  /* derived */
  const resources = [ALL_FILTER, ...new Set(logs.map(l => getMeta(l.resource).label))];
  const filtered  = logs.filter(l => {
    const meta    = getMeta(l.resource);
    const matchF  = filter === ALL_FILTER || meta.label === filter;
    const matchS  = !search || l.action.toLowerCase().includes(search.toLowerCase()) || l.resource.toLowerCase().includes(search.toLowerCase());
    return matchF && matchS;
  });

  /* ── styles ───────────────────────────────────── */
  const textPri = isDark ? '#f9fafb' : '#111827';
  const textSec = isDark ? '#9ca3af' : '#6b7280';
  const cardBg  = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff';
  const border  = isDark ? 'rgba(255,255,255,0.07)' : '#e5e7eb';

  return (
    <div style={{ paddingBottom: '3rem', animation: 'fadeUp .35s ease' }}>

      {/* ── Header ───────────────────────────────── */}
      <div style={{
        background: isDark
          ? 'linear-gradient(135deg,#1e293b 0%,#0f172a 100%)'
          : 'linear-gradient(135deg,#1e293b 0%,#334155 100%)',
        borderRadius: 20, padding: '1.75rem 2rem', marginBottom: '1.75rem',
        color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '1rem',
        boxShadow: '0 10px 32px rgba(0,0,0,0.25)'
      }}>
        {/* glow blobs */}
        <div style={{ position: 'absolute', right: 60, top: -20, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle,rgba(99,102,241,0.15) 0%,transparent 70%)', pointerEvents: 'none' }} />

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <span style={{ background: 'rgba(255,255,255,0.12)', padding: '0.35rem', borderRadius: 8, fontSize: '1rem' }}>🧠</span>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', opacity: 0.7 }}>Autonomous Audit Trail</span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0, letterSpacing: -0.3 }}>AI Project Memory</h1>
          <p style={{ fontSize: '0.82rem', opacity: 0.8, margin: '0.35rem 0 0' }}>
            Chronological log of all AI decisions, agent executions, and system mutations.
            {total > 0 && <strong style={{ marginLeft: 6, opacity: 1 }}>{total} total entries</strong>}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => load(1)}
            style={{
              padding: '0.55rem 1.1rem', borderRadius: 10, fontSize: '0.82rem', fontWeight: 700,
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff', cursor: 'pointer'
            }}
          >
            ↻ Refresh
          </button>
          <button
            onClick={() => navigate('/ai-planning')}
            style={{
              padding: '0.55rem 1.1rem', borderRadius: 10, fontSize: '0.82rem', fontWeight: 700,
              background: 'rgba(255,255,255,0.9)', border: 'none',
              color: '#1e293b', cursor: 'pointer'
            }}
          >
            ⚡ Run AI Pipeline
          </button>
        </div>
      </div>

      {/* ── Filters ──────────────────────────────── */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search actions..."
          style={{
            padding: '0.55rem 1rem', borderRadius: 10, fontSize: '0.82rem',
            background: cardBg, border: `1px solid ${border}`,
            color: textPri, outline: 'none', minWidth: 200
          }}
        />
        {/* Resource chips */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {resources.map(r => (
            <button
              key={r}
              onClick={() => setFilter(r)}
              style={{
                padding: '0.35rem 0.875rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600,
                border: `1px solid ${filter === r ? '#6366f1' : border}`,
                background: filter === r ? (isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.08)') : cardBg,
                color: filter === r ? '#6366f1' : textSec, cursor: 'pointer', transition: 'all 0.15s'
              }}
            >{r}</button>
          ))}
        </div>

        <span style={{ fontSize: '0.78rem', color: textSec, marginLeft: 'auto' }}>
          {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
        </span>
      </div>

      {/* ── Content ──────────────────────────────── */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 40, height: 40, border: `3px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}`, borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <span style={{ fontSize: '0.82rem', color: textSec }}>Loading audit trail...</span>
          </div>
        </div>
      ) : error ? (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 14, padding: '1.5rem', textAlign: 'center' }}>
          <p style={{ color: '#ef4444', fontSize: '0.875rem', margin: 0 }}>⚠️ {error}</p>
          <button onClick={() => load(1)} style={{ marginTop: '1rem', padding: '0.5rem 1.25rem', borderRadius: 8, background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem' }}>Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background: cardBg, border: `2px dashed ${border}`, borderRadius: 18, padding: '3.5rem 2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🧠</div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: textPri, margin: '0 0 0.5rem' }}>
            {search || filter !== ALL_FILTER ? 'No matching entries' : 'Memory is Empty'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: textSec, maxWidth: 380, margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
            {search || filter !== ALL_FILTER
              ? 'Try adjusting your search or filters.'
              : 'No AI activity logged yet. Run an agent to start populating the audit trail.'}
          </p>
          {(!search && filter === ALL_FILTER) && (
            <button
              onClick={() => navigate('/ai-planning')}
              style={{ padding: '0.65rem 1.5rem', borderRadius: 10, fontWeight: 700, fontSize: '0.85rem', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', cursor: 'pointer' }}
            >
              Go to AI Planning →
            </button>
          )}
        </div>
      ) : (
        /* ── Timeline ──────────────────────────────── */
        <div style={{ position: 'relative' }}>
          {/* Vertical line */}
          <div style={{
            position: 'absolute', left: 23, top: 24, bottom: 24, width: 2,
            background: isDark ? 'rgba(255,255,255,0.06)' : '#e5e7eb', borderRadius: 2
          }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filtered.map((log, i) => {
              const meta  = getMeta(log.resource);
              const isAI  = ['Agent', 'AI Agent', 'AI Job', 'Job'].includes(meta.label);
              return (
                <div key={log._id || i} style={{ display: 'flex', gap: '1rem', animation: `fadeUp ${0.05 * i + 0.1}s ease both` }}>
                  {/* Dot */}
                  <div style={{
                    flexShrink: 0, width: 48, height: 48, borderRadius: '50%',
                    background: isDark ? '#1e293b' : '#f8fafc',
                    border: `2px solid ${meta.color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.1rem', position: 'relative', zIndex: 1,
                    boxShadow: `0 0 0 4px ${isDark ? '#0f172a' : '#f8fafc'}`
                  }}>
                    {meta.icon}
                  </div>

                  {/* Card */}
                  <div style={{
                    flex: 1, background: cardBg,
                    border: `1px solid ${isAI ? `${meta.color}40` : border}`,
                    borderRadius: 14, padding: '0.875rem 1.1rem',
                    boxShadow: isAI ? `0 0 16px ${meta.color}15` : 'none',
                    transition: 'box-shadow 0.2s'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: '0.68rem', fontWeight: 700, padding: '0.15rem 0.55rem',
                          borderRadius: 20, background: `${meta.color}18`, color: meta.color,
                          textTransform: 'uppercase', letterSpacing: 0.5
                        }}>
                          {meta.label}
                        </span>
                        {isAI && (
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 20, background: 'rgba(99,102,241,0.12)', color: '#6366f1' }}>
                            🤖 AI
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: textSec, flexShrink: 0 }}>
                        {timeAgo(log.createdAt)}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: textPri, margin: '0.4rem 0 0.25rem' }}>
                      {actionLabel(log.action)}
                    </h3>

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', color: textSec }}>
                        Resource: <code style={{ fontSize: '0.72rem', background: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9', padding: '0.1rem 0.35rem', borderRadius: 4, color: textPri }}>{log.resource}</code>
                      </span>
                      {log.resourceId && (
                        <span style={{ fontSize: '0.75rem', color: textSec }}>
                          ID: <code style={{ fontSize: '0.68rem', background: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9', padding: '0.1rem 0.35rem', borderRadius: 4, color: textSec, fontFamily: 'monospace' }}>
                            {String(log.resourceId).substring(0, 16)}…
                          </code>
                        </span>
                      )}
                    </div>

                    {/* Metadata preview */}
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <details style={{ marginTop: '0.5rem' }}>
                        <summary style={{ fontSize: '0.72rem', color: textSec, cursor: 'pointer', userSelect: 'none' }}>
                          View metadata
                        </summary>
                        <pre style={{
                          marginTop: '0.35rem', fontSize: '0.72rem', color: isDark ? '#10b981' : '#059669',
                          background: isDark ? '#0f172a' : '#f0fdf4',
                          padding: '0.5rem 0.75rem', borderRadius: 8, overflowX: 'auto',
                          maxHeight: 120, whiteSpace: 'pre-wrap', wordBreak: 'break-all'
                        }}>
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {total > LIMIT && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '2rem', alignItems: 'center' }}>
              <button
                onClick={() => load(page - 1)}
                disabled={page === 1}
                style={{
                  padding: '0.5rem 1.25rem', borderRadius: 10, fontWeight: 600, fontSize: '0.82rem',
                  background: cardBg, border: `1px solid ${border}`, color: page === 1 ? textSec : textPri,
                  cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1
                }}
              >← Previous</button>
              <span style={{ fontSize: '0.8rem', color: textSec }}>
                Page {page} of {Math.ceil(total / LIMIT)}
              </span>
              <button
                onClick={() => load(page + 1)}
                disabled={page * LIMIT >= total}
                style={{
                  padding: '0.5rem 1.25rem', borderRadius: 10, fontWeight: 600, fontSize: '0.82rem',
                  background: cardBg, border: `1px solid ${border}`, color: page * LIMIT >= total ? textSec : textPri,
                  cursor: page * LIMIT >= total ? 'not-allowed' : 'pointer', opacity: page * LIMIT >= total ? 0.5 : 1
                }}
              >Next →</button>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin   { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default AiMemoryPage;
