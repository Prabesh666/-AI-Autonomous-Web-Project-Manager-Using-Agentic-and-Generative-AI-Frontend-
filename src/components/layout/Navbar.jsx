import { useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

/* Route → page label map for breadcrumb */
const PAGE_LABELS = {
  '/dashboard': 'Dashboard',
  '/projects': 'Projects',
  '/projects/new': 'New Project',
  '/ai-planning': 'AI Planning',
  '/ai-review': 'AI Review',
  '/ai-decision': 'AI Decision',
  '/ai-memory': 'AI Memory',
  '/ai-loading': 'AI Loading',
  '/ai-error': 'AI Error',
  '/activity-log': 'Activity Log',
  '/profile': 'Profile',
  '/settings': 'Settings',
  '/reports': 'Reports',
};

const Navbar = () => {
  const { user } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);

  /* Determine breadcrumb label from current path */
  const pathname = location.pathname;
  const pageLabel = PAGE_LABELS[pathname]
    || (pathname.startsWith('/projects/') ? 'Project Details' : 'Dashboard');

  /* Avatar helpers */
  const displayName = user?.name || user?.email || 'User';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const avatarColors = ['#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4'];
  const avatarBg = avatarColors[(displayName.charCodeAt(0) || 0) % avatarColors.length];

  return (
    <header style={{
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.5rem',
      background: theme === 'dark' ? '#111827' : '#ffffff',
      borderBottom: theme === 'dark' ? '1px solid #1f2937' : '1px solid #e5e7eb',
      flexShrink: 0,
      zIndex: 30,
      boxShadow: theme === 'dark'
        ? '0 1px 3px rgba(0,0,0,0.4)'
        : '0 1px 4px rgba(0,0,0,0.06)',
      transition: 'background 0.2s, border-color 0.2s',
      position: 'relative',
    }}>

      {/* ── Left: breadcrumb ──────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Page breadcrumb */}
        <div style={{
          fontSize: '0.82rem',
          color: theme === 'dark' ? '#6b7280' : '#9ca3af',
          display: 'flex', alignItems: 'center', gap: '0.375rem'
        }}>
          <span style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>AI Project Manager</span>
          <span>/</span>
          <span style={{ color: theme === 'dark' ? '#f9fafb' : '#111827', fontWeight: 600 }}>
            {pageLabel}
          </span>
        </div>
      </div>

      {/* ── Right: actions ────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{
            background: 'none',
            border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
            borderRadius: '10px',
            cursor: 'pointer',
            color: theme === 'dark' ? '#fbbf24' : '#6b7280',
            width: '36px', height: '36px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          aria-label="Toggle dark mode"
          onMouseEnter={e => {
            e.currentTarget.style.background = theme === 'dark' ? '#1f2937' : '#f9fafb';
            e.currentTarget.style.borderColor = theme === 'dark' ? '#4b5563' : '#d1d5db';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'none';
            e.currentTarget.style.borderColor = theme === 'dark' ? '#374151' : '#e5e7eb';
          }}
        >
          {theme === 'dark' ? (
            /* Sun icon */
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            /* Moon icon */
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {/* Notifications */}
        <button
          onClick={() => setNotifOpen(p => !p)}
          style={{
            background: 'none',
            border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
            borderRadius: '10px',
            cursor: 'pointer',
            color: theme === 'dark' ? '#9ca3af' : '#6b7280',
            width: '36px', height: '36px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
            transition: 'all 0.2s',
          }}
          aria-label="Notifications"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {/* Notification dot */}
          <span style={{
            position: 'absolute', top: '7px', right: '7px',
            width: '7px', height: '7px',
            background: '#ef4444',
            borderRadius: '50%',
            border: `2px solid ${theme === 'dark' ? '#111827' : '#ffffff'}`,
          }} />
        </button>

        {/* Divider */}
        <div style={{
          width: '1px', height: '24px',
          background: theme === 'dark' ? '#1f2937' : '#e5e7eb',
          margin: '0 0.25rem',
        }} />

        {/* User Avatar + Name */}
        <button
          onClick={() => navigate('/profile')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.625rem',
            padding: '4px 8px', borderRadius: '10px',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = theme === 'dark' ? '#1f2937' : '#f9fafb'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <div style={{
            width: '34px', height: '34px',
            borderRadius: '50%',
            background: avatarBg,
            color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', fontWeight: 700,
            flexShrink: 0,
            boxShadow: `0 0 0 3px ${avatarBg}30`,
          }}>
            {initials}
          </div>
          <div style={{ textAlign: 'left' }} className="hidden md:block">
            <p style={{
              fontSize: '0.82rem', fontWeight: 700,
              color: theme === 'dark' ? '#f9fafb' : '#111827',
              lineHeight: 1.2,
            }}>
              {displayName.length > 14 ? displayName.slice(0, 14) + '…' : displayName}
            </p>
            <p style={{
              fontSize: '0.7rem',
              color: theme === 'dark' ? '#6b7280' : '#9ca3af',
              marginTop: '1px',
            }}>
              {user?.role || 'Member'}
            </p>
          </div>
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor"
            style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af', flexShrink: 0 }}
            className="hidden md:block"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
