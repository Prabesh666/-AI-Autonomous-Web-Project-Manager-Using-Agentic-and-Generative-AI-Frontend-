import { useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';

/**
 * OAuthCallbackPage
 * ------------------
 * Handles the redirect from backend OAuth (Google / GitHub).
 *
 * Backend redirects to:
 *   /auth/success?token=JWT_TOKEN   (on success)
 *   /auth/failure?message=...       (on failure)
 */
const OAuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const { login } = useContext(AppContext);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const errorMsg = searchParams.get('message');

    if (errorMsg) {
      toast.error(`Login failed: ${decodeURIComponent(errorMsg)}`);
      navigate('/login', { replace: true });
      return;
    }

    if (token) {
      // Decode user info from the JWT payload (no secret needed — just base64)
      let userData = null;
      try {
        const payloadBase64 = token.split('.')[1];
        const decoded = JSON.parse(atob(payloadBase64));
        userData = { id: decoded.id, _id: decoded.id };
      } catch { /* ignore decode errors */ }

      login(token, userData);
      toast.success('Logged in successfully! Welcome back 🎉');
      navigate('/dashboard', { replace: true });
    } else {
      toast.error('OAuth login failed. Please try again.');
      navigate('/login', { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      gap: '1rem',
      fontFamily: 'Inter, sans-serif',
      background: 'var(--bg-main, #0f172a)',
    }}>
      <div style={{
        width: 44, height: 44,
        border: '3px solid #6366f1',
        borderTopColor: 'transparent',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ color: '#94a3b8', fontWeight: 600, fontSize: '1rem' }}>Completing sign in…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default OAuthCallbackPage;
