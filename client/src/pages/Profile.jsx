import React from 'react';
import AppShell from '../components/layout/AppShell';
import { useAuth } from '../context/AuthContext';
import { User, Briefcase, Calendar, Target, Award, Code, Building } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();

  return (
    <AppShell title="Developer Profile" crumb="Account">
      <div className="enter">
        <div className="profile-head card">
          <div className="avatar lg">{user?.initials || 'MG'}</div>
          <div>
            <h1 className="profile-name">{user?.name || 'Mohit Gupta'}</h1>
            <div className="profile-role">
              {user?.role || 'Software Engineer'} @ {user?.company || 'Razorpay'}
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Targeting: <strong style={{ color: 'var(--accent)' }}>{user?.targetRole || 'SDE-2 / Backend'}</strong> (Meta, Stripe, Google)
            </div>
          </div>
        </div>

        {/* Profile Stats Row */}
        <div className="profile-stats-row">
          <div className="card">
            <div className="label" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>TARGET DATE</div>
            <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{user?.interviewDate || '2026-10-07'}</div>
          </div>
          <div className="card">
            <div className="label" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>PREFERRED LANG</div>
            <div style={{ fontSize: '16px', fontWeight: 700 }}>{user?.preferredLanguage || 'JavaScript'}</div>
          </div>
          <div className="card">
            <div className="label" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>DAILY GOAL</div>
            <div style={{ fontSize: '16px', fontWeight: 700 }}>{user?.dailyGoal || 1} Problem / Day</div>
          </div>
          <div className="card">
            <div className="label" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>WEEKLY GOAL</div>
            <div style={{ fontSize: '16px', fontWeight: 700 }}>{user?.weeklyGoal || 5} Problems / Wk</div>
          </div>
        </div>

        {/* Bio & Strategy */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <div className="section-head">
            <h2>Preparation Strategy & Bio</h2>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
            {user?.bio || 'Backend-leaning full-stack engineer prepping for a jump to a bigger systems role.'}
          </p>

          <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '8px' }}>Primary Tech Stack:</div>
          <div className="tag-cloud">
            {(user?.techStack || ['Node.js', 'TypeScript', 'PostgreSQL', 'React', 'AWS']).map(t => (
              <span key={t} className="badge badge-accent">{t}</span>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
