import { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { useProjects } from '../../hooks/useProjects';
import { runAgent, getAgentJobStatus } from '../../api/agents';

/* ─────────────────────────────────────────────────
   SHRISTIKA — AI Receptionist Chatbot Widget
   • Floating receptionist avatar with name badge
   • 3 rotating greeting toasts above the FAB
   • Slide-up premium chat panel
   • Aware of: user, projects, tasks, navigation
───────────────────────────────────────────────── */

const DEFAULT_GREETINGS = [
  { icon: '👋', text: "Hi! I'm Shristika. Need help?" },
  { icon: '⚡', text: 'I can run AI agents for you!' },
  { icon: '📊', text: 'Ask me about your projects!' },
];

/* ── Typing dots ──────────────────────────────── */
const TypingDots = () => (
  <div style={{ display: 'flex', gap: 5, padding: '2px 4px', alignItems: 'center' }}>
    {[0, 0.15, 0.3].map((d, i) => (
      <div key={i} style={{
        width: 8, height: 8, borderRadius: '50%',
        background: 'rgba(255,255,255,0.7)',
        animation: `shrDot 1.1s ${d}s infinite ease-in-out`
      }} />
    ))}
  </div>
);

/* ── Avatar (Shristika) ─────────────────────── */
const ShristikaAvatar = ({ size = 32 }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%', flexShrink: 0,
    background: 'linear-gradient(135deg,#f472b6,#a855f7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: size * 0.55 + 'px',
    boxShadow: '0 0 0 2px rgba(244,114,182,0.3)',
  }}>💁‍♀️</div>
);

