import React, { useState } from 'react';
import AppShell from '../components/layout/AppShell';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/common/Toast';
import { Sun, Moon, Monitor, Save, Shield } from 'lucide-react';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || 'Mohit Gupta',
    role: user?.role || 'Software Engineer',
    targetRole: user?.targetRole || 'SDE-2 / Backend',
    interviewDate: user?.interviewDate || '2026-10-07',
    preferredLanguage: user?.preferredLanguage || 'JavaScript'
  });

  const handleSave = (e) => {
    e.preventDefault();
    updateUser(formData);
    showToast('Settings saved successfully!', 'success');
  };

  return (
    <AppShell title="Settings & Preferences" crumb="Account">
      <div className="enter">
        <div className="settings-layout">
          {/* Settings Nav */}
          <div className="settings-nav">
            <div className="settings-nav-item active">General & Appearance</div>
            <div className="settings-nav-item">Study Goals</div>
            <div className="settings-nav-item">Account & Password</div>
          </div>

          {/* Main Settings Panel */}
          <div>
            {/* Appearance Section */}
            <div className="settings-section card">
              <h2>Appearance & Theme</h2>
              <div className="sub">Customize the visual theme of Interview Companion.</div>

              <div className="theme-choice-row">
                <div
                  className={`theme-choice ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => setTheme('light')}
                >
                  <Sun /> Light Mode
                </div>
                <div
                  className={`theme-choice ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => setTheme('dark')}
                >
                  <Moon /> Dark Mode
                </div>
                <div
                  className={`theme-choice ${theme === 'system' ? 'active' : ''}`}
                  onClick={() => setTheme('system')}
                >
                  <Monitor /> System Theme
                </div>
              </div>
            </div>

            {/* Profile & Goals Form */}
            <div className="settings-section card">
              <h2>Account & Interview Goals</h2>
              <div className="sub">Update your target companies, role, and interview target date.</div>

              <form onSubmit={handleSave}>
                <div className="field">
                  <label>Full Name</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="field">
                    <label>Current Role</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    />
                  </div>

                  <div className="field">
                    <label>Target Role</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.targetRole}
                      onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="field">
                    <label>Target Interview Date</label>
                    <input
                      type="date"
                      className="input"
                      value={formData.interviewDate}
                      onChange={(e) => setFormData({ ...formData, interviewDate: e.target.value })}
                    />
                  </div>

                  <div className="field">
                    <label>Preferred Code Language</label>
                    <select
                      className="input"
                      value={formData.preferredLanguage}
                      onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
                    >
                      <option value="JavaScript">JavaScript</option>
                      <option value="TypeScript">TypeScript</option>
                      <option value="Python">Python</option>
                      <option value="Java">Java</option>
                      <option value="C++">C++</option>
                    </select>
                  </div>
                </div>

                {/* Toggles */}
                <div className="settings-row">
                  <div>
                    <div className="rt">Spaced Repetition Notifications</div>
                    <div className="rd">Receive daily reminders for overdue revision cards.</div>
                  </div>
                  <label className="switch">
                    <input type="checkbox" defaultChecked />
                    <span className="track"><span className="thumb"></span></span>
                  </label>
                </div>

                <div className="settings-row">
                  <div>
                    <div className="rt">Auto-queue Low Confidence Attempts</div>
                    <div className="rd">Automatically add attempts rated &le; 2 stars to revision queue.</div>
                  </div>
                  <label className="switch">
                    <input type="checkbox" defaultChecked />
                    <span className="track"><span className="thumb"></span></span>
                  </label>
                </div>

                <div style={{ marginTop: '24px' }}>
                  <button type="submit" className="btn btn-primary">
                    <Save size={15} /> Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
