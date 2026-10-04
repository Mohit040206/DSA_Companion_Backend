import React, { useState } from 'react';
import AppShell from '../components/layout/AppShell';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/common/Toast';
import { userAPI, authAPI } from '../services/api';
import { Sun, Moon, Monitor, Save, Lock, User, Target, ShieldCheck, Key } from 'lucide-react';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'goals' | 'account'

  // General & Appearance Form State
  const [generalData, setGeneralData] = useState({
    name: user?.name || '',
    currentCompanyRole: user?.currentCompany?.role || '',
    targetRole: user?.targetRole || '',
    interviewDate: user?.interviewDate ? new Date(user.interviewDate).toISOString().split('T')[0] : '',
    preferredLanguage: user?.preferredLanguage || 'Java'
  });

  // Study Goals Form State
  const [goalsData, setGoalsData] = useState({
    dailyGoal: user?.learningProfile?.dailyGoal || user?.dailyGoal || 2,
    preferredStrategy: user?.learningProfile?.preferredStrategy || 'depth-first',
    reminderNotification: user?.settings?.reminderNotification !== false,
    autoQueueLowConfidence: true
  });

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [savingGeneral, setSavingGeneral] = useState(false);
  const [savingGoals, setSavingGoals] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Save General Profile
  const handleSaveGeneral = async (e) => {
    e.preventDefault();
    try {
      setSavingGeneral(true);
      const updatedUser = await userAPI.updateProfile({
        name: generalData.name,
        currentCompany: {
          name: user?.currentCompany?.name || '',
          role: generalData.currentCompanyRole
        },
        targetRole: generalData.targetRole,
        interviewDate: generalData.interviewDate || null,
        preferredLanguage: generalData.preferredLanguage
      });

      if (updatedUser) {
        updateUser(updatedUser);
      }
      showToast('Profile & appearance settings saved!', 'success');
    } catch (err) {
      console.error('Failed to save settings:', err);
      showToast(err.response?.data?.message || 'Failed to save settings', 'error');
    } finally {
      setSavingGeneral(false);
    }
  };

  // Save Study Goals
  const handleSaveGoals = async (e) => {
    e.preventDefault();
    try {
      setSavingGoals(true);
      const updatedUser = await userAPI.updateProfile({
        dailyGoal: parseInt(goalsData.dailyGoal, 10),
        preferredLanguage: generalData.preferredLanguage
      });

      if (updatedUser) {
        updateUser(updatedUser);
      }
      showToast('Study goals updated successfully!', 'success');
    } catch (err) {
      console.error('Failed to save study goals:', err);
      showToast(err.response?.data?.message || 'Failed to save study goals', 'error');
    } finally {
      setSavingGoals(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      showToast('Please fill in both current and new passwords.', 'error');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      showToast('New password must be at least 6 characters long.', 'error');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }

    try {
      setChangingPassword(true);
      const res = await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      showToast(res.message || 'Password changed successfully!', 'success');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error('Failed to change password:', err);
      showToast(err.response?.data?.message || 'Failed to change password.', 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <AppShell title="Settings & Preferences" crumb="Account">
      <div className="enter">
        <div className="settings-layout">
          {/* Settings Nav Sidebar */}
          <div className="settings-nav">
            <button
              type="button"
              className={`settings-nav-item ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveTab('general')}
              style={{ display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left', width: '100%', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <User size={16} /> General & Appearance
            </button>

            <button
              type="button"
              className={`settings-nav-item ${activeTab === 'goals' ? 'active' : ''}`}
              onClick={() => setActiveTab('goals')}
              style={{ display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left', width: '100%', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <Target size={16} /> Study Goals
            </button>

            <button
              type="button"
              className={`settings-nav-item ${activeTab === 'account' ? 'active' : ''}`}
              onClick={() => setActiveTab('account')}
              style={{ display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left', width: '100%', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <Lock size={16} /> Account & Password
            </button>
          </div>

          {/* Main Settings Panel Content */}
          <div>
            {/* TAB 1: General & Appearance */}
            {activeTab === 'general' && (
              <>
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

                <div className="settings-section card">
                  <h2>Account & Interview Goals</h2>
                  <div className="sub">Update your target companies, role, and interview target date.</div>

                  <form onSubmit={handleSaveGeneral}>
                    <div className="field">
                      <label>Full Name</label>
                      <input
                        type="text"
                        className="input"
                        value={generalData.name}
                        onChange={(e) => setGeneralData({ ...generalData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div className="field">
                        <label>Current Role</label>
                        <input
                          type="text"
                          className="input"
                          value={generalData.currentCompanyRole}
                          placeholder="e.g. Software Engineer, SDE-1"
                          onChange={(e) => setGeneralData({ ...generalData, currentCompanyRole: e.target.value })}
                        />
                      </div>

                      <div className="field">
                        <label>Target Role</label>
                        <input
                          type="text"
                          className="input"
                          value={generalData.targetRole}
                          placeholder="e.g. Senior SDE, Backend Specialist"
                          onChange={(e) => setGeneralData({ ...generalData, targetRole: e.target.value })}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div className="field">
                        <label>Target Interview Date</label>
                        <input
                          type="date"
                          className="input"
                          value={generalData.interviewDate}
                          onChange={(e) => setGeneralData({ ...generalData, interviewDate: e.target.value })}
                        />
                      </div>

                      <div className="field">
                        <label>Preferred Code Language</label>
                        <select
                          className="input"
                          value={generalData.preferredLanguage}
                          onChange={(e) => setGeneralData({ ...generalData, preferredLanguage: e.target.value })}
                        >
                          <option value="JavaScript">JavaScript</option>
                          <option value="TypeScript">TypeScript</option>
                          <option value="Python">Python</option>
                          <option value="Java">Java</option>
                          <option value="C++">C++</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ marginTop: '24px' }}>
                      <button type="submit" className="btn btn-primary" disabled={savingGeneral}>
                        <Save size={15} /> {savingGeneral ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </>
            )}

            {/* TAB 2: Study Goals */}
            {activeTab === 'goals' && (
              <div className="settings-section card">
                <h2>DSA Study Goals & Strategy</h2>
                <div className="sub">Configure your daily targets, learning pace, and automated notifications.</div>

                <form onSubmit={handleSaveGoals}>
                  <div className="field">
                    <label>Daily Problem Target</label>
                    <select
                      className="input"
                      value={goalsData.dailyGoal}
                      onChange={(e) => setGoalsData({ ...goalsData, dailyGoal: e.target.value })}
                    >
                      <option value={1}>1 Problem per Day (Casual Pace)</option>
                      <option value={2}>2 Problems per Day (Recommended / Balanced)</option>
                      <option value={3}>3 Problems per Day (Intensive Preparation)</option>
                      <option value={5}>5 Problems per Day (Bootcamp Speed)</option>
                    </select>
                  </div>

                  <div className="field">
                    <label>Preferred AI Recommendation Strategy</label>
                    <select
                      className="input"
                      value={goalsData.preferredStrategy}
                      onChange={(e) => setGoalsData({ ...goalsData, preferredStrategy: e.target.value })}
                    >
                      <option value="depth-first">Depth-First Mastery (Focus on weak patterns until strong)</option>
                      <option value="breadth-first">Breadth-First Exploration (Cover diverse unattempted patterns)</option>
                    </select>
                  </div>

                  <div className="settings-row" style={{ marginTop: 20 }}>
                    <div>
                      <div className="rt">Spaced Repetition Notifications</div>
                      <div className="rd">Receive reminders for overdue revision cards in your dashboard.</div>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={goalsData.reminderNotification}
                        onChange={(e) => setGoalsData({ ...goalsData, reminderNotification: e.target.checked })}
                      />
                      <span className="track"><span className="thumb"></span></span>
                    </label>
                  </div>

                  <div className="settings-row">
                    <div>
                      <div className="rt">Auto-queue Low Confidence Attempts</div>
                      <div className="rd">Automatically add attempts rated &le; 2 stars to revision queue.</div>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={goalsData.autoQueueLowConfidence}
                        onChange={(e) => setGoalsData({ ...goalsData, autoQueueLowConfidence: e.target.checked })}
                      />
                      <span className="track"><span className="thumb"></span></span>
                    </label>
                  </div>

                  <div style={{ marginTop: '24px' }}>
                    <button type="submit" className="btn btn-primary" disabled={savingGoals}>
                      <Save size={15} /> {savingGoals ? 'Saving...' : 'Save Study Goals'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 3: Account & Password */}
            {activeTab === 'account' && (
              <>
                <div className="settings-section card">
                  <h2>Account Details</h2>
                  <div className="sub">Your verified account information and status.</div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: 12 }}>
                    <div className="field">
                      <label>Username</label>
                      <input type="text" className="input" value={user?.username || ''} disabled style={{ opacity: 0.7 }} />
                    </div>

                    <div className="field">
                      <label>Email Address</label>
                      <input type="email" className="input" value={user?.email || ''} disabled style={{ opacity: 0.7 }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span className="badge badge-neutral">Role: {user?.role === 'admin' ? 'Administrator' : 'Learner'}</span>
                    <span className="badge badge-success">Status: Active</span>
                  </div>
                </div>

                <div className="settings-section card">
                  <h2>Change Password</h2>
                  <div className="sub">Update your account password securely.</div>

                  <form onSubmit={handleChangePassword}>
                    <div className="field">
                      <label>Current Password</label>
                      <input
                        type="password"
                        className="input"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        placeholder="Enter your current password"
                        required
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div className="field">
                        <label>New Password</label>
                        <input
                          type="password"
                          className="input"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          placeholder="Min 6 characters"
                          required
                        />
                      </div>

                      <div className="field">
                        <label>Confirm New Password</label>
                        <input
                          type="password"
                          className="input"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          placeholder="Re-enter new password"
                          required
                        />
                      </div>
                    </div>

                    <div style={{ marginTop: '24px' }}>
                      <button type="submit" className="btn btn-primary" disabled={changingPassword}>
                        <Key size={15} /> {changingPassword ? 'Updating Password...' : 'Update Password'}
                      </button>
                    </div>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