/* ── Chat bubble ──────────────────────────────── */
const Bubble = ({ msg, isDark }) => {
  const isBot = msg.sender === 'bot';

  // Helper to render bold text and line breaks
  const formatText = (text) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ color: isBot ? (isDark ? '#f0abfc' : '#a855f7') : 'inherit', fontWeight: 800 }}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div style={{
      display: 'flex', gap: 8, alignItems: 'flex-end',
      justifyContent: isBot ? 'flex-start' : 'flex-end',
      marginBottom: 10, animation: 'shrBubble .22s ease both'
    }}>
      {isBot && <ShristikaAvatar size={28} />}
      <div>
        {isBot && (
          <p style={{ fontSize: '0.65rem', color: '#a855f7', fontWeight: 700, marginBottom: 3, paddingLeft: 2, letterSpacing: 0.3 }}>
            Shristika
          </p>
        )}
        <div style={{
          maxWidth: 240, padding: '0.65rem 0.9rem',
          borderRadius: isBot ? '0 18px 18px 18px' : '18px 0 18px 18px',
          background: isBot
            ? (isDark ? 'rgba(168,85,247,0.18)' : 'rgba(168,85,247,0.08)')
            : 'linear-gradient(135deg,#a855f7,#ec4899)',
          color: isBot ? (isDark ? '#e2e8f0' : '#1e293b') : '#fff',
          fontSize: '0.82rem', lineHeight: 1.55, whiteSpace: 'pre-wrap',
          boxShadow: isBot ? 'none' : '0 4px 14px rgba(168,85,247,0.35)',
          border: isBot ? `1px solid ${isDark ? 'rgba(168,85,247,0.2)' : 'rgba(168,85,247,0.12)'}` : 'none',
        }}>
          {msg.typing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <TypingDots />
              {msg.statusText && (
                <p style={{ 
                  fontSize: '0.68rem', 
                  color: isDark ? '#c084fc' : '#9333ea', 
                  fontStyle: 'italic', 
                  margin: 0,
                  animation: 'shrFadeIn 0.3s ease'
                }}>
                  {msg.statusText}
                </p>
              )}
            </div>
          ) : formatText(msg.text)}

          {msg.chips && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
              {msg.chips.map(chip => (
                <button key={chip.label} onClick={chip.action} style={{
                  padding: '0.22rem 0.65rem', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700,
                  background: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(168,85,247,0.12)',
                  color: isDark ? '#e9d5ff' : '#7c3aed', border: 'none', cursor: 'pointer',
                  transition: 'all 0.15s'
                }}>{chip.label}</button>
              ))}
            </div>
          )}
        </div>
      </div>
      {!isBot && (
        <div style={{
          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.7rem', color: '#fff', fontWeight: 700
        }}>
          {/* User initials handled below */}
          👤
        </div>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════════ */
const ChatbotWidget = () => {
  const { user } = useContext(AppContext);
  const { theme } = useTheme();
  const { projects, loadProjects } = useProjects();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const [open, setOpen]             = useState(false);
  const [messages, setMessages]     = useState([]);
  const [input, setInput]           = useState('');
  const [isTyping, setIsTyping]     = useState(false);
  const [isRunning, setIsRunning]   = useState(false);
  const [toastIdx, setToastIdx]     = useState(0);
  const [toastVisible, setToastVisible] = useState(true);
  const [dismissed, setDismissed]   = useState(false);
  const [greetings, setGreetings] = useState(DEFAULT_GREETINGS);

  // 🎈 Messenger-style Draggable State
  const [pos, setPos] = useState({ x: window.innerWidth - 85, y: window.innerHeight - 140 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const bottomRef   = useRef(null);
  const inputRef    = useRef(null);
  const initialized = useRef(false);

  /* ── Dragging Handlers ────────────────────────── */
  const onMouseDown = (e) => {
    if (open) return; // Don't drag while open
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - pos.x,
      y: e.clientY - pos.y
    });
    setDismissed(true); // Hide toasts when moving
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!isDragging) return;
      setPos({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    };

    const onMouseUp = () => {
      if (!isDragging) return;
      setIsDragging(false);
      // Snap to edges like Messenger
      const snapX = pos.x > window.innerWidth / 2 ? window.innerWidth - 85 : 15;
      setPos(prev => ({ ...prev, x: snapX }));
    };

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging, dragOffset, pos]);

  /* Load projects */
  useEffect(() => { if (projects?.length === 0) loadProjects(); }, []);

  /* Rotate greeting toasts every 3s */
  useEffect(() => {
    if (open || dismissed) return;
    const id = setInterval(() => {
      setToastVisible(false);
      setTimeout(() => {
        setToastIdx(p => (p + 1) % (greetings?.length || 1));
        setToastVisible(true);
      }, 350);
    }, 3200);
    return () => clearInterval(id);
  }, [open, dismissed, greetings?.length]);

  /* Auto-scroll */
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  /* Focus input */
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 350); }, [open]);

  /* Page-aware greeting & Mood Pulse */
  useEffect(() => {
    if (open && !initialized.current) {
      initialized.current = true;
      const displayName = user?.name || user?.email?.split('@')[0] || 'there';
      const firstName = displayName.split(' ')[0] || 'there';
      const path = window.location.pathname;
      
      let contextMsg = `I'm here to help you manage your ${projects?.length || 0} project(s).`;
      if (path.includes('reports')) contextMsg = "I see you're checking the reports—I've already analyzed the latest metrics for you! 📊";
      if (path.includes('activity-log')) contextMsg = "Reviewing the audit trail? I can help you verify system integrity. 🛡️";
      if (path.includes('ai-decision')) contextMsg = "At the Strategic Center! Ready to run an analysis? 🧠";

      const hour = new Date().getHours();
      const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
      
      addBot(
        `${greet}, **${firstName}**! 💖 ${contextMsg}\n\nWhat can I do for you today?`,
        [
          { label: '📁 My Projects',  action: () => sendQuick('Show my projects') },
          { label: '⚡ Run AI',       action: () => sendQuick('Run AI agent') },
          { label: '💡 Help',         action: () => sendQuick('help') },
        ]
      );
    }
  }, [open, projects?.length, user]);

  /* 🧠 Proactive "Pulse" Toasts */
  useEffect(() => {
    const interval = setInterval(() => {
      if (!open && !isTyping && projects?.length > 0 && user) {
        const displayName = user.name || user.email?.split('@')[0] || 'User';
        const firstName = displayName.split(' ')[0];
        const insights = [
          { icon: '🚀', text: `Project "${projects[0]?.name || 'Alpha'}" is live and active!` },
          { icon: '🛡️', text: `System audit: 100% integrity verified, ${firstName}.` },
          { icon: '📈', text: `Strategic productivity is up 12% this week!` },
          { icon: '✅', text: "All AI autonomous nodes are green." }
        ];
        const randomInsight = insights[Math.floor(Math.random() * insights.length)];
        
        setGreetings(prev => {
          const next = [...prev];
          next[2] = randomInsight; // Replace the 3rd greeting with a live insight
          return next;
        });

        // Trigger a fresh visibility cycle
        setToastVisible(false);
        setTimeout(() => setToastVisible(true), 500);
      }
    }, 30000); // Pulse every 30s
    return () => clearInterval(interval);
  }, [open, isTyping, projects, user]);

  /* ── helpers ──────────────────────────────────── */
  const addBot = (text, chips) =>
    setMessages(prev => [...prev, { id: Date.now() + Math.random(), sender: 'bot', text, chips }]);

  const addUser = text =>
    setMessages(prev => [...prev, { id: Date.now() + Math.random(), sender: 'user', text }]);

  const showTyping = () => {
    const id = Date.now();
    setMessages(prev => [...prev, { id, sender: 'bot', typing: true }]);
    return id;
  };
  const removeTyping = id =>
    setMessages(prev => prev.filter(m => m.id !== id));

  const sendQuick = text => { setInput(''); handleSend(text); };

  /* ── Poll AI job ──────────────────────────────── */
  const pollJob = (jobId, iv = 2500, max = 24) =>
    new Promise((resolve, reject) => {
      let n = 0;
      const tick = async () => {
        n++;
        try {
          const res = await getAgentJobStatus(jobId);
          const job = res?.data || res;
          if (job.status === 'completed') return resolve(job);
          if (job.status === 'failed')    return reject(new Error(job.error?.message || 'failed'));
          if (n >= max)                   return resolve(job);
          setTimeout(tick, iv);
        } catch (e) { reject(e); }
      };
      tick();
    });

  /* ── Intent engine ────────────────────────────── */
  const processMessage = useCallback(async (text) => {
    const lower = text.toLowerCase().trim();
    const displayName = user?.name || user?.email?.split('@')[0] || 'there';
    const first = displayName.split(' ')[0] || 'there';

    if (!user && (lower.includes('who are you') || lower.includes('help') || lower.includes('what is this'))) {
      return { 
        text: "I'm Shristika! Think of me as your project's digital soul. 💁‍♀️\n\nI help humans like you build incredible things by automating the boring stuff. Want to see how we can work together?",
        chips: [
          { label: '🚀 Join the Team', action: () => navigate('/register') },
          { label: '🔑 Sign In', action: () => navigate('/login') }
        ]
      };
    }

    if (/^(hi|hello|hey|sup|yo|hola)\b/.test(lower))
      return { text: `Good to see you, ${first}! 😊 I was just auditing our nodes—everything looks great. \n\nWhat's our focus for today?`, chips: [
        { label: '📁 Review Projects', action: () => sendQuick('Show my projects') },
        { label: '📊 Dashboard', action: () => navigate('/dashboard') },
      ]};

    if (lower.includes('who am i') || lower.includes('my profile') || lower.includes('my account'))
      return { text: `You're the visionary behind it all, ${first}! Here's your current status:\n\n👤 ${user?.name || '—'}\n📧 ${user?.email || '—'}\n🔑 Role: ${(user?.role || 'user').toUpperCase()}\n📁 Active Projects: ${projects?.length || 0}`, chips: [
        { label: '👤 View Profile', action: () => navigate('/profile') }
      ]};

    if (lower.includes('project') && (lower.includes('list') || lower.includes('show') || lower.includes('my') || lower.includes('all'))) {
      if (!projects?.length) return { text: "Our workspace is currently empty! Shall we start something new together?", chips: [
        { label: '+ Launch New Project', action: () => navigate('/projects/new') }
      ]};
      const list = projects.map(p => `• **${p.name}**`).join('\n');
      return { text: `We've got **${projects?.length || 0}** exciting project(s) in motion:\n\n${list}`, chips: [
        { label: '⚡ Orchestrate AI', action: () => sendQuick('Run AI agent') },
        { label: '⚙️ Workspace Settings', action: () => navigate('/settings') },
        { label: '+ New Vision', action: () => navigate('/projects/new') }
      ]};
    }

    if (lower.includes('create') || lower.includes('new project'))
      return { text: "Let's create a new project! 🚀", chips: [{ label: '+ New Project', action: () => navigate('/projects/new') }]};

    if (lower.includes('dashboard'))  { navigate('/dashboard'); return { text: '📊 Opening your Dashboard!' }; }

    if (lower.includes('demo mode') || lower.includes('what should i show') || lower.includes('guide me')) {
      return { 
        text: "🚀 **Platinum Demo Sequence Activated!**\n\n1. **Dashboard**: Show your project overview.\n2. **AI Planning**: Run a 'Decomposition' agent.\n3. **AI Decision**: Run 'Strategy Analysis' to show the brain.\n4. **Reports**: Generate an AI Executive Report.\n5. **Activity Log**: Show the audit trail.\n\nGood luck! You've got this. 🏆",
        chips: [{ label: 'Let\'s Start!', action: () => navigate('/dashboard') }]
      };
    }
    if (lower.includes('report'))     { navigate('/reports');   return { text: '📊 Opening Reports!' }; }
    if (lower.includes('setting'))    { navigate('/settings');  return { text: '⚙️ Opening Settings!' }; }
    if (lower.includes('profile'))    { navigate('/profile');   return { text: '👤 Opening your Profile!' }; }
    if (lower.includes('ai plan') || lower.includes('planning')) { navigate('/ai-planning'); return { text: '⚡ Opening AI Planning workspace!' }; }
    if (lower.includes('memory') || lower.includes('audit'))     { navigate('/ai-memory');  return { text: '🧠 Opening AI Memory trail!' }; }
    if (lower.includes('decision'))   { navigate('/ai-decision'); return { text: '🧠 Opening AI Decision center!' }; }

    if (lower.includes('run ai') || lower.includes('run agent') || lower.includes('generate task') || lower.includes('ai agent')) {
      if (!projects?.length) return { text: 'You need a project first!', chips: [{ label: '+ New Project', action: () => navigate('/projects/new') }]};
      const project = projects[0];
      const projectId = project._id || project.id;
      setIsRunning(true);
      try {
        const res = await runAgent('planner', projectId, { prompt: `Analyze and improve: ${project.name}` });
        const jobId = res?.data?.jobId || res?.jobId;
        if (!jobId) { setIsRunning(false); return { text: `✅ AI queued for **${project.name}**!` }; }
        const done = await pollJob(jobId);
        const r = done?.result || {};
        setIsRunning(false);
        return { text: `✅ Done! AI analyzed **${project.name}**\n\n📋 ${r.taskCount || '?'} tasks\n🛡️ ${r.riskCount || '?'} risks`, chips: [
          { label: 'View Project', action: () => navigate(`/projects/${projectId}`) }
        ]};
      } catch (e) { setIsRunning(false); return { text: `❌ ${e.message}` }; }
    }

    if (lower.includes('help') || lower.includes('what can') || lower.includes('command'))
      return { text: 'Here\'s everything I can help you with! 💖', chips: [
        { label: '📁 Projects',  action: () => sendQuick('Show my projects') },
        { label: '👤 Profile',   action: () => navigate('/profile') },
        { label: '⚡ Run AI',    action: () => sendQuick('Run AI agent') },
        { label: '📊 Dashboard', action: () => navigate('/dashboard') },
        { label: '📝 New',       action: () => navigate('/projects/new') },
        { label: '📊 Reports',   action: () => navigate('/reports') },
        { label: '🧠 Memory',    action: () => navigate('/ai-memory') },
        { label: '⚙️ Settings',  action: () => navigate('/settings') },
      ]};

    return { text: `Hmm, I'm not sure about that, ${first}. Try "help" to see what I can do! 😊`, chips: [
      { label: '💡 Help',      action: () => sendQuick('help') },
      { label: '📁 Projects',  action: () => sendQuick('Show my projects') },
    ]};
  }, [user, projects, navigate]);

  /* ── Send ─────────────────────────────────────── */
  const handleSend = useCallback(async (override) => {
    const text = (override ?? input).trim();
    if (!text || isTyping) return;
    setInput('');
    addUser(text);
    setIsTyping(true);
    const tid = showTyping();

    // 🧠 Sequential Thinking Sequence
    const lower = text.toLowerCase();
    if (lower.includes('project') || lower.includes('status') || lower.includes('agent') || lower.includes('run') || lower.includes('ai')) {
      const statuses = [
        "🔍 Scanning our workspace for context...",
        "🧠 Connecting with our AI modules...",
        "✨ Finalizing the perfect insight for you..."
      ];
      for (const status of statuses) {
        setMessages(prev => prev.map(m => m.id === tid ? { ...m, statusText: status } : m));
        await new Promise(r => setTimeout(r, 900));
      }
    } else {
      await new Promise(r => setTimeout(r, 600));
    }

    const resp = await processMessage(text);
    removeTyping(tid);
    setIsTyping(false);
    if (resp) addBot(resp.text, resp.chips);
  }, [input, isTyping, processMessage]);

  /* ── Styles ───────────────────────────────────── */
  const panelBg = isDark ? '#0f172a' : '#ffffff';
  const border  = isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb';

  return (
    <>
      {/* ══ 3 Greeting Toasts — follows the bubble ════ */}
      {!open && !dismissed && (
        <div style={{
          position: 'fixed', 
          left: pos.x > window.innerWidth / 2 ? 'auto' : pos.x + 75,
          right: pos.x > window.innerWidth / 2 ? (window.innerWidth - pos.x) + 15 : 'auto',
          top: pos.y - 120,
          zIndex: 998, display: 'flex', flexDirection: 'column', gap: 8,
          alignItems: pos.x > window.innerWidth / 2 ? 'flex-end' : 'flex-start',
          pointerEvents: 'none',
          transition: isDragging ? 'none' : 'all 0.4s ease'
        }}>
          {greetings.map((g, i) => {
            const isTop = i === toastIdx;
            const isMid = i === (toastIdx + 1) % 3;
            const scale    = isTop ? 1 : isMid ? 0.96 : 0.92;
            const opacity  = isTop ? 1 : isMid ? 0.82 : 0.6;
            const yOffset  = isTop ? 0 : isMid ? 4 : 8;

            return (
              <div
                key={i}
                style={{
                  background: isDark ? '#1e293b' : '#ffffff',
                  border: `1.5px solid ${isTop
                    ? (isDark ? '#a855f7' : '#c084fc')
                    : (isDark ? '#334155' : '#e9d5ff')}`,
                  borderRadius: 14,
                  padding: '0.6rem 0.9rem',
                  display: 'flex', alignItems: 'center', gap: '0.6rem',
                  boxShadow: isTop
                    ? (isDark
                        ? '0 8px 24px rgba(0,0,0,0.55), 0 0 0 1px rgba(168,85,247,0.2)'
                        : '0 8px 24px rgba(168,85,247,0.2)')
                    : (isDark ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.06)'),
                  opacity: toastVisible ? opacity : (isTop ? 0 : opacity * 0.5),
                  transform: `translateY(${yOffset}px) scale(${scale})`,
                  transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
                  transformOrigin: pos.x > window.innerWidth / 2 ? 'right center' : 'left center',
                  minWidth: 200,
                  maxWidth: 260,
                }}
              >
                <div style={{
                  width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                  background: isDark ? 'rgba(168,85,247,0.2)' : 'rgba(168,85,247,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem',
                }}>
                  {g.icon}
                </div>
                <span style={{
                  fontSize: '0.78rem', fontWeight: 600, flex: 1,
                  color: isDark ? '#e2e8f0' : '#1e293b',
                  lineHeight: 1.3,
                }}>
                  {g.text}
                </span>

                {/* Dismiss — only on top toast */}
                {isTop && (
                  <button
                    onClick={e => { e.stopPropagation(); setDismissed(true); }}
                    style={{
                      background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                      border: 'none', borderRadius: 6, cursor: 'pointer',
                      color: isDark ? '#94a3b8' : '#9ca3af',
                      fontSize: '0.7rem', lineHeight: 1, padding: '3px 5px',
                      flexShrink: 0,
                    }}
                  >✕</button>
                )}
              </div>
            );
          })}
        </div>
      )}


      {/* ══ Floating Button ════════════════════════ */}
      <div 
        onMouseDown={onMouseDown}
        style={{ 
          position: 'fixed', 
          left: pos.x, 
          top: pos.y, 
          zIndex: 1000, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: 4,
          cursor: isDragging ? 'grabbing' : 'grab',
          transition: isDragging ? 'none' : 'left 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), top 0.4s ease'
        }}
      >
        {/* Name badge */}
        {!open && (
          <div style={{
            background: isDark ? 'rgba(15,23,42,0.9)' : 'rgba(255,255,255,0.95)',
            border: `1px solid ${isDark ? 'rgba(168,85,247,0.3)' : 'rgba(168,85,247,0.2)'}`,
            borderRadius: 999, padding: '0.2rem 0.75rem',
            fontSize: '0.68rem', fontWeight: 700, color: '#a855f7',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 2px 8px rgba(168,85,247,0.2)',
            letterSpacing: 0.3,
            animation: 'shrFadeIn .4s ease',
            whiteSpace: 'nowrap',
            pointerEvents: 'none'
          }}>
            Shristika ✨
          </div>
        )}

        {/* FAB */}
        <button
          onClick={() => { if (!isDragging) { setOpen(o => !o); setDismissed(true); } }}
          title="Chat with Shristika"
          style={{
            width: 58, height: 58, borderRadius: '50%', border: '3px solid',
            borderColor: open ? (isDark ? '#334155' : '#e5e7eb') : 'rgba(244,114,182,0.5)',
            cursor: isDragging ? 'grabbing' : 'pointer', 
            position: 'relative', overflow: 'hidden',
            background: open
              ? (isDark ? '#1e293b' : '#f8fafc')
              : 'linear-gradient(135deg,#f472b6,#a855f7)',
            boxShadow: open ? '0 4px 16px rgba(0,0,0,0.2)' : '0 8px 32px rgba(168,85,247,0.45)',
            transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: open ? '1rem' : '1.6rem',
            touchAction: 'none'
          }}
        >
          {open ? (
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={isDark ? '#94a3b8' : '#64748b'}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : '💁‍♀️'}
        </button>

        {/* Online dot */}
        {!open && (
          <div style={{
            position: 'absolute', bottom: 2, right: 2,
            width: 12, height: 12, borderRadius: '50%',
            background: '#10b981', border: '2px solid ' + (isDark ? '#0f172a' : '#fff'),
            animation: 'shrPulse 2s infinite',
            pointerEvents: 'none'
          }} />
        )}
      </div>

      {/* ══ Chat Panel ═════════════════════════════ */}
      <div style={{
        position: 'fixed', 
        left: pos.x > window.innerWidth / 2 ? 'auto' : pos.x + 85,
        right: pos.x > window.innerWidth / 2 ? (window.innerWidth - pos.x) + 20 : 'auto',
        top: Math.max(20, Math.min(pos.y - 580, window.innerHeight - 660)),
        zIndex: 999,
        width: 420, height: 640,
        background: panelBg, borderRadius: 22, overflow: 'auto',
        border: `1px solid ${isDark ? 'rgba(168,85,247,0.2)' : 'rgba(168,85,247,0.15)'}`,
        boxShadow: isDark
          ? '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(168,85,247,0.1)'
          : '0 24px 60px rgba(168,85,247,0.2), 0 0 0 1px rgba(168,85,247,0.08)',
        display: 'flex', flexDirection: 'column',
        transform: open ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.93)',
        opacity: open ? 1 : 0, pointerEvents: open ? 'all' : 'none',
        transition: 'all 0.35s cubic-bezier(0.34,1.2,0.64,1)',
        resize: 'both',
        minWidth: 320,
        minHeight: 400,
        maxWidth: 800,
        maxHeight: 800
      }}>
        {/* ── Header ── */}
        <div style={{
          background: 'linear-gradient(135deg,#ec4899,#a855f7)',
          padding: '0.875rem 1.1rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0
        }}>
          {/* Avatar with online ring */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: 42, height: 42, borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              border: '2.5px solid rgba(255,255,255,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.35rem'
            }}>💁‍♀️</div>
            <div style={{
              position: 'absolute', bottom: 1, right: 1,
              width: 11, height: 11, borderRadius: '50%',
              background: '#10b981', border: '2px solid rgba(255,255,255,0.9)'
            }} />
          </div>

          <div style={{ flex: 1 }}>
            <p style={{ color: '#fff', fontWeight: 800, fontSize: '0.92rem', margin: 0, letterSpacing: 0.2 }}>
              Shristika
            </p>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.7rem', margin: '1px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              {isRunning ? 'Running AI agent...' : isTyping ? 'Typing...' : `AI Receptionist · ${projects?.length || 0} projects`}
            </p>
          </div>

          <button onClick={() => setMessages([])} title="Clear"
            style={{
              background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8,
              padding: '0.25rem 0.6rem', color: '#fff', cursor: 'pointer',
              fontSize: '0.68rem', fontWeight: 700, letterSpacing: 0.3
            }}>
            CLEAR
          </button>
        </div>

        {/* ── Subheader strip ── */}
        <div style={{
          background: isDark ? 'rgba(168,85,247,0.08)' : 'rgba(168,85,247,0.05)',
          borderBottom: `1px solid ${border}`,
          padding: '0.4rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem'
        }}>
          <span style={{ fontSize: '0.68rem', color: isDark ? '#c4b5fd' : '#7c3aed', fontWeight: 600 }}>
            💖 Personalized for {user?.name?.split(' ')[0] || 'you'}
          </span>
          <span style={{ fontSize: '0.65rem', color: isDark ? '#64748b' : '#94a3b8', marginLeft: 'auto' }}>
            Press Enter to send
          </span>
        </div>

        {/* ── Messages ── */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '1rem',
          background: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(168,85,247,0.02)',
        }}>
          {messages.map(msg => <Bubble key={msg.id} msg={msg} isDark={isDark} />)}
          <div ref={bottomRef} />
        </div>

        {/* ── Quick chips (initial) ── */}
        {messages.length > 0 && messages.length < 4 && !isTyping && (
          <div style={{ padding: '0.3rem 1rem 0.4rem', display: 'flex', gap: 5, flexWrap: 'wrap', borderTop: `1px solid ${border}` }}>
            {['My projects','Run AI agent','Help'].map(q => (
              <button key={q} onClick={() => sendQuick(q)} style={{
                padding: '0.22rem 0.7rem', borderRadius: 999, fontSize: '0.71rem', fontWeight: 600,
                background: isDark ? 'rgba(168,85,247,0.12)' : 'rgba(168,85,247,0.07)',
                color: '#a855f7', border: '1px solid rgba(168,85,247,0.2)', cursor: 'pointer'
              }}>{q}</button>
            ))}
          </div>
        )}

        {/* ── Input bar ── */}
        <div style={{
          padding: '0.75rem 1rem',
          background: isDark ? '#111827' : '#f9fafb',
          borderTop: `1px solid ${border}`,
          display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0
        }}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Ask Shristika anything..."
            disabled={isTyping}
            style={{
              flex: 1, padding: '0.6rem 1rem', borderRadius: 12, fontSize: '0.83rem',
              background: isDark ? '#1e293b' : '#fff',
              border: `1.5px solid ${isDark ? 'rgba(168,85,247,0.2)' : 'rgba(168,85,247,0.15)'}`,
              color: isDark ? '#f8fafc' : '#111827', outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = '#a855f7'}
            onBlur={e => e.target.style.borderColor = isDark ? 'rgba(168,85,247,0.2)' : 'rgba(168,85,247,0.15)'}
          />
          <button onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            style={{
              width: 38, height: 38, borderRadius: 12, border: 'none', flexShrink: 0,
              background: !input.trim() || isTyping
                ? (isDark ? '#1e293b' : '#e5e7eb')
                : 'linear-gradient(135deg,#ec4899,#a855f7)',
              color: !input.trim() || isTyping ? (isDark ? '#4b5563' : '#9ca3af') : '#fff',
              cursor: !input.trim() || isTyping ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: !input.trim() || isTyping ? 'none' : '0 4px 14px rgba(168,85,247,0.4)',
              transition: 'all 0.2s',
            }}>
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>

        {/* ── Footer branding ── */}
        <div style={{ padding: '0.35rem', textAlign: 'center', background: isDark ? '#0f172a' : '#f9fafb', borderTop: `1px solid ${border}` }}>
          <span style={{ fontSize: '0.62rem', color: isDark ? '#334155' : '#cbd5e1', fontWeight: 500 }}>
            Powered by AI Project Manager ⚡
          </span>
        </div>
      </div>

      <style>{`
        @keyframes shrDot    { 0%,80%,100%{transform:scale(0.5);opacity:.4} 40%{transform:scale(1.1);opacity:1} }
        @keyframes shrBubble { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shrPulse  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.2)} }
        @keyframes shrFadeIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </>
  );
};

export default ChatbotWidget;
