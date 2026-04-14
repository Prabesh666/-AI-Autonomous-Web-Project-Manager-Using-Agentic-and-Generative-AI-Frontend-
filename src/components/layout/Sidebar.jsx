import { NavLink, useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { useProjects } from '../../hooks/useProjects';

const navItems = [
  {
    to: '/dashboard', label: 'Dashboard',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )
  },
  {
    to: '/projects', label: 'Projects',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 7a1 1 0 011-1h5l2 2h9a1 1 0 011 1v9a1 1 0 01-1 1H4a1 1 0 01-1-1V7z" />
      </svg>
    )
  },
  {
    to: '/reports', label: 'Reports',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  },
  {
    to: '/activity-log', label: 'Activity Log',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    to: '/profile', label: 'Profile',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )
  },
  {
    to: '/settings', label: 'Settings',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  },
];

const aiItems = [
  {
    to: '/ai-planning', label: 'AI Planning',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    )
  },
  // AI Review is parameterized — static placeholder; resolved dynamically below
  {
    to: '/ai-review', label: 'AI Review', paramKey: 'ai-review',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    )
  },
  {
    to: '/ai-decision', label: 'AI Decision',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )
  },
  {
    to: '/ai-memory', label: 'AI Memory',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>
    )
  },
];

const Sidebar = ({ isMobileOpen, onMobileClose }) => {
  const { user, logout } = useContext(AppContext);
  const { projects } = useProjects();
  const { theme } = useTheme();
  const navigate = useNavigate();

  // Build dynamic AI Review link using first available project
  const firstProjectId = projects?.[0]?._id || projects?.[0]?.id || '';
  const resolvedAiItems = aiItems.map(item =>
    item.paramKey === 'ai-review'
      ? { ...item, to: firstProjectId ? `/ai-review/${firstProjectId}` : '/projects' }
      : item
  );

  const handleLogout = () => { logout(); navigate('/login'); };

  // On narrow screens ( < 768px), sidebar becomes an overlay drawer
  const isNarrow = typeof window !== 'undefined' && window.innerWidth < 768;

  const isDark = theme === 'dark';
  const bg            = isDark ? '#0f172a' : '#ffffff'; // Deep Slate 900
  const border        = isDark ? '#1e293b' : '#e5e7eb'; // Slate 800
  const textPrimary   = isDark ? '#f8fafc' : '#111827'; // Slate 50
  const textSecondary = isDark ? '#94a3b8' : '#6b7280'; // Slate 400
  const activeLink    = isDark ? 'rgba(59,130,246,0.18)' : 'rgba(59,130,246,0.08)';
  const hoverLink     = isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc';
  const activeText    = isDark ? '#60a5fa' : '#2563eb'; // Brighter blue for dark mode

  const sidebarStyle = {
    // Always visible on desktop as a permanent flex column
    position: 'relative',
    width: '260px',
    flexShrink: 0,
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: bg,
    borderRight: `1px solid ${border}`,
    zIndex: 10,
    overflowY: 'auto',
    overflowX: 'hidden',
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const NavGroup = ({ label, items }) => (
    <div style={{ marginBottom: '1.5rem' }}>
      <p style={{
        fontSize: '0.68rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: textSecondary,
        padding: '0 0.75rem',
        marginBottom: '0.375rem',
      }}>
        {label}
      </p>
      {items.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            padding: '0.55rem 0.75rem',
            borderRadius: '8px',
            fontSize: '0.855rem',
            fontWeight: isActive ? 600 : 500,
            color: isActive ? activeText : textSecondary,
            background: isActive ? activeLink : 'transparent',
            textDecoration: 'none',
            transition: 'all 0.15s',
            margin: '0.1rem 0',
          })}
          onMouseEnter={e => {
            if (!e.currentTarget.className.includes('active')) {
              e.currentTarget.style.background = hoverLink;
              e.currentTarget.style.color = textPrimary;
            }
          }}
          onMouseLeave={e => {
            // restore by letting NavLink style handle active state
            e.currentTarget.style.background = '';
            e.currentTarget.style.color = '';
          }}
        >
          {item.icon}
          {item.label}
        </NavLink>
      ))}
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop — only shown when drawer is open on small screens */}
      {isMobileOpen && (
        <div
          onClick={onMobileClose}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 40,
          }}
        />
      )}

      <aside style={sidebarStyle}>
        {/* Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px',
          padding: '0 1.25rem',
          borderBottom: `1px solid ${border}`,
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '32px', height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(99,102,241,0.4)',
              flexShrink: 0,
            }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: 800, color: textPrimary, lineHeight: 1.2 }}>
                AI Manager
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem 0.75rem',
        }}>
          <NavGroup label="Main"     items={navItems}           />
          <NavGroup label="AI Tools" items={resolvedAiItems}    />
        </nav>

        {/* Footer */}
        <div style={{
          flexShrink: 0,
          padding: '1rem',
          borderTop: `1px solid ${border}`,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}>
          <button
            onClick={() => { navigate('/projects/new'); }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              width: '100%', padding: '0.625rem',
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              color: '#fff',
              border: 'none', borderRadius: '8px',
              fontSize: '0.82rem', fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
              transition: 'opacity 0.2s, transform 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
             New Project
          </button>

          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              width: '100%', padding: '0.55rem',
              background: 'transparent',
              color: textSecondary,
              border: `1px solid ${border}`, borderRadius: '8px',
              fontSize: '0.82rem', fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#ef4444';
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)';
              e.currentTarget.style.background = 'rgba(239,68,68,0.06)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = textSecondary;
              e.currentTarget.style.borderColor = border;
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
