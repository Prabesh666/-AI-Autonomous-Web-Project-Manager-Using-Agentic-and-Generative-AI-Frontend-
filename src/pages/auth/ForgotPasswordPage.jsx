import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestOtp, verifyOtp, resetPasswordWithOtp } from '../../api/auth';
import { AppContext } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const navigate = useNavigate();
  const { login } = useContext(AppContext);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await requestOtp(email);
      setSuccessMsg('A 6-digit recovery code has been sent to your email.');
      setStep(2);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send OTP. Please ensure the email is correct.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await verifyOtp({ email, otp });
      setSuccessMsg('Code verified. Please enter your new password.');
      setStep(3);
    } catch (err) {
      setErrorMsg(err.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const result = await resetPasswordWithOtp({ email, otp, password: newPassword });
      setSuccessMsg(result.message || 'Password reset successfully!');
      
      if (result.success && result.data?.token) {
        login(result.data.token, result.data.user);
        navigate('/dashboard');
      } else {
        throw new Error('No token received from server.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to reset password. Please try again.');
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
            Securely recover<br />your account<br />access.
          </h1>

          <p className="sidebar-subtitle">
            Regain control with our advanced OTP verification system to ensure your projects remain secure.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Form */}
      <div className="login-form-section">
        <div className="form-wrapper">
          <div className="form-header">
            <h2>Reset Password</h2>
            {step === 1 && <p className="form-subtitle">Enter your email address to receive a 6-digit recovery code.</p>}
            {step === 2 && <p className="form-subtitle">Speed through recovery with your secure email code.</p>}
            {step === 3 && <p className="form-subtitle">Create a strong new password for your account.</p>}
          </div>

          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="auth-form">
              {errorMsg && <div className="error-alert">{errorMsg}</div>}
              {successMsg && <div className="success-alert">{successMsg}</div>}

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Sending Request...' : 'Send Recovery Code'}
              </button>
              
              <p className="signup-link" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                Remember your password? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Log in</a>
              </p>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="auth-form">
              {errorMsg && <div className="error-alert">{errorMsg}</div>}
              {successMsg && <div className="success-alert">{successMsg}</div>}

              <div className="form-group">
                <div className="password-labels">
                  <label htmlFor="otp">6-Digit Recovery Code</label>
                  <a href="#" className="forgot-link" onClick={() => { setStep(1); setOtp(''); }}>Wrong email?</a>
                </div>
                <input
                  type="text"
                  id="otp"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  style={{ letterSpacing: '0.5rem', textAlign: 'center', fontSize: '1.25rem', fontFamily: 'monospace' }}
                  required
                />
              </div>

              <button type="submit" className="submit-btn" disabled={loading || otp.length < 6}>
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="auth-form">
              {errorMsg && <div className="error-alert">{errorMsg}</div>}
              {successMsg && <div className="success-alert">{successMsg}</div>}

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <div className="password-input-wrapper">
                  <input
                    type="password"
                    id="newPassword"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <button type="button" className="eye-icon">👁</button>
                </div>
              </div>

              <button type="submit" className="submit-btn" disabled={loading || newPassword.length < 6}>
                {loading ? 'Resetting...' : 'Reset Password & Log In'}
              </button>
            </form>
          )}

          <div className="footer-links">
            <p>© 2024 AI Project Manager Inc. All rights reserved.</p>
            <p><a href="#">Privacy Policy</a> • <a href="#">Terms of Service</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
