import { useState, useEffect } from 'react';
import { registerAPI, API_URL } from '../../services/apiClient';

const RegisterPage = ({ onNavigate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState('light'); // default to light to match Figma
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const data = await registerAPI(name, email, password);
      // If the backend returns success:
      if (data.message === "User registered successfully" || data.user) {
         setSuccessMsg(data.message || 'User registered successfully!');
         // Auto redirect to login after 1.5 seconds if successful
         setTimeout(() => {
           onNavigate('login');
         }, 1500);
      } else {
         setErrorMsg(data.message || 'Registration failed.');
      }

    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <button className="theme-toggle" onClick={toggleTheme}>
        {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
      </button>

      {/* LEFT SIDE: Branding / Info */}
      <div className="login-sidebar">
        <div className="sidebar-content">
          <div className="logo-container">
            <img src="/logo.svg" alt="AI Project Manager Logo" className="logo-image auth-logo" />
          </div>

          <h1 className="sidebar-title">
            Join the future of<br />AI-driven<br />productivity.
          </h1>

          <div className="feature-cards" style={{ flexDirection: 'column' }}>
            <div className="feature-card">
              <span className="feature-icon">🪄</span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: '700' }}>Smart Task Automation</span>
                <span style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '2px' }}>Let AI handle the busy work while you focus on what matters most.</span>
              </div>
            </div>
            
            <div className="feature-card">
              <span className="feature-icon">🤝</span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: '700' }}>Real-time Collaboration</span>
                <span style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '2px' }}>Sync with your team instantly with powerful AI-assisted communication tools.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Form */}
      <div className="login-form-section">
        <div className="form-wrapper">
          <div className="form-header">
            <h2>Create your account</h2>
            <p className="form-subtitle">Start managing your projects with AI today.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {errorMsg && <div className="error-alert">{errorMsg}</div>}
            {successMsg && <div className="success-alert">{successMsg}</div>}

            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-wrapper">
                <input
                  type="password"
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="button" className="eye-icon">👁</button>
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <svg className="btn-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="spinner-track" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="spinner-head" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </>
              ) : 'Create Account'}
            </button>
            
            <div className="divider">
              <span>Or sign up with</span>
            </div>

            <div className="social-logins">
              <button 
                type="button" 
                className="social-btn google-btn" 
                aria-label="Sign in with Google"
                onClick={() => window.location.href = `${API_URL}/api/auth/google`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.999 10.999 0 0 0 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </button>
              <button 
                type="button" 
                className="social-btn github-btn" 
                aria-label="Sign in with GitHub"
                onClick={() => window.location.href = `${API_URL}/api/auth/github`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.03-2.682-.103-.254-.447-1.27.098-2.646 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.376.202 2.394.1 2.646.64.699 1.026 1.591 1.026 2.682 0 3.841-2.337 4.687-4.565 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
              </button>
            </div>
            
            <p className="signup-link">
              Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('login'); }}>Log in</a>
            </p>
          </form>

          <div className="footer-links">
            <p>© 2024 AI Project Manager Inc. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
