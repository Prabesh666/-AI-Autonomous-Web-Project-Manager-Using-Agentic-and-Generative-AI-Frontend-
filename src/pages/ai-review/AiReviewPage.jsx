import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import useAiAgent from '../../features/ai/agentHooks';

/* ══════════════════════════════════════════════════════
   AI REVIEW PAGE (AiReviewPage)
══════════════════════════════════════════════════════ */
const AiReviewPage = () => {
  const { projectId } = useParams();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { runPipeline, isProcessing, result, error } = useAiAgent();

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "I've completed the preliminary analysis of your project roadmap. The current structure is efficient, but I've identified potential resource overlaps in Sprint 3.",
      suggestionAction: {
        text: "Would you like me to optimize the developer assignments for the backend team?",
      }
    }
  ]);

  const handleRunAi = () => {
    if (projectId) runPipeline(projectId);
  };

  /* Sync AI results to chat */
  useEffect(() => {
    if (result) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          sender: 'ai',
          text: typeof result === 'string' ? result : (result.message || "AI Analysis complete. I've updated the project insights with new recommendations."),
          timelineUpdate: result.timeline || "Timeline optimized"
        }
      ]);
    }
  }, [result]);

  /* ── Styles ────────────────────────────────────── */
  const wrapperStyle = {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 120px)',
    animation: 'reviewFadeIn 0.4s ease-out',
  };

  const chatContainer = {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: '1fr 340px',
    gap: '1.5rem',
    overflow: 'hidden',
  };

  const chatSection = {
    display: 'flex',
    flexDirection: 'column',
    background: isDark ? 'rgba(17, 24, 39, 0.4)' : 'rgba(255, 255, 255, 0.4)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}`,
    overflow: 'hidden',
  };

  const messageBubble = (sender) => ({
    maxWidth: '85%',
    padding: '1rem 1.25rem',
    borderRadius: sender === 'ai' ? '20px 20px 20px 4px' : '20px 20px 4px 20px',
    background: sender === 'ai' 
      ? (isDark ? 'linear-gradient(135deg, #1e3a8a, #1e1b4b)' : 'linear-gradient(135deg, #3b82f6, #6366f1)')
      : (isDark ? '#374151' : '#f1f5f9'),
    color: sender === 'ai' ? '#fff' : (isDark ? '#f3f4f6' : '#1e293b'),
    marginBottom: '1rem',
    alignSelf: sender === 'ai' ? 'flex-start' : 'flex-end',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    position: 'relative',
    fontSize: '0.92rem',
    lineHeight: 1.5,
  });

  return (
    <div style={wrapperStyle}>
      
      {/* ── Premium Header ────────────────────────── */}
      <div style={{
        background: isDark ? 'linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)' : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
        padding: '1.5rem 2rem',
        borderRadius: '16px',
        color: '#fff',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 8px 24px rgba(79, 70, 229, 0.25)',
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>AI Review Agent</h1>
          <p style={{ fontSize: '0.85rem', opacity: 0.8 }}>Continuous audit and optimization for your project.</p>
        </div>
        <button 
          onClick={handleRunAi}
          disabled={isProcessing}
          style={{
            padding: '0.65rem 1.5rem',
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '10px',
            color: '#fff',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {isProcessing ? '⚡ Analyzing...' : '✨ Run Audit'}
        </button>
      </div>

      <div style={chatContainer}>
        {/* Chat Section */}
        <div style={chatSection}>
          <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {messages.map(msg => (
              <div key={msg.id} style={messageBubble(msg.sender)}>
                {msg.text}
                {msg.suggestionAction && (
                  <div style={{
                    marginTop: '0.75rem',
                    padding: '0.75rem',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '0.82rem',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}>
                    <strong style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>PROPOSED ACTION</strong>
                    {msg.suggestionAction.text}
                  </div>
                )}
              </div>
            ))}
            {isProcessing && (
              <div style={messageBubble('ai')}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <div className="dot" style={{ width: 6, height: 6, background: '#fff', borderRadius: '50%', animation: 'chatPulse 1s infinite 0s' }} />
                  <div className="dot" style={{ width: 6, height: 6, background: '#fff', borderRadius: '50%', animation: 'chatPulse 1s infinite 0.2s' }} />
                  <div className="dot" style={{ width: 6, height: 6, background: '#fff', borderRadius: '50%', animation: 'chatPulse 1s infinite 0.4s' }} />
                </div>
              </div>
            )}
            {error && <div style={{ color: '#ef4444', textAlign: 'center', fontSize: '0.82rem', padding: '1rem' }}>Error: {error}</div>}
          </div>
          
          <div style={{ padding: '1.25rem', borderTop: `1px solid ${isDark ? '#1f2937' : '#e5e7eb'}`, background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)' }}>
             <div style={{ display: 'flex', gap: '0.75rem' }}>
                <input 
                  type="text" 
                  placeholder="Ask AI Review anything..." 
                  style={{
                    flex: 1,
                    padding: '0.75rem 1.25rem',
                    borderRadius: '12px',
                    background: isDark ? '#111827' : '#fff',
                    border: `1px solid ${isDark ? '#374151' : '#e2e8f0'}`,
                    color: isDark ? '#fff' : '#1e293b',
                    fontSize: '0.9rem'
                  }}
                />
                <button style={{
                  padding: '0 1.25rem',
                  background: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}>Send</button>
             </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ ...chatSection, padding: '1.5rem', flex: 'none' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', color: isDark ? '#fff' : '#1e293b' }}>Project Health</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
               <div style={{ 
                 width: '60px', height: '60px', borderRadius: '50%', 
                 border: '4px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center',
                 fontSize: '0.9rem', fontWeight: 800, color: '#10b981'
               }}>82%</div>
               <div style={{ fontSize: '0.78rem', color: isDark ? '#9ca3af' : '#64748b' }}>
                 <p><strong style={{ color: '#10b981' }}>Good.</strong> 3 tasks optimized this week.</p>
               </div>
            </div>
          </div>
          
          <div style={{ ...chatSection, padding: '1.5rem', flex: 1 }}>
             <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', color: isDark ? '#fff' : '#1e293b' }}>Strategic Alerts</h3>
             <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', padding: 0 }}>
               {[
                 { type: 'warning', text: 'Resource bottleneck in Sprint 2' },
                 { type: 'info', text: 'Documentation coverage at 60%' },
                 { type: 'success', text: 'CI/CD pipeline stabilized' }
               ].map((alert, i) => (
                 <li key={i} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.82rem', color: isDark ? '#d1d5db' : '#475569' }}>
                   <span style={{ color: alert.type === 'warning' ? '#f59e0b' : (alert.type === 'success' ? '#10b981' : '#3b82f6') }}>●</span>
                   {alert.text}
                 </li>
               ))}
             </ul>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes reviewFadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        @keyframes chatPulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default AiReviewPage;
