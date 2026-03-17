import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="landing-container">
      {/* Header */}
      <nav className="landing-nav">
        <div className="nav-logo">
          <div className="logo-icon blue"></div>
          <span className="logo-text">AI Project Manager</span>
        </div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#about">About</a>
          <button 
            className="btn-primary" 
            onClick={() => navigate('/register')}
          >
            Get Started for Free
          </button>
          <button className="theme-toggle" style={{ position: 'relative', top: '0', right: '0', marginLeft: '1rem' }} onClick={toggleTheme}>
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section">
        <div className="badge">
          <span className="badge-dot"></span>
          NEW: PREDICTIVE ANALYTICS 2.0
        </div>
        
        <h1 className="hero-title">
          Manage your projects<br />
          with <span className="text-gradient">AI precision</span>
        </h1>
        
        <p className="hero-subtitle">
          The all-in-one workspace that predicts bottlenecks, automates status<br />
          updates, and keeps your team aligned effortlessly.
        </p>
        
        <div className="hero-cta-group">
          <button 
            className="btn-primary large"
            onClick={() => navigate('/register')}
          >
            Get Started for Free
          </button>
          <button className="btn-secondary large">
            Watch Demo
          </button>
        </div>

        {/* Dashboard Mockup Display */}
        <div className="dashboard-preview-wrapper">
          <div className="dashboard-preview" onClick={() => navigate('/dashboard')}>
            <div className="preview-glass-efffect"></div>
            {/* We will use a placeholder or CSS shapes until the final asset is ready */}
            <div className="preview-content-placeholder">
              <div className="placeholder-sidebar"></div>
              <div className="placeholder-main">
                <div className="placeholder-gantt"></div>
                <div className="placeholder-cards">
                   <div className="p-card"></div>
                   <div className="p-card"></div>
                   <div className="p-card"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stat-item">
          <h2>10k+</h2>
          <p>Active Teams</p>
        </div>
        <div className="stat-item">
          <h2>500k+</h2>
          <p>Projects Managed</p>
        </div>
        <div className="stat-item">
          <h2>40%</h2>
          <p>Efficiency Boost</p>
        </div>
        <div className="stat-item">
          <h2>24/7</h2>
          <p>AI Support</p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <p className="section-eyebrow">CORE CAPABILITIES</p>
        <h2 className="section-title">Streamline your workflow with AI</h2>
        
        <div className="features-grid">
          <div className="feature-card-detailed">
            <div className="fc-icon">📅</div>
            <h3>Smart Scheduling</h3>
            <p>AI-powered timelines that adjust automatically when deadlines shift. Predictive rescheduling keeps your team on track.</p>
          </div>
          <div className="feature-card-detailed">
            <div className="fc-icon">✨</div>
            <h3>Predictive Analytics</h3>
            <p>Identify project risks before they become problems with data-driven insights. Forecast delays and resource gaps instantly.</p>
          </div>
          <div className="feature-card-detailed">
            <div className="fc-icon">⚡</div>
            <h3>Automated Workflows</h3>
            <p>Let AI handle the busy work—from meeting summaries to task assignments. Connect your favorite tools and let automation do the rest.</p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bottom-cta-section">
        <div className="cta-box">
          <h2>Ready to transform your<br />productivity?</h2>
          <p>Join thousands of teams already using AI Project Manager to deliver results<br />faster and more reliably.</p>
          <div className="cta-box-buttons">
            <button className="btn-white" onClick={() => navigate('/register')}>Get Started for Free</button>
            <button className="btn-transparent">Contact Sales</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="logo-icon blue small"></div>
            <span className="logo-text">AI Project Manager</span>
            <p>Leading the future of project management through advanced artificial intelligence and intuitive design.</p>
          </div>
          <div className="footer-links-col">
            <h4>Product</h4>
            <a href="#">Features</a>
            <a href="#">Integrations</a>
            <a href="#">Pricing</a>
            <a href="#">Changelog</a>
          </div>
          <div className="footer-links-col">
            <h4>Company</h4>
            <a href="#">About Us</a>
            <a href="#">Careers</a>
            <a href="#">Contact</a>
            <a href="#">Privacy Policy</a>
          </div>
          <div className="footer-subscribe">
            <h4>Stay Updated</h4>
            <p>Get the latest AI project management tips delivered to your inbox.</p>
            <div className="subscribe-input">
              <input type="email" placeholder="Email address" />
              <button>→</button>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 AI Project Manager Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
