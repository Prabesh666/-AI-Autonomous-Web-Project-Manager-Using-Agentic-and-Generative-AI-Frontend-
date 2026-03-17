import { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import './DashboardLayout.css';

const DashboardLayout = () => {
  const [theme, setTheme] = useState('light');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const closeMenu = () => {
    if (window.innerWidth <= 900) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <div className="dashboard-app-container">
      {/* Sidebar Navigation */}
      <aside className={`dashboard-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-icon blue base"></div>
          <span className="logo-text">TaskBoard Pro</span>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink to="/dashboard" onClick={closeMenu} className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <span className="nav-icon">📊</span>
            Dashboard
          </NavLink>
          <NavLink to="/projects" onClick={closeMenu} className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <span className="nav-icon">📁</span>
            Projects
          </NavLink>
          <NavLink to="/tasks" onClick={closeMenu} className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <span className="nav-icon">📋</span>
            Tasks
          </NavLink>
          <NavLink to="/ai-planning" onClick={closeMenu} className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <span className="nav-icon">🧠</span>
            AI Planning
          </NavLink>
          <NavLink to="/settings" onClick={closeMenu} className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <span className="nav-icon">⚙️</span>
            Settings
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="team-members">
            <span className="team-label">TEAM MEMBERS</span>
            <div className="avatars">
              <div className="avatar">A</div>
              <div className="avatar">B</div>
              <div className="avatar">+3</div>
            </div>
          </div>
          <button className="btn-new-project">
            + New Project
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="dashboard-main-wrapper">
        <header className="dashboard-topbar">
          <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            ☰
          </button>
          
          <div className="topbar-title">
            <h2>🚀 Project Alpha</h2>
          </div>

          <div className="topbar-actions">
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input type="text" placeholder="Search tasks..." />
            </div>
            
            <button className="theme-toggle-btn" onClick={toggleTheme}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            
            <button className="notification-btn">
              🔔
            </button>
            
            <div className="user-profile">
              <span className="user-name">Alex Johnson</span>
              <div className="user-avatar">AJ</div>
            </div>
          </div>
        </header>

        <main className="dashboard-content">
          <Outlet /> {/* Child routes will render here */}
        </main>
      </div>
      
      {/* Mobile overlay */}
      {isMobileMenuOpen && <div className="mobile-overlay" onClick={closeMenu}></div>}
    </div>
  );
};

export default DashboardLayout;
