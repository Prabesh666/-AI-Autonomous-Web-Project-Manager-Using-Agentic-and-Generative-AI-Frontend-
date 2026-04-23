import { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { updateMyProfile } from '../../api/profile';
import { useNavigate } from 'react-router-dom';
import './SettingsPage.css';

/* ── Toggle Switch ─────────────────────────────────── */
const Toggle = ({ checked, onChange }) => (
  <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', position: 'relative' }}>
    <input type="checkbox" checked={checked} onChange={onChange} style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }} />
    <div style={{
      width: 44, height: 24, borderRadius: 12,
      background: checked ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(156,163,175,0.3)',
      transition: 'background 0.25s', position: 'relative'
    }}>
      <div style={{
        position: 'absolute', top: 3, left: checked ? 23 : 3, width: 18, height: 18,
        borderRadius: '50%', background: '#fff', transition: 'left 0.25s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
      }} />
    </div>
  </label>
);

/* ── Row ───────────────────────────────────────────── */
const SettingRow = ({ icon, title, desc, action, border = true, isDark }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '1rem 0',
    borderBottom: border ? `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'}` : 'none'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
      <span style={{ fontSize: '1.25rem' }}>{icon}</span>
      <div>
        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: isDark ? '#f9fafb' : '#111827', margin: 0 }}>{title}</p>
        {desc && <p style={{ fontSize: '0.775rem', color: '#9ca3af', margin: '0.2rem 0 0' }}>{desc}</p>}
      </div>
    </div>
    <div style={{ flexShrink: 0, marginLeft: '1rem' }}>{action}</div>
  </div>
);

