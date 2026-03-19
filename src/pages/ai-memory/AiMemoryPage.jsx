import { useTheme } from '../../context/ThemeContext';

/* ══════════════════════════════════════════════════════
   AI MEMORY (AiMemoryPage)
══════════════════════════════════════════════════════ */
const AiMemoryPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const events = [
    {
      id: 1,
      status: 'active',
      agent: 'System',
      title: 'Workflow Triggered',
      desc: 'Automated operational workflow A0B7 has been initiated based on real-time sensor telemetry.',
      time: 'Just now',
      icon: '⚡',
      color: '#3b82f6'
    },
    {
      id: 2,
      status: 'accepted',
      agent: 'Decision Agent',
      title: 'Decision Recommendation Accepted',
      desc: 'Budget reallocation recommendation for Q3 marketing sprint has been approved and committed.',
      time: '28 mins ago',
      icon: '✓',
      color: '#10b981'
    },
    {
      id: 3,
      status: 'success',
      agent: 'Reviewer',
      title: 'Review Performed',
      desc: 'Compliance check on the latest architecture proposal passed with 98% confidence score.',
      time: '45 mins ago',
      icon: '🛡️',
      color: '#8b5cf6'
    },
    {
      id: 4,
      status: 'warning',
      agent: 'Planner',
      title: 'Tasks Created',
      desc: 'Generated 12 new user tasks for the "Infrastructure Scaling" milestone based on the approved plan.',
      time: '1 hour ago',
      icon: '📝',
      color: '#f59e0b'
    }
  ];

  /* ── Styles ────────────────────────────────────── */
  const cardStyle = {
    background: isDark ? 'rgba(31, 41, 55, 0.4)' : 'rgba(255, 255, 255, 0.6)',
    backdropFilter: 'blur(8px)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}`,
    borderRadius: '16px',
    padding: '1.25rem',
    boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.2)' : '0 4px 12px rgba(0,0,0,0.03)',
    marginBottom: '1rem',
    position: 'relative',
    transition: 'all 0.2s',
  };

  const gradientHeader = {
    background: isDark 
      ? 'linear-gradient(135deg, #4b5563 0%, #1f2937 100%)' 
      : 'linear-gradient(135deg, #94a3b8 0%, #475569 100%)',
    padding: '2rem',
    borderRadius: '20px',
    color: '#fff',
    marginBottom: '2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
  };

  return (
    <div style={{ animation: 'memoryFadeIn 0.4s ease-out' }}>
      
      {/* ── Header ────────────────────────────────── */}
      <div style={gradientHeader}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>AI Project Memory</h1>
          <p style={{ fontSize: '0.85rem', opacity: 0.8 }}>Chronological audit trail of all AI-driven decisions and actions.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button style={{
            padding: '0.5rem 1rem', borderRadius: '8px', 
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer'
          }}>Filter Logs</button>
          <button style={{
            padding: '0.5rem 1rem', borderRadius: '8px',
            background: '#fff', color: '#1e293b', border: 'none',
            fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer'
          }}>Export PDF</button>
        </div>
      </div>

      {/* ── Timeline ──────────────────────────────── */}
      <div style={{ position: 'relative', paddingLeft: '2.5rem', marginTop: '1.5rem' }}>
        {/* Timeline vertical line */}
        <div style={{ 
          position: 'absolute', left: '0.75rem', top: 0, bottom: 0, 
          width: '2px', background: isDark ? '#374151' : '#e2e8f0',
          borderRadius: '1px'
        }} />
        
        {events.map((event, i) => (
          <div key={event.id} style={{ position: 'relative', marginBottom: '2.5rem' }}>
            {/* Timeline Dot/Icon */}
            <div style={{ 
              position: 'absolute', left: '-2.5rem', top: '0.25rem',
              width: '40px', height: '40px', borderRadius: '50%',
              background: isDark ? '#111827' : '#fff',
              border: `2px solid ${event.color}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 2,
              boxShadow: `0 0 15px ${event.color}30`
            }}>
              <span style={{ fontSize: '1.2rem' }}>{event.icon}</span>
            </div>

            {/* Event Card */}
            <div style={cardStyle} onMouseEnter={e => e.currentTarget.style.transform = 'translateX(8px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                 <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ 
                      fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', 
                      background: `${event.color}15`, color: event.color, 
                      padding: '0.2rem 0.5rem', borderRadius: '4px', letterSpacing: '0.05em'
                    }}>{event.status}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isDark ? '#9ca3af' : '#64748b' }}>
                      Agent: <strong style={{color: isDark ? '#f3f4f6' : '#1e293b'}}>{event.agent}</strong>
                    </span>
                 </div>
                 <span style={{ fontSize: '0.72rem', color: isDark ? '#6b7280' : '#94a3b8' }}>{event.time}</span>
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: isDark ? '#f9fafb' : '#111827', marginBottom: '0.4rem' }}>{event.title}</h3>
              <p style={{ fontSize: '0.85rem', color: isDark ? '#9ca3af' : '#4b5563', lineHeight: 1.5 }}>{event.desc}</p>
            </div>
          </div>
        ))}

        <div style={{ textAlign: 'center', paddingTop: '1rem' }}>
          <button style={{
            padding: '0.75rem 2rem', background: 'none', 
            border: `1px solid ${isDark ? '#374151' : '#e2e8f0'}`,
            color: isDark ? '#9ca3af' : '#64748b',
            borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.2s'
          }} onMouseEnter={e => e.currentTarget.style.background = isDark ? '#1f2937' : '#f8fafc'}>
            Load Earlier Activity
          </button>
        </div>
      </div>

      <style>{`
        @keyframes memoryFadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default AiMemoryPage;
