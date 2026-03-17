import { useState } from 'react';
import './SettingsPage.css';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('General');

  const tabs = [
    { id: 'General', icon: '⚙️' },
    { id: 'Security', icon: '🛡️' },
    { id: 'Billing', icon: '💳' }
  ];

  return (
    <div className="settings-page-wrapper">
      {/* Sidebar for settings (optional inner navigation) */}
      <aside className="settings-sidebar">
        <h3 className="settings-sidebar-title">SETTINGS</h3>
        <nav className="settings-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`settings-nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="settings-nav-icon">{tab.icon}</span>
              {tab.id}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Settings Content */}
      <div className="settings-content-area">
        <header className="settings-header">
          <h1 className="settings-title">Settings</h1>
          <p className="settings-subtitle">Manage your workspace identity, security preferences, and subscription billing.</p>
        </header>

        {activeTab === 'General' && (
          <div className="settings-section">
            <div className="section-header">
              <h2>General Settings</h2>
              <p>Update your workspace name, branding and regional preferences.</p>
            </div>

            <div className="settings-card">
              <div className="general-settings-content">
                <div className="logo-upload-section">
                  <div className="logo-placeholder">
                    <span className="logo-icon">🏢</span>
                  </div>
                  <button className="btn-link">Change Logo</button>
                </div>

                <div className="form-grid-wrapper">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Workspace Name</label>
                      <input type="text" defaultValue="Workspace AI" />
                    </div>
                    <div className="form-group">
                      <label>Workspace URL</label>
                      <div className="input-group">
                        <span className="input-prefix">workspace.ai/</span>
                        <input type="text" defaultValue="design-team" />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Timezone</label>
                      <select defaultValue="EST">
                        <option value="EST">Eastern Time (ET) - UTC-5</option>
                        <option value="PST">Pacific Time (PT) - UTC-8</option>
                        <option value="UTC">Coordinated Universal Time (UTC)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Date Format</label>
                      <select defaultValue="DD/MM/YYYY">
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-actions">
                <button className="btn-primary">Save Changes</button>
              </div>
            </div>

            <div className="section-header mt-4">
              <h2>Security</h2>
              <p>Manage your password, 2FA and active sessions.</p>
            </div>

            <div className="settings-card security-card">
              <div className="security-row">
                <div className="security-info">
                  <span className="security-icon">🔒</span>
                  <div>
                    <span className="security-title">Password</span>
                    <p className="security-desc">Last changed 3 months ago</p>
                  </div>
                </div>
                <button className="btn-secondary">Change Password</button>
              </div>

              <div className="security-row">
                <div className="security-info">
                  <span className="security-icon success">🛡️</span>
                  <div>
                    <span className="security-title">Two-factor Authentication</span>
                    <p className="security-desc">Add an extra layer of security to your account.</p>
                  </div>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="security-row">
                <div className="security-info">
                  <span className="security-icon">💻</span>
                  <div>
                    <span className="security-title">Active Sessions</span>
                    <p className="security-desc">You are currently logged in on 3 devices.</p>
                  </div>
                </div>
                <button className="btn-text-danger">Logout of all other devices</button>
              </div>
            </div>

            <div className="section-header mt-4">
              <h2>Billing & Subscription</h2>
              <p>Manage your subscription plan and payment information.</p>
            </div>

            <div className="billing-grid">
              <div className="settings-card billing-card">
                <span className="plan-badge">CURRENT PLAN</span>
                <div className="plan-price-row">
                  <h3 className="plan-name">Pro Plan</h3>
                  <div className="plan-price">
                    <span className="amount">$29</span>
                    <span className="period">/mo</span>
                  </div>
                </div>
                <p className="plan-desc">Billed monthly. Next payment on Nov 10, 2023.</p>
                <ul className="plan-features">
                  <li><span className="check">✓</span> Unlimited Projects</li>
                  <li><span className="check">✓</span> AI Assistant Pro Features</li>
                  <li><span className="check">✓</span> Priority Support</li>
                </ul>
                <button className="btn-primary full-width">Upgrade Plan</button>
              </div>

              <div className="settings-card payment-card-wrapper">
                <div className="payment-card">
                  <h3 className="card-title">Payment Method</h3>
                  <div className="payment-method-box">
                    <div className="card-info">
                      <span className="card-icon">💳</span>
                      <div>
                        <span className="card-number">Visa ending in 4242</span>
                        <p className="card-expiry">Expires 12/24</p>
                      </div>
                    </div>
                    <button className="btn-icon">✏️</button>
                  </div>
                  <div className="payment-actions">
                    <button className="btn-link">View Billing History</button>
                    <button className="btn-link update-addr">Update Address</button>
                  </div>
                </div>
                
                <p className="billing-address-desc">
                  Your billing address is 123 Innovation Dr, San Francisco, CA 94103.
                </p>
              </div>
            </div>

            <div className="settings-card danger-zone mt-4">
              <div className="danger-content">
                <h3 className="danger-title">Delete Workspace</h3>
                <p className="danger-desc">
                  Permanently remove this workspace and all associated data. This action cannot be undone.
                </p>
              </div>
              <button className="btn-danger">Delete Permanently</button>
            </div>
          </div>
        )}

        {/* Placeholders for other tabs */}
        {activeTab === 'Security' && (
          <div className="settings-section">
            <h2>Security Settings</h2>
            <p>Security preferences will appear here.</p>
          </div>
        )}
        
        {activeTab === 'Billing' && (
          <div className="settings-section">
            <h2>Billing & Subscription</h2>
            <p>Full billing details will appear here.</p>
          </div>
        )}

        <footer className="settings-footer">
          <p>© 2023 AI Project Manager Inc. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default SettingsPage;
