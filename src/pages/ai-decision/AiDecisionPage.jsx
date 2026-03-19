import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

/* ══════════════════════════════════════════════════════
   AI DECISION AGENT (AiDecisionPage)
══════════════════════════════════════════════════════ */
const AiDecisionPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const alternatives = [
    {
      id: 1,
      title: "Delay non-critical bug fixes",
      desc: "Focus exclusively on feature parity for the upcoming release. Postpone 12 minor bugs to Sprint 5.",
      probability: "82%",
      tag: "LOW RISK",
      color: '#3b82f6'
    },
    {
      id: 2,
      title: "Add automated QA tests",
      desc: "Integrate Playwright tests for critical paths now to save 40+ hours in manual testing phase.",
      probability: "75%",
      tag: "HIGH EFFORT",
      color: '#8b5cf6'
    },
    {
      id: 3,
      title: "Extend sprint by 2 days",
      desc: "Push the sprint end date by 48 hours to ensure zero debt handover of the API documentation.",
      probability: "60%",
      tag: "MEDIUM RISK",
      color: '#f59e0b'
    }
  ];

  /* ── Styles ────────────────────────────────────── */
  const cardStyle = {
    background: isDark ? 'rgba(31, 41, 55, 0.6)' : 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}`,
    borderRadius: '20px',
    padding: '1.5rem',
    boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 24px rgba(0,0,0,0.04)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const heroStyle = {
    background: isDark 
      ? 'linear-gradient(135deg, #1e40af 0%, #1e1b4b 100%)' 
      : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    padding: '3rem 2.5rem',
    borderRadius: '24px',
    color: '#fff',
    marginBottom: '2.5rem',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 20px 50px rgba(37, 99, 235, 0.3)',
    display: 'flex',
    alignItems: 'center',
    gap: '3rem',
    flexWrap: 'wrap',
    animation: 'heroSlideUp 0.6s ease-out',
  };

  const badgeStyle = (type) => ({
    padding: '0.4rem 0.8rem',
    background: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '100px',
    fontSize: '0.75rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#fff',
  });

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out', paddingBottom: '3rem' }}>
      
      {/* ── Recommendation Hero ✨ ────────────────── */}
      <div style={heroStyle}>
        <div style={{ flex: 1, minWidth: '300px', zIndex: 2 }}>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <span style={badgeStyle()}>✨ AI Recommended Action</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginTop: '0.4rem' }}>Updated 2m ago</span>
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Reallocate Backend Resources to Sprint 4
          </h1>
          <p style={{ fontSize: '1.15rem', opacity: 0.9, lineHeight: 1.6, marginBottom: '2rem', maxWidth: '650px' }}>
            Sprinting towards the Alpha release? Shifting two developers from the maintenance backlog will reduce release risk by 18% with minimal downstream impact.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button style={{
              padding: '1rem 2rem',
              background: '#fff',
              color: '#2563eb',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s',
            }}>Accept Recommendation</button>
            <button style={{
              padding: '1rem 1.5rem',
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff',
              borderRadius: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
            }}>Ask AI Why?</button>
          </div>
        </div>

        {/* Confidence Meter */}
        <div style={{ width: '220px', height: '220px', position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
           <div style={{ 
             width: '180px', height: '180px', borderRadius: '50%', 
             border: '10px solid rgba(255,255,255,0.1)', 
             borderTopColor: '#fff',
             display: 'flex', alignItems: 'center', justifyContent: 'center',
             flexDirection: 'column',
             animation: 'spinMeter 2s ease-out forwards'
           }}>
             <span style={{ fontSize: '3rem', fontWeight: 900 }}>94%</span>
             <span style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.8, textTransform: 'uppercase' }}>Confidence</span>
           </div>
        </div>

        {/* Animated Background Orbs */}
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-20%', left: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      {/* ── Alternatives Section ──────────────────── */}
      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: isDark ? '#fff' : '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ color: '#3b82f6' }}>⌥</span> Alternative Strategies
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {alternatives.map(alt => (
          <div key={alt.id} style={cardStyle} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-6px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${alt.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: alt.color }}>
                {alt.id === 1 ? '🎯' : alt.id === 2 ? '⚙️' : '⏱️'}
              </div>
              <span style={{ 
                padding: '0.35rem 0.75rem', borderRadius: '6px', background: `${alt.color}10`, color: alt.color, fontSize: '0.72rem', fontWeight: 800 
              }}>{alt.tag}</span>
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: isDark ? '#f9fafb' : '#1e293b', marginBottom: '0.5rem' }}>{alt.title}</h3>
            <p style={{ fontSize: '0.88rem', color: isDark ? '#9ca3af' : '#64748b', lineHeight: 1.6, marginBottom: '1.5rem' }}>{alt.desc}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: `1px solid ${isDark ? '#374151' : '#f1f5f9'}` }}>
               <span style={{ fontSize: '0.8rem', fontWeight: 600, color: isDark ? '#6b7280' : '#94a3b8' }}>Success Probability</span>
               <span style={{ fontSize: '1rem', fontWeight: 800, color: alt.color }}>{alt.probability}</span>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes heroSlideUp { 
          from { opacity: 0; transform: translateY(30px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        @keyframes spinMeter {
          from { transform: rotate(-90deg); opacity: 0; }
          to { transform: rotate(0deg); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default AiDecisionPage;
