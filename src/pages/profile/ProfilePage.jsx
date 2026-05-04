import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { getMyProfile, updateMyProfile } from '../../api/profile';
import './ProfilePage.css';

/* ── Avatar initials fallback ───────────────────────── */
const AVATAR_EMOJIS = ['👨‍💼', '👩‍💼', '👨‍💻', '👩‍💻', '👨‍🚀', '👩‍🚀', '🕵️‍♂️', '🥷'];

const Initials = ({ name, emoji, size = 96 }) => {
  if (emoji) {
    return (
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.7, flexShrink: 0, /* Increased avatar emoji size inside the circle */
        boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
      }}>
        {emoji}
      </div>
    );
  }

  const letters = (name || 'U')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 800, color: '#fff', flexShrink: 0,
      letterSpacing: 1
    }}>
      {letters}
    </div>
  );
};

/* ── Stat Card ──────────────────────────────────────── */
const StatCard = ({ label, value, icon, color, isDark }) => (
  <div style={{
    background: isDark ? 'rgba(255,255,255,0.04)' : '#f9fafb',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb'}`,
    borderRadius: 14, padding: '1rem 1.25rem',
    display: 'flex', flexDirection: 'column', gap: 4
  }}>
    <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</p>
    <p style={{ fontSize: '1.6rem', fontWeight: 800, color, margin: 0 }}>{value ?? '—'}</p>
    <p style={{ fontSize: '1.1rem', margin: 0 }}>{icon}</p>
  </div>
);

