import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const DashboardLayout = () => {
  const { theme } = useTheme();


  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100%',
      overflow: 'hidden',
      background: theme === 'dark' ? '#0d1117' : '#f8fafc',
      fontFamily: 'Inter, sans-serif',
    }}>

      {/* ── Sidebar ──────────────────────────────── */}
      <Sidebar />


      {/* ── Main content area ─────────────────────── */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minWidth: 0,
        overflow: 'hidden',
      }}>

        {/* Top Navbar */}
        <Navbar />


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