/* ── Main ──────────────────────────────────────────── */
const SettingsPage = () => {
  const { user, logout } = useContext(AppContext);
  const { theme, toggleTheme } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState('General');
  const [saving, setSaving] = useState(false);

  // Notification toggles (local preference — stored in localStorage)
  const [notifEmail,   setNotifEmail]   = useState(() => localStorage.getItem('notif_email')   !== 'false');
  const [notifAI,      setNotifAI]      = useState(() => localStorage.getItem('notif_ai')      !== 'false');
  const [notifUpdates, setNotifUpdates] = useState(() => localStorage.getItem('notif_updates') !== 'false');

  const saveNotif = (key, val) => localStorage.setItem(key, String(val));

  // Change password form
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwError, setPwError] = useState('');

  const handleChangePassword = async () => {
    setPwError('');
    if (!pwForm.current || !pwForm.newPw) { setPwError('All fields are required.'); return; }
    if (pwForm.newPw !== pwForm.confirm) { setPwError('New passwords do not match.'); return; }
    if (pwForm.newPw.length < 6) { setPwError('Password must be at least 6 characters.'); return; }
    setSaving(true);
    try {
      await updateMyProfile({ password: pwForm.newPw, currentPassword: pwForm.current });
      setPwForm({ current: '', newPw: '', confirm: '' });
      toast.success('Password updated successfully!');
    } catch (err) {
      const msg = err.message || 'Failed to update password.';
      setPwError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  /* styles */
  const bg     = isDark ? '#0f172a' : '#f8fafc';
  const card   = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff';
  const border = isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb';
  const textPri = isDark ? '#f9fafb' : '#111827';
  const textSec = isDark ? '#9ca3af' : '#6b7280';

  const tabs = [
    { id: 'General',  icon: '⚙️' },
    { id: 'Appearance', icon: '🎨' },
    { id: 'Notifications', icon: '🔔' },
    { id: 'Security', icon: '🛡️' },
  ];

  const inputStyle = {
    width: '100%', padding: '0.6rem 0.875rem', borderRadius: 8, fontSize: '0.85rem',
    border: `1px solid ${border}`, background: isDark ? 'rgba(255,255,255,0.05)' : '#f9fafb',
    color: textPri, outline: 'none', boxSizing: 'border-box'
  };

  return (
    <div style={{ display: 'flex', minHeight: '80vh', gap: 0 }}>

      {/* ── Sidebar ─────────────────────────────────── */}
      <aside style={{
        width: 220, flexShrink: 0, padding: '1.5rem 1rem',
        borderRight: `1px solid ${border}`, background: isDark ? 'rgba(255,255,255,0.02)' : '#f9fafb'
      }}>
        <p style={{ fontSize: '0.68rem', fontWeight: 700, color: textSec, textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.75rem', paddingLeft: '0.5rem' }}>
          Settings
        </p>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.625rem',
                padding: '0.6rem 0.75rem', borderRadius: 10, fontSize: '0.85rem', fontWeight: 600,
                border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                background: activeTab === tab.id ? (isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.08)') : 'transparent',
                color: activeTab === tab.id ? '#6366f1' : textSec,
              }}
            >
              <span>{tab.icon}</span> {tab.id}
            </button>
          ))}

          <div style={{ height: 1, background: border, margin: '0.75rem 0' }} />

          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.625rem',
              padding: '0.6rem 0.75rem', borderRadius: 10, fontSize: '0.85rem', fontWeight: 600,
              border: 'none', cursor: 'pointer', textAlign: 'left',
              background: 'transparent', color: '#ef4444'
            }}
          >
            <span>🚪</span> Sign Out
          </button>
        </nav>
      </aside>

      {/* ── Content ─────────────────────────────────── */}
      <div style={{ flex: 1, padding: '2rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: textPri, margin: '0 0 0.25rem' }}>{activeTab}</h1>
        <p style={{ fontSize: '0.82rem', color: textSec, margin: '0 0 1.75rem' }}>
          {activeTab === 'General' && 'Manage your account details and workspace preferences.'}
          {activeTab === 'Appearance' && 'Customize the look and feel of your workspace.'}
          {activeTab === 'Notifications' && 'Control what alerts and updates you receive.'}
          {activeTab === 'Security' && 'Manage your password and session security.'}
        </p>

        {/* ── General ────────────────────────────────── */}
        {activeTab === 'General' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Account Info */}
            <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: '1.5rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: textPri, margin: '0 0 1rem' }}>Account Information</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { label: 'Full Name', value: user?.name || '—' },
                  { label: 'Email Address', value: user?.email || '—' },
                  { label: 'Account Role', value: user?.role?.toUpperCase() || 'USER' },
                  { label: 'Account ID', value: user?._id?.substring(0, 20) + '…' || '—' },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: `1px solid ${border}` }}>
                    <span style={{ fontSize: '0.8rem', color: textSec, fontWeight: 500 }}>{row.label}</span>
                    <span style={{ fontSize: '0.82rem', color: textPri, fontWeight: 600, fontFamily: row.label === 'Account ID' ? 'monospace' : 'inherit' }}>{row.value}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate('/profile')}
                style={{
                  marginTop: '1rem', padding: '0.55rem 1.25rem', borderRadius: 8, fontSize: '0.82rem', fontWeight: 700,
                  background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', cursor: 'pointer'
                }}
              >
                Edit Profile →
              </button>
            </div>

            {/* Danger Zone */}
            <div style={{ background: isDark ? 'rgba(239,68,68,0.05)' : 'rgba(239,68,68,0.03)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 16, padding: '1.5rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#ef4444', margin: '0 0 0.5rem' }}>⚠️ Danger Zone</h3>
              <p style={{ fontSize: '0.8rem', color: textSec, margin: '0 0 1rem' }}>
                Sign out from this session. This will clear your local authentication and redirect you to the login page.
              </p>
              <button
                onClick={handleLogout}
                style={{
                  padding: '0.55rem 1.25rem', borderRadius: 8, fontSize: '0.82rem', fontWeight: 700,
                  background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer'
                }}
              >
                Sign Out of Account
              </button>
            </div>
          </div>
        )}

        {/* ── Appearance ─────────────────────────────── */}
        {activeTab === 'Appearance' && (
          <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: textPri, margin: '0 0 0.5rem' }}>Theme</h3>
            <p style={{ fontSize: '0.8rem', color: textSec, margin: '0 0 1.5rem' }}>Choose between light and dark mode for your workspace.</p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {[
                { val: 'light', label: 'Light Mode', icon: '☀️', desc: 'Clean, bright interface' },
                { val: 'dark',  label: 'Dark Mode',  icon: '🌙', desc: 'Easy on the eyes at night' },
              ].map(opt => (
                <button
                  key={opt.val}
                  onClick={() => { if (theme !== opt.val) toggleTheme(); }}
                  style={{
                    flex: 1, minWidth: 140, padding: '1.25rem', borderRadius: 12, cursor: 'pointer',
                    border: `2px solid ${theme === opt.val ? '#6366f1' : border}`,
                    background: theme === opt.val ? (isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.06)') : 'transparent',
                    transition: 'all 0.2s', textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{opt.icon}</div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 700, color: theme === opt.val ? '#6366f1' : textPri, margin: 0 }}>{opt.label}</p>
                  <p style={{ fontSize: '0.75rem', color: textSec, margin: '0.25rem 0 0' }}>{opt.desc}</p>
                  {theme === opt.val && (
                    <span style={{ marginTop: '0.5rem', display: 'inline-block', fontSize: '0.7rem', fontWeight: 700, background: '#6366f1', color: '#fff', padding: '0.15rem 0.5rem', borderRadius: 20 }}>Active</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Notifications ──────────────────────────── */}
        {activeTab === 'Notifications' && (
          <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: textPri, margin: '0 0 1rem' }}>Notification Preferences</h3>
            <SettingRow isDark={isDark} icon="✉️" title="Email Notifications" desc="Receive project and task updates via email"
              action={<Toggle checked={notifEmail} onChange={e => { setNotifEmail(e.target.checked); saveNotif('notif_email', e.target.checked); }} />} />
            <SettingRow isDark={isDark} icon="⚡" title="AI Agent Alerts" desc="Get notified when your AI pipeline completes or fails"
              action={<Toggle checked={notifAI} onChange={e => { setNotifAI(e.target.checked); saveNotif('notif_ai', e.target.checked); }} />} />
            <SettingRow isDark={isDark} icon="🔔" title="Product Updates" desc="Stay informed about new features and improvements" border={false}
              action={<Toggle checked={notifUpdates} onChange={e => { setNotifUpdates(e.target.checked); saveNotif('notif_updates', e.target.checked); }} />} />
          </div>
        )}

        {/* ── Security ───────────────────────────────── */}
        {activeTab === 'Security' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Change Password */}
            <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: '1.5rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: textPri, margin: '0 0 1rem' }}>🔒 Change Password</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { label: 'Current Password', key: 'current', type: 'password' },
                  { label: 'New Password',      key: 'newPw',   type: 'password' },
                  { label: 'Confirm Password',  key: 'confirm', type: 'password' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: textSec, display: 'block', marginBottom: 4 }}>{f.label}</label>
                    <input
                      type={f.type}
                      value={pwForm[f.key]}
                      onChange={e => setPwForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      style={inputStyle}
                      placeholder="••••••••"
                    />
                  </div>
                ))}
                {pwError && <p style={{ fontSize: '0.78rem', color: '#ef4444', margin: 0 }}>{pwError}</p>}
                <button
                  onClick={handleChangePassword}
                  disabled={saving}
                  style={{
                    padding: '0.65rem', borderRadius: 10, fontWeight: 700, fontSize: '0.85rem',
                    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff',
                    border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
                    marginTop: '0.25rem'
                  }}
                >
                  {saving ? 'Updating…' : '🔐 Update Password'}
                </button>
              </div>
            </div>

            {/* Session */}
            <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: '1.5rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: textPri, margin: '0 0 1rem' }}>💻 Active Session</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: '0.85rem', color: textPri, fontWeight: 600, margin: 0 }}>Current Browser Session</p>
                  <p style={{ fontSize: '0.78rem', color: textSec, margin: '0.25rem 0 0' }}>Signed in as {user?.email}</p>
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.65rem', borderRadius: 20, background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>Active</span>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  marginTop: '1rem', padding: '0.5rem 1.25rem', borderRadius: 8, fontSize: '0.82rem', fontWeight: 700,
                  background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer'
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
