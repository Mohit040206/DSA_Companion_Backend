import React, { useState } from 'react';
import AppShell from '../components/layout/AppShell';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import { useToast } from '../components/common/Toast';
import {
  User,
  Briefcase,
  Calendar,
  Target,
  Award,
  Code,
  Building,
  Edit3,
  X,
  Save,
  Sparkles
} from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state initialized from user object
  const [name, setName] = useState(user?.name || '');
  const [company, setCompany] = useState(
    typeof user?.currentCompany === 'string'
      ? user.currentCompany
      : user?.currentCompany?.name || user?.company || ''
  );
  const [companyRole, setCompanyRole] = useState(
    user?.currentCompany?.role || ''
  );
  const [targetRole, setTargetRole] = useState(user?.targetRole || '');
  const [targetCompanies, setTargetCompanies] = useState(
    Array.isArray(user?.targetCompanies)
      ? user.targetCompanies.join(', ')
      : user?.targetCompanies || ''
  );
  const [techStack, setTechStack] = useState(
    Array.isArray(user?.techStack)
      ? user.techStack.join(', ')
      : user?.techStack || ''
  );
  const [preferredLanguage, setPreferredLanguage] = useState(
    user?.preferredLanguage || 'Java'
  );
  const [interviewDate, setInterviewDate] = useState(
    user?.interviewDate ? new Date(user.interviewDate).toISOString().split('T')[0] : ''
  );
  const [bio, setBio] = useState(user?.bio || '');
  const [dailyGoal, setDailyGoal] = useState(
    user?.learningProfile?.dailyGoal || user?.dailyGoal || 2
  );

  const handleOpenEdit = () => {
    setName(user?.name || '');
    setCompany(
      typeof user?.currentCompany === 'string'
        ? user.currentCompany
        : user?.currentCompany?.name || user?.company || ''
    );
    setCompanyRole(user?.currentCompany?.role || '');
    setTargetRole(user?.targetRole || '');
    setTargetCompanies(
      Array.isArray(user?.targetCompanies)
        ? user.targetCompanies.join(', ')
        : user?.targetCompanies || ''
    );
    setTechStack(
      Array.isArray(user?.techStack)
        ? user.techStack.join(', ')
        : user?.techStack || ''
    );
    setPreferredLanguage(user?.preferredLanguage || 'Java');
    setInterviewDate(
      user?.interviewDate ? new Date(user.interviewDate).toISOString().split('T')[0] : ''
    );
    setBio(user?.bio || '');
    setDailyGoal(user?.learningProfile?.dailyGoal || user?.dailyGoal || 2);
    setIsEditing(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updatedUser = await userAPI.updateProfile({
        name,
        currentCompany: { name: company, role: companyRole },
        targetRole,
        targetCompanies: targetCompanies.split(',').map((s) => s.trim()).filter(Boolean),
        techStack: techStack.split(',').map((s) => s.trim()).filter(Boolean),
        preferredLanguage,
        interviewDate: interviewDate || null,
        bio,
        dailyGoal: parseInt(dailyGoal, 10) || 2
      });

      if (updateUser) {
        updateUser(updatedUser);
      }
      showToast('Profile updated successfully!', 'success');
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      showToast('Failed to update profile.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user?.username?.slice(0, 2).toUpperCase() || 'MG';

  const companyName =
    typeof user?.currentCompany === 'string'
      ? user.currentCompany
      : user?.currentCompany?.name || user?.company || '';
  const currentRole =
    user?.currentCompany?.role || (user?.role === 'admin' ? 'Administrator' : 'Software Engineer');
  const userTechStack = Array.isArray(user?.techStack) ? user.techStack : [];

  return (
    <AppShell title="Developer Profile" crumb="Account">
      <div className="enter">
        {/* Profile Head */}
        <div className="profile-head card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div className="avatar lg">{initials}</div>
            <div>
              <h1 className="profile-name" style={{ margin: 0, fontSize: 22 }}>{user?.name || user?.username || 'Learner'}</h1>
              <div className="profile-role" style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
                {currentRole} {companyName ? `@ ${companyName}` : ''}
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Targeting: <strong style={{ color: 'var(--accent)' }}>{user?.targetRole || 'Software Engineer'}</strong>{' '}
                {user?.targetCompanies?.length > 0 && `(${user.targetCompanies.join(', ')})`}
              </div>
            </div>
          </div>

          <button className="btn btn-secondary" onClick={handleOpenEdit}>
            <Edit3 size={15} /> Edit Profile
          </button>
        </div>

        {/* Profile Stats Row */}
        <div className="profile-stats-row">
          <div className="card">
            <div className="label" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>TARGET DATE</div>
            <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              {user?.interviewDate ? new Date(user.interviewDate).toLocaleDateString() : 'Not set'}
            </div>
          </div>
          <div className="card">
            <div className="label" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>PREFERRED LANG</div>
            <div style={{ fontSize: '16px', fontWeight: 700 }}>{user?.preferredLanguage || 'Java'}</div>
          </div>
          <div className="card">
            <div className="label" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>DAILY GOAL</div>
            <div style={{ fontSize: '16px', fontWeight: 700 }}>
              {user?.learningProfile?.dailyGoal || user?.dailyGoal || 2} Problems / Day
            </div>
          </div>
          <div className="card">
            <div className="label" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>STRATEGY</div>
            <div style={{ fontSize: '15px', fontWeight: 700, textTransform: 'capitalize' }}>
              {user?.learningProfile?.preferredStrategy === 'breadth-first' ? 'Breadth-First' : 'Depth-First'}
            </div>
          </div>
        </div>

        {/* Bio & Strategy */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <div className="section-head">
            <h2>Preparation Strategy & Bio</h2>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
            {user?.bio || 'No bio specified. Click "Edit Profile" to add your career goals and preparation note!'}
          </p>

          <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '8px' }}>Primary Tech Stack:</div>
          <div className="tag-cloud">
            {userTechStack.length > 0 ? (
              userTechStack.map((t) => (
                <span key={t} className="badge badge-accent">{t}</span>
              ))
            ) : (
              <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>No tech stack specified yet.</span>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="modal-overlay open show animate-fade-in" style={{ zIndex: 9999 }}>
          <div className="modal-card" style={{ maxWidth: 540, padding: '24px 28px', position: 'relative' }}>
            <button
              className="btn-icon-subtle"
              style={{ position: 'absolute', top: 16, right: 16 }}
              onClick={() => setIsEditing(false)}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Sparkles size={18} className="text-accent" />
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Edit Developer Profile</h2>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mohit Gupta"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="form-label">Current Company</label>
                  <input
                    type="text"
                    className="input"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Google, Student, Self"
                  />
                </div>
                <div>
                  <label className="form-label">Current Role</label>
                  <input
                    type="text"
                    className="input"
                    value={companyRole}
                    onChange={(e) => setCompanyRole(e.target.value)}
                    placeholder="e.g. Software Engineer"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="form-label">Target Role</label>
                  <input
                    type="text"
                    className="input"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. SDE-2 / Systems"
                  />
                </div>
                <div>
                  <label className="form-label">Target Companies</label>
                  <input
                    type="text"
                    className="input"
                    value={targetCompanies}
                    onChange={(e) => setTargetCompanies(e.target.value)}
                    placeholder="e.g. Google, Meta, Stripe"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="form-label">Preferred Programming Lang</label>
                  <select
                    className="input"
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                  >
                    <option value="Java">Java</option>
                    <option value="Python">Python</option>
                    <option value="C++">C++</option>
                    <option value="JavaScript">JavaScript</option>
                    <option value="TypeScript">TypeScript</option>
                    <option value="Go">Go</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Target Interview Date</label>
                  <input
                    type="date"
                    className="input"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Primary Tech Stack (comma separated)</label>
                <input
                  type="text"
                  className="input"
                  value={techStack}
                  onChange={(e) => setTechStack(e.target.value)}
                  placeholder="e.g. Java, Spring Boot, React, AWS"
                />
              </div>

              <div>
                <label className="form-label">Bio & Preparation Notes</label>
                <textarea
                  className="input"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Describe your current preparation focus..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSaving}
                >
                  <Save size={15} /> {isSaving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