/* ── Main Component ─────────────────────────────────── */
const ProfilePage = () => {
  const { user: ctxUser, login } = useContext(AppContext);
  const { theme } = useTheme();
  const toast = useToast();
  const isDark = theme === 'dark';

  const [profile, setProfile]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [editing, setEditing]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [form, setForm]           = useState({});
  const [activeTab, setActiveTab] = useState('Profile Information');

  const tabs = ['Profile Information', 'AI Usage', 'Security'];

  /* colours */
  const bg        = isDark ? '#0f172a' : '#f8fafc';
  const card      = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff';
  const border    = isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb';
  const textPri   = isDark ? '#f9fafb' : '#111827';
  const textSec   = isDark ? '#9ca3af' : '#6b7280';

  const [avatarEmoji, setAvatarEmoji] = useState(() => localStorage.getItem('userAvatarEmoji') || null);

  const handleEmojiSelect = (emoji) => {
    if (avatarEmoji === emoji) {
       localStorage.removeItem('userAvatarEmoji');
       setAvatarEmoji(null);
    } else {
       localStorage.setItem('userAvatarEmoji', emoji);
       setAvatarEmoji(emoji);
    }
    window.dispatchEvent(new Event('avatarUpdate'));
  };

  /* Load profile */
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getMyProfile();
        const p = data?.data || data;
        setProfile(p);
        setForm({
          name:       p.name       || '',
          jobTitle:   p.jobTitle   || '',
          department: p.department || '',
          bio:        p.bio        || '',
          phone:      p.phone      || '',
          location:   p.location   || '',
        });
      } catch (err) {
        // Fallback to ctx user
        if (ctxUser) {
          setProfile(ctxUser);
          setForm({ name: ctxUser.name || '', jobTitle: '', department: '', bio: '', phone: '', location: '' });
        }
        toast.error('Could not load profile from server.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = await updateMyProfile(form);
      const updated = data?.data || data;
      setProfile(prev => ({ ...prev, ...updated }));
      
      // 🔄 Sync with Global Context to update Navbar/Sidebar instantly
      if (ctxUser) {
        login(localStorage.getItem('token'), { ...ctxUser, ...updated });
      }
      setEditing(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid rgba(99,102,241,0.2)', borderTopColor: '#6366f1', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: textSec, fontSize: '0.85rem' }}>Loading your profile…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const stats = profile?.stats || {};
  const aiPct = stats.aiQuota ? Math.round((stats.aiUsage / stats.aiQuota) * 100) : 0;

  return (
    <div style={{ padding: '1.5rem 2rem', maxWidth: 1000, margin: '0 auto' }}>

      {/* ── Hero Card ─────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%)',
        borderRadius: 20, padding: '2rem', marginBottom: '1.5rem',
        boxShadow: '0 8px 32px rgba(99,102,241,0.3)', position: 'relative', overflow: 'hidden'
      }}>
        {/* Decorative blob */}
        <div style={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', right: 60, bottom: -60, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', position: 'relative' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' }}>
            <Initials name={profile?.name} emoji={avatarEmoji} size={88} />
            {/* Show Emoji selector when editing */}
            {editing && (
              <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.15)', padding: '0.5rem', borderRadius: 28, flexWrap: 'wrap', justifyContent: 'center' }}>
                {AVATAR_EMOJIS.map(em => (
                  <button key={em} onClick={() => handleEmojiSelect(em)} style={{
                    background: avatarEmoji === em ? '#fff' : 'transparent',
                    border: 'none', borderRadius: '50%', width: 52, height: 52, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2rem', transition: 'all 0.2s', padding: 0,
                    boxShadow: avatarEmoji === em ? '0 6px 16px rgba(0,0,0,0.35)' : 'none'
                  }}>{em}</button>
                ))}
              </div>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              {profile?.name || 'Anonymous User'}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', margin: '0.2rem 0 0', fontSize: '0.9rem' }}>
              {profile?.jobTitle || 'AI Project Manager'} {profile?.department ? `· ${profile.department}` : ''}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.7)', margin: '0.2rem 0 0', fontSize: '0.82rem' }}>
              ✉️ {profile?.email}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <span style={{
              padding: '0.3rem 0.9rem', borderRadius: 20,
              background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
              color: '#fff', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8
            }}>
              {profile?.role || 'user'}
            </span>
            <button
              onClick={() => setEditing(!editing)}
              style={{
                padding: '0.4rem 1rem', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700,
                border: '2px solid rgba(255,255,255,0.5)', background: editing ? '#fff' : 'transparent',
                color: editing ? '#6366f1' : '#fff', cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              {editing ? '✕ Cancel' : '✏️ Edit Profile'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.25rem', background: card, border: `1px solid ${border}`, borderRadius: 12, padding: '0.25rem' }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1, padding: '0.55rem 1rem', borderRadius: 10, fontSize: '0.82rem', fontWeight: 600,
              border: 'none', cursor: 'pointer', transition: 'all 0.2s',
              background: activeTab === tab ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'transparent',
              color: activeTab === tab ? '#fff' : textSec,
              boxShadow: activeTab === tab ? '0 2px 8px rgba(99,102,241,0.3)' : 'none'
            }}
          >{tab}</button>
        ))}
      </div>

      {/* ── Tab: Profile Information ───────────────────── */}
      {activeTab === 'Profile Information' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          {/* Left: Edit form or view */}
          <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: textPri, margin: '0 0 1.25rem' }}>Personal Details</h3>

            {editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {[
                  { label: 'Full Name', key: 'name', placeholder: 'Your full name' },
                  { label: 'Job Title', key: 'jobTitle', placeholder: 'e.g. AI Project Manager' },
                  { label: 'Department', key: 'department', placeholder: 'e.g. Product Development' },
                  { label: 'Phone', key: 'phone', placeholder: '+1 (555) 000-0000' },
                  { label: 'Location', key: 'location', placeholder: 'City, Country' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: textSec, display: 'block', marginBottom: 4 }}>{f.label}</label>
                    <input
                      value={form[f.key] || ''}
                      onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      style={{
                        width: '100%', padding: '0.55rem 0.875rem', borderRadius: 8, fontSize: '0.85rem',
                        border: `1px solid ${border}`, background: isDark ? 'rgba(255,255,255,0.05)' : '#f9fafb',
                        color: textPri, outline: 'none', boxSizing: 'border-box'
                      }}
                    />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: textSec, display: 'block', marginBottom: 4 }}>Bio</label>
                  <textarea
                    rows={3}
                    value={form.bio || ''}
                    onChange={e => setForm(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about yourself..."
                    style={{
                      width: '100%', padding: '0.55rem 0.875rem', borderRadius: 8, fontSize: '0.85rem',
                      border: `1px solid ${border}`, background: isDark ? 'rgba(255,255,255,0.05)' : '#f9fafb',
                      color: textPri, outline: 'none', resize: 'vertical', boxSizing: 'border-box'
                    }}
                  />
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    padding: '0.65rem', borderRadius: 10, fontWeight: 700, fontSize: '0.85rem',
                    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff',
                    border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1
                  }}
                >
                  {saving ? 'Saving…' : '💾 Save Changes'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {[
                  { label: 'Full Name',   value: profile?.name },
                  { label: 'Email',       value: profile?.email },
                  { label: 'Job Title',   value: profile?.jobTitle   || '—' },
                  { label: 'Department',  value: profile?.department || '—' },
                  { label: 'Phone',       value: profile?.phone      || '—' },
                  { label: 'Location',    value: profile?.location   || '—' },
                  { label: 'Member Since', value: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—' },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.6rem', borderBottom: `1px solid ${border}` }}>
                    <span style={{ fontSize: '0.78rem', color: textSec, fontWeight: 500 }}>{row.label}</span>
                    <span style={{ fontSize: '0.85rem', color: textPri, fontWeight: 600 }}>{row.value}</span>
                  </div>
                ))}
                {profile?.bio && (
                  <div style={{ paddingTop: '0.25rem' }}>
                    <p style={{ fontSize: '0.75rem', color: textSec, fontWeight: 500, marginBottom: 4 }}>Bio</p>
                    <p style={{ fontSize: '0.83rem', color: textPri, lineHeight: 1.6, margin: 0 }}>{profile.bio}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Quick Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: '1.5rem' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: textPri, margin: '0 0 1.25rem' }}>Quick Stats</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <StatCard label="Projects" value={stats.projectCount ?? 0} icon="📁" color="#6366f1" isDark={isDark} />
                <StatCard label="Total Tasks" value={stats.taskCount ?? 0} icon="✅" color="#10b981" isDark={isDark} />
                <StatCard label="AI Runs Used" value={stats.aiUsage ?? 0} icon="⚡" color="#f59e0b" isDark={isDark} />
                <StatCard label="AI Quota Left" value={(stats.aiQuota ?? 10) - (stats.aiUsage ?? 0)} icon="🎯" color="#8b5cf6" isDark={isDark} />
              </div>
            </div>

            <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: '1.5rem' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: textPri, margin: '0 0 0.75rem' }}>Account Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  { label: 'Account ID', value: profile?._id?.substring(0,16) + '…' },
                  { label: 'Role', value: profile?.role?.toUpperCase() },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.78rem', color: textSec }}>{r.label}</span>
                    <span style={{ fontSize: '0.78rem', color: textPri, fontWeight: 600, fontFamily: 'monospace' }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: AI Usage ──────────────────────────────── */}
      {activeTab === 'AI Usage' && (
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: '1.75rem' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: textPri, margin: '0 0 1.5rem' }}>AI Resource Usage</h3>
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: '0.82rem', color: textSec, fontWeight: 500 }}>Pipeline Runs</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: textPri }}>{stats.aiUsage ?? 0} / {stats.aiQuota ?? 10}</span>
            </div>
            <div style={{ height: 10, background: isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 999, transition: 'width 0.6s ease',
                width: `${Math.min(aiPct, 100)}%`,
                background: aiPct > 80 ? 'linear-gradient(90deg,#ef4444,#f97316)' : 'linear-gradient(90deg,#6366f1,#8b5cf6)'
              }} />
            </div>
            <p style={{ fontSize: '0.73rem', color: textSec, marginTop: 6 }}>
              {aiPct < 80 ? `${100 - aiPct}% quota remaining this cycle` : '⚠️ Quota nearly exhausted — contact admin to top up'}
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <StatCard label="Runs Used" value={stats.aiUsage ?? 0} icon="🔥" color="#f59e0b" isDark={isDark} />
            <StatCard label="Quota" value={stats.aiQuota ?? 10} icon="🎯" color="#6366f1" isDark={isDark} />
            <StatCard label="Remaining" value={(stats.aiQuota ?? 10) - (stats.aiUsage ?? 0)} icon="✅" color="#10b981" isDark={isDark} />
          </div>
        </div>
      )}

      {/* ── Tab: Security ──────────────────────────────── */}
      {activeTab === 'Security' && (
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: '1.75rem' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: textPri, margin: '0 0 1.25rem' }}>Security Settings</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { label: 'Two-Factor Authentication', value: 'Not configured', status: 'warn' },
              { label: 'Password Strength', value: 'Strong', status: 'ok' },
              { label: 'Session Tokens', value: 'Active JWT session', status: 'ok' },
            ].map(row => (
              <div key={row.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.75rem 1rem', borderRadius: 10,
                background: isDark ? 'rgba(255,255,255,0.03)' : '#f9fafb', border: `1px solid ${border}`
              }}>
                <span style={{ fontSize: '0.85rem', color: textPri, fontWeight: 500 }}>{row.label}</span>
                <span style={{
                  fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.65rem', borderRadius: 20,
                  background: row.status === 'ok' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                  color: row.status === 'ok' ? '#10b981' : '#f59e0b'
                }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default ProfilePage;
