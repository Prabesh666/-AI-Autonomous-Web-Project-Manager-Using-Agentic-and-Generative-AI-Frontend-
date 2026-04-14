import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import ChatbotWidget from './ChatbotWidget';

const DashboardLayout = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Only used for mobile overlay toggle
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div style={{
      display: 'flex',
      width: '100%',
      height: '100vh',
      overflow: 'hidden',
      fontFamily: 'Inter, system-ui, sans-serif',
      background: isDark ? '#0d1117' : '#f8fafc',
    }}>

      {/* ── Sidebar — always visible on desktop ─── */}
      <Sidebar
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      {/* ── Main content ──────────────────────────── */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minWidth: 0,
        overflow: 'hidden',
      }}>
        {/* Top Navbar */}
        <Navbar onMenuClick={() => setIsMobileOpen(true)} />

        {/* Page Content */}
        <main style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          background: isDark ? '#0d1117' : '#f8fafc',
        }}>
          <div style={{
            maxWidth: '1600px',
            margin: '0 auto',
            padding: '1.5rem 2rem',
          }}>
            <Outlet />
          </div>
        </main>
      </div>

      {/* ── Chatbot — floats over all pages ─── */}
      <ChatbotWidget />
    </div>
  );
};

export default DashboardLayout;
