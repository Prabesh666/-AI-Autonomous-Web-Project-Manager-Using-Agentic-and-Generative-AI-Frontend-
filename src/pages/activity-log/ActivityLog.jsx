import { useState, useEffect, useCallback } from 'react';
import { fetchAuditLogs } from '../../api/audit';
import { useTheme } from '../../context/ThemeContext';
import './ActivityLog.css';

/* ── Icon helpers ─────────────────────────────────────────── */
const actionMeta = (action = '') => {
  const a = action.toLowerCase();
  if (a.includes('create'))  return { icon: '✚', color: '#10b981', bg: 'rgba(16,185,129,0.12)', badge: 'Created',  badgeClass: 'success' };
  if (a.includes('update') || a.includes('edit')) return { icon: '✎', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', badge: 'Updated', badgeClass: 'info' };
  if (a.includes('delete') || a.includes('remove')) return { icon: '✕', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', badge: 'Deleted', badgeClass: 'danger' };
  if (a.includes('login') || a.includes('auth'))   return { icon: '🔑', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', badge: 'Auth',    badgeClass: 'warning' };
  if (a.includes('ai') || a.includes('agent'))     return { icon: '⚡', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', badge: 'AI Run',  badgeClass: 'ai' };
  return { icon: '●', color: '#9ca3af', bg: 'rgba(156,163,175,0.1)', badge: null, badgeClass: '' };
};

const formatTime = (iso) => {
  const d = new Date(iso);
  return {
    primary: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    secondary: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  };
};

/* ── Component ────────────────────────────────────────────── */
const ActivityLog = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('all');
  const [page, setPage]       = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const loadLogs = useCallback(async (pageNum = 1, append = false) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetchAuditLogs({ page: pageNum, limit: 50 });
      const data = resp?.data || resp;
      const fetched = data?.logs || [];
      const total   = data?.total || 0;
      setLogs(prev => append ? [...prev, ...fetched] : fetched);
      setHasMore(pageNum * 50 < total);
    } catch (err) {
      setError(err.message || 'Failed to load activity log');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadLogs(1); }, [loadLogs]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadLogs(nextPage, true);
  };

  /* Filtering */
  const filtered = logs.filter(log => {
    const matchSearch = !search ||
      log.action?.toLowerCase().includes(search.toLowerCase()) ||
      log.resource?.toLowerCase().includes(search.toLowerCase());

    const matchFilter = filter === 'all' || log.action?.toLowerCase().includes(filter);
    return matchSearch && matchFilter;
  });

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };
  const selectAll = selectedIds.length === filtered.length && filtered.length > 0;
  const toggleAll = () => setSelectedIds(selectAll ? [] : filtered.map(l => l._id));

  /* ── Styles ─────────────────────────────────────────────── */
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff';
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb';
  const textPrimary = isDark ? '#f9fafb' : '#111827';
  const textSecondary = isDark ? '#9ca3af' : '#6b7280';

  const filters = ['all','create','update','delete','ai','auth'];

  return (
    <div style={{ padding: '1.5rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: textPrimary, margin: 0 }}>
            Workflow Activity Log
          </h1>
          <p style={{ fontSize: '0.85rem', color: textSecondary, marginTop: '0.3rem' }}>
            Real-time monitoring of system and user events
          </p>
        </div>
        <button
          onClick={() => loadLogs(1)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600,
            border: `1px solid ${borderColor}`, background: cardBg, color: textSecondary,
            cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Filter Pills */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.78rem',
              fontWeight: 600, textTransform: 'capitalize', cursor: 'pointer',
              border: `1px solid ${filter === f ? '#3b82f6' : borderColor}`,
              background: filter === f ? 'rgba(59,130,246,0.12)' : cardBg,
              color: filter === f ? '#3b82f6' : textSecondary,
              transition: 'all 0.2s'
            }}
          >
            {f === 'all' ? 'All Events' : f}
          </button>
        ))}
      </div>

      {/* Main Card */}
      <div style={{
        background: cardBg,
        border: `1px solid ${borderColor}`,
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 4px 24px rgba(0,0,0,0.06)'
      }}>
        {/* Toolbar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '0.875rem 1.25rem',
          borderBottom: `1px solid ${borderColor}`,
          background: isDark ? 'rgba(255,255,255,0.02)' : '#f9fafb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={selectAll} onChange={toggleAll} style={{ width: 15, height: 15, accentColor: '#3b82f6' }} />
              <span style={{ fontSize: '0.8rem', color: textSecondary, fontWeight: 500 }}>Select All</span>
            </label>
            {selectedIds.length > 0 && (
              <span style={{ fontSize: '0.78rem', color: '#3b82f6', fontWeight: 600 }}>
                {selectedIds.length} selected
              </span>
            )}
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6',
            borderRadius: '8px', padding: '0.4rem 0.75rem', border: `1px solid ${borderColor}`
          }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={textSecondary}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search events…"
              style={{
                background: 'none', border: 'none', outline: 'none',
                fontSize: '0.82rem', color: textPrimary, width: '180px'
              }}
            />
          </div>
        </div>

        {/* Log List */}
        {loading && logs.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              border: '3px solid rgba(59,130,246,0.2)',
              borderTopColor: '#3b82f6',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto'
            }} />
            <p style={{ color: textSecondary, marginTop: '1rem', fontSize: '0.85rem' }}>Loading activity log…</p>
          </div>
        ) : error ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: '#ef4444', fontWeight: 600 }}>Failed to load logs</p>
            <p style={{ color: textSecondary, fontSize: '0.82rem', margin: '0.5rem 0 1rem' }}>{error}</p>
            <button onClick={() => loadLogs(1)} style={{
              padding: '0.5rem 1.25rem', background: '#3b82f6', color: '#fff',
              border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem'
            }}>Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke={textSecondary} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.4 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p style={{ color: textSecondary, fontSize: '0.9rem' }}>
              {search ? `No events matching "${search}"` : 'No activity recorded yet.'}
            </p>
            <p style={{ color: textSecondary, fontSize: '0.8rem', marginTop: '0.5rem', opacity: 0.7 }}>
              Actions like creating projects and running agents will appear here.
            </p>
          </div>
        ) : (
          filtered.map((log, idx) => {
            const meta = actionMeta(log.action);
            const time = formatTime(log.createdAt);
            const isSelected = selectedIds.includes(log._id);

            return (
              <div
                key={log._id || idx}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.875rem 1.25rem',
                  borderBottom: idx < filtered.length - 1 ? `1px solid ${borderColor}` : 'none',
                  background: isSelected
                    ? (isDark ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.04)')
                    : 'transparent',
                  transition: 'background 0.15s',
                  cursor: 'default'
                }}
              >
                {/* Left */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(log._id)}
                    style={{ width: 15, height: 15, accentColor: '#3b82f6', flexShrink: 0 }}
                  />
                  {/* Icon */}
                  <div style={{
                    width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
                    background: meta.bg, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '1rem', color: meta.color,
                    fontWeight: 700
                  }}>
                    {meta.icon}
                  </div>
                  {/* Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: textPrimary, textTransform: 'capitalize' }}>
                        {log.action}
                      </span>
                      {meta.badge && (
                        <span style={{
                          fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem',
                          borderRadius: '20px', background: meta.bg, color: meta.color
                        }}>
                          {meta.badge}
                        </span>
                      )}
                      <span style={{ fontSize: '0.75rem', color: textSecondary }}>
                        on <strong style={{ color: isDark ? '#d1d5db' : '#374151' }}>{log.resource}</strong>
                      </span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: textSecondary, margin: '0.2rem 0 0', lineHeight: 1.4 }}>
                      {log.metadata?.method} {log.metadata?.url}
                      {log.traceId && <span style={{ opacity: 0.5, marginLeft: '0.5rem' }}>· {log.traceId.substring(0, 8)}…</span>}
                    </p>
                  </div>
                </div>

                {/* Right */}
                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '1rem' }}>
                  <p style={{ fontSize: '0.78rem', fontWeight: 600, color: textPrimary, margin: 0 }}>{time.primary}</p>
                  <p style={{ fontSize: '0.73rem', color: textSecondary, margin: '0.1rem 0 0' }}>{time.secondary}</p>
                </div>
              </div>
            );
          })
        )}

        {/* Footer */}
        {hasMore && !loading && (
          <div style={{ padding: '1rem', textAlign: 'center', borderTop: `1px solid ${borderColor}` }}>
            <button
              onClick={loadMore}
              style={{
                padding: '0.6rem 1.5rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600,
                border: `1px solid ${borderColor}`, background: cardBg, color: textSecondary, cursor: 'pointer'
              }}
            >
              Load older activity
            </button>
          </div>
        )}
      </div>

      {/* Summary bar */}
      {!loading && filtered.length > 0 && (
        <p style={{ fontSize: '0.75rem', color: textSecondary, textAlign: 'center', marginTop: '1rem' }}>
          Showing {filtered.length} event{filtered.length !== 1 ? 's' : ''}
          {search ? ` matching "${search}"` : ''}
        </p>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default ActivityLog;
