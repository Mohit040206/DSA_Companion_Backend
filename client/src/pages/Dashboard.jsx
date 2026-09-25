import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import { problemAPI, revisionAPI, attemptAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import {
  ArrowRight,
  Flame,
  CheckCircle2,
  Clock,
  RotateCcw,
  Target,
  Zap,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [problems, setProblems] = useState([]);
  const [revisions, setRevisions] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [probs, revs, atts] = await Promise.all([
          problemAPI.getAll(),
          revisionAPI.getAll(),
          attemptAPI.getAll()
        ]);
        setProblems(probs || []);
        setRevisions(revs || []);
        setAttempts(atts || []);
      } catch (err) {
        console.error('Error loading dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const solvedCount = problems.filter(p => p.status === 'Solved').length;
  const targetProblem = problems.find(p => p.id === 'subarray-sum-equals-k') || problems[0];

  return (
    <AppShell title="Dashboard" crumb="Prepare">
      <div className="enter">
        <h1 className="greeting">Good morning, {user?.first || 'Mohit'} 👋</h1>
        <p className="greeting-sub">
          {user?.daysRemaining || 18} days remaining until your target interview. Focus today: Prefix Sum & HashMaps.
        </p>

        {/* Hero Recommended Action */}
        <div className="hero-action">
          <div className="hero-action-content">
            <div className="hero-tag">
              <span className="pulse-dot"></span> RECOMMENDED PRACTICE TODAY
            </div>
            <h1>{targetProblem?.title || 'Subarray Sum Equals K'}</h1>
            <div className="meta-row">
              <span className="hero-meta-item">
                Difficulty: <span className="v" style={{ color: 'var(--warning)' }}>{targetProblem?.difficulty || 'Medium'}</span>
              </span>
              <span className="hero-meta-item">
                Pattern: <span className="v">Prefix Sum + HashMap</span>
              </span>
              <span className="hero-meta-item">
                Est. Time: <span className="v">{targetProblem?.estimatedTime || '25 min'}</span>
              </span>
            </div>
            <p className="note">
              {targetProblem?.learningObjectives || 'Use a prefix-sum + hashmap combo to count subarrays in a single linear pass.'}
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link to={`/problems/${targetProblem?.id || 'subarray-sum-equals-k'}`} className="btn btn-primary">
                Start Problem <ArrowRight size={16} />
              </Link>
              <Link to="/interview-mode" className="btn btn-secondary">
                Mock Exam Mode
              </Link>
            </div>
          </div>
        </div>

        {/* Stat Cards Strip */}
        <div className="stat-strip">
          <div className="stat-card">
            <div className="label">Solved Problems</div>
            <div className="value">
              {solvedCount} <small>/ {problems.length || 8}</small>
            </div>
            <div className="delta">
              <TrendingUp size={12} /> +3 this week
            </div>
          </div>

          <div className="stat-card">
            <div className="label">Active Study Streak</div>
            <div className="value" style={{ color: 'var(--warning)' }}>
              7 <small>days 🔥</small>
            </div>
            <div className="delta">Best streak: 12 days</div>
          </div>

          <div className="stat-card">
            <div className="label">Revisions Due</div>
            <div className="value" style={{ color: 'var(--danger)' }}>
              {revisions.filter(r => r.status === 'overdue' || r.status === 'today').length || 2} <small>pending</small>
            </div>
            <div className="delta" style={{ color: 'var(--text-muted)' }}>
              1 overdue, 1 today
            </div>
          </div>

          <div className="stat-card">
            <div className="label">Target Countdown</div>
            <div className="value" style={{ color: 'var(--accent)' }}>
              18 <small>days</small>
            </div>
            <div className="delta" style={{ color: 'var(--text-muted)' }}>
              Target: Oct 7, 2026
            </div>
          </div>
        </div>

        {/* 2 Column Layout */}
        <div className="two-col-layout">
          {/* Left Column: Revision Queue & Pattern Mastery */}
          <div>
            <div className="card" style={{ marginBottom: '22px' }}>
              <div className="section-head">
                <h2>Spaced Repetition Queue</h2>
                <Link to="/revisions" className="see-all">View all ({revisions.length})</Link>
              </div>

              {revisions.slice(0, 3).map((rev) => {
                const prob = problems.find(p => p.id === rev.problemId) || { title: rev.problemId };
                const isOverdue = rev.status === 'overdue';
                return (
                  <div
                    key={rev.id}
                    className="card-row"
                    onClick={() => navigate(`/problems/${rev.problemId}`)}
                  >
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div className={`rev-status-dot ${isOverdue ? 'overdue' : ''}`} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14.5px' }}>{prob.title}</div>
                        <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                          {rev.reason} • Focus: {rev.focus}
                        </div>
                      </div>
                    </div>
                    <div className="row-action">
                      Start <ArrowRight size={14} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="card">
              <div className="section-head">
                <h2>Pattern Mastery</h2>
                <Link to="/patterns" className="see-all">View details</Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    <span>HashMap (11/14 solved)</span>
                    <span style={{ color: 'var(--success)' }}>78% Strong</span>
                  </div>
                  <div className="pbar">
                    <div className="pbar-fill tone-success" style={{ width: '78%' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    <span>Sliding Window (6/9 solved)</span>
                    <span style={{ color: 'var(--accent)' }}>66% Practicing</span>
                  </div>
                  <div className="pbar">
                    <div className="pbar-fill" style={{ width: '66%' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    <span>Graphs (2/5 solved)</span>
                    <span style={{ color: 'var(--danger)' }}>40% Needs Attention</span>
                  </div>
                  <div className="pbar">
                    <div className="pbar-fill tone-danger" style={{ width: '40%' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    <span>Dynamic Programming (1/4 solved)</span>
                    <span style={{ color: 'var(--danger)' }}>25% Needs Attention</span>
                  </div>
                  <div className="pbar">
                    <div className="pbar-fill tone-danger" style={{ width: '25%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Target Journey & Recent Activity */}
          <div>
            <div className="card" style={{ marginBottom: '22px' }}>
              <div className="section-head">
                <h2>Interview Prep Roadmap</h2>
              </div>
              <div className="journey-strip">
                <div className="journey-node">
                  <div className="journey-dot done">✓</div>
                  <div className="journey-label">Baseline</div>
                </div>
                <div className="journey-node">
                  <div className="journey-dot done">✓</div>
                  <div className="journey-label">Patterns</div>
                </div>
                <div className="journey-node">
                  <div className="journey-dot current">
                    <Zap size={13} />
                  </div>
                  <div className="journey-label">Spaced Rep</div>
                </div>
                <div className="journey-node">
                  <div className="journey-dot">
                    <Target size={13} />
                  </div>
                  <div className="journey-label">Mocks</div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="section-head">
                <h2>Recent Activity Log</h2>
                <Link to="/attempts" className="see-all">History</Link>
              </div>

              <div className="timeline">
                {attempts.slice(0, 4).map((att) => {
                  const prob = problems.find(p => p.id === att.problemId) || { title: att.problemId };
                  const isClean = att.outcome === 'Solved';
                  const isHints = att.outcome === 'Solved with hints';
                  return (
                    <div
                      key={att.id}
                      className="timeline-item"
                      onClick={() => navigate(`/attempts/${att.id}`)}
                    >
                      <div className={`timeline-dot ${isClean ? 'tone-success' : isHints ? 'tone-warning' : 'tone-danger'}`} />
                      <div className="timeline-card">
                        <div className="tl-top">
                          <div className="tl-title">{prob.title}</div>
                          <div className="tl-time">{att.when}</div>
                        </div>
                        <div className="desc">{att.approach || att.algorithm}</div>
                        <div className="tl-meta">
                          <span className={`badge ${isClean ? 'badge-success' : isHints ? 'badge-warning' : 'badge-danger'}`}>
                            {att.outcome}
                          </span>
                          <span className="badge badge-neutral">{att.durationMin || 25} min</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
