import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const DashboardLayout = () => {
  const { theme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className={`flex h-screen w-full overflow-hidden font-sans ${theme === 'dark' ? 'bg-[#0d1117]' : 'bg-[#f8fafc]'}`}>

      {/* ── Sidebar ──────────────────────────────── */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* ── Main content area ─────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">

        {/* Top Navbar */}
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />


        {/* Page Content */}
        <main style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          background: theme === 'dark' ? '#0d1117' : '#f8fafc',
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
    </div>
  );
};

export default DashboardLayout;
