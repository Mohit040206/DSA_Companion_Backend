import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import { problemAPI, revisionAPI, attemptAPI, aiAPI } from '../services/api';
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
  AlertCircle,
  Sparkles,
  BookOpen,
  Compass,
  Sliders,
  Brain
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [problems, setProblems] = useState([]);
  const [revisions, setRevisions] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [aiData, setAiData] = useState(null);
  const [memoryData, setMemoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customizingPlan, setCustomizingPlan] = useState(false);

  const fetchDashboardData = async () => {
    try {
      // Step 1: Fetch fast core stats & problems in parallel
      const [probs, revs, atts] = await Promise.all([
        problemAPI.getAll({ all: true }),
        revisionAPI.getAll({ all: true }),
        attemptAPI.getAll({ all: true })
      ]);
      setProblems(Array.isArray(probs) ? probs : []);
      setRevisions(Array.isArray(revs) ? revs : []);
      setAttempts(Array.isArray(atts) ? atts : []);
      setLoading(false); // ⚡ Release initial loading state immediately

      // Step 2: Fetch slower AI recommendations & Memory in background without blocking UI
      Promise.all([
        aiAPI.getRecommendations().catch(() => null),
        aiAPI.getMemory().catch(() => null)
      ]).then(([aiRecs, mem]) => {
        if (aiRecs) setAiData(aiRecs);
        if (mem) setMemoryData(mem);
      });

      // Non-toxic background consistency milestone notification
      const uniqueDays = new Set(
        (Array.isArray(atts) ? atts : []).map(a => a.createdAt ? new Date(a.createdAt).toDateString() : null).filter(Boolean)
      ).size;
      if (uniqueDays >= 3) {
        const milestoneKey = `ic_milestone_${uniqueDays}`;
        if (!sessionStorage.getItem(milestoneKey)) {
          sessionStorage.setItem(milestoneKey, '1');
          showToast(`🎉 Wow! You've logged ${uniqueDays} days of continuous problem-solving. Incredible momentum — let's keep moving step by step!`, 'success');
        }
      }
    } catch (err) {
      console.error('Error loading dashboard data', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const solvedCount = problems.filter(p => p.status === 'Solved').length;
  const targetProblem = aiData?.recommendedProblem || problems.find(p => p.id === 'two-sum') || problems[0];
  const targetPattern = aiData?.targetPattern || 'HashMap';
  const dailyPlan = aiData?.dailyPlan || [];
  const patternExposure = aiData?.patternExposure || [];

  return (
    <AppShell title="Dashboard" crumb="Prepare" openOnboarding={customizingPlan} setOpenOnboarding={setCustomizingPlan}>
      <div className="enter">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
          <div>
            <h1 className="greeting">Welcome back, {user?.name ? user.name.split(' ')[0] : 'Engineer'} 👋</h1>
            <p className="greeting-sub" style={{ marginBottom: 0 }}>
              AI Target Strategy: <strong>{aiData?.learningProfile?.preferredStrategy === 'breadth-first' ? 'Breadth-First Exploration' : 'Depth-First Mastery'}</strong> • Focus Pattern: <strong>{targetPattern}</strong>
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setCustomizingPlan(true)}>
            <Sliders size={14} /> Customize Learning Plan
          </button>
        </div>

        {/* Big Brother Coach Greeting */}
        {aiData?.coachGreeting && (
          <div
            style={{
              padding: '12px 16px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              borderRadius: 'var(--r-md)',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}
          >
            <Sparkles size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
            <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>
              <strong style={{ color: 'var(--accent)' }}>Big Brother Coach: </strong>
              {aiData.coachGreeting}
            </div>
          </div>
        )}

        {/* Hero Recommended Action (AI Engine Router) */}
        <div className="hero-action">
          <div className="hero-action-content">
            <div className="hero-tag">
              <span className="pulse-dot"></span> AI RECOMMENDED PRACTICE TODAY
            </div>
            <h1>{targetProblem?.title || 'Two Sum'}</h1>
            <div className="meta-row">
              <span className="hero-meta-item">
                Difficulty: <span className="v" style={{ color: targetProblem?.difficulty === 'Hard' ? 'var(--danger)' : targetProblem?.difficulty === 'Medium' ? 'var(--warning)' : 'var(--success)' }}>{targetProblem?.difficulty || 'Easy'}</span>
              </span>
              <span className="hero-meta-item">
                Pattern: <span className="v">{targetProblem?.patterns?.[0] || targetPattern}</span>
              </span>
              <span className="hero-meta-item">
                Est. Time: <span className="v">{targetProblem?.estimatedTime || 20} min</span>
              </span>
            </div>
            <p className="note">
              {targetProblem?.learningObjectives?.[0] || 'Master pattern recognition and write optimal linear time solution.'}
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link to={`/problems/${targetProblem?._id || targetProblem?.id}`} className="btn btn-primary">
                Start Problem <ArrowRight size={16} />
              </Link>
              <Link to="/interview-mode" className="btn btn-secondary">
                Mock Exam Mode
              </Link>
            </div>
          </div>
        </div>

        {/* AI Daily Checklist & Memory Highlights Banner */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          {/* Daily Plan Target */}
          <div className="card">
            <div className="section-head" style={{ marginBottom: 12 }}>
              <h2 style={{ fontSize: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Target size={16} className="text-accent" /> Today's Action Plan ({dailyPlan.length} Target)
              </h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {dailyPlan.length > 0 ? (
                dailyPlan.map((item, idx) => (
                  <div
                    key={idx}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--surface-2)', borderRadius: 'var(--r-md)', fontSize: 13 }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
                        <span style={{ fontWeight: 600 }}>{item.title}</span>
                        {item.isDoubleRevision && (
                          <span style={{ fontSize: 10.5, fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: 'rgba(236, 72, 153, 0.15)', color: '#EC4899', border: '1px solid rgba(236, 72, 153, 0.3)' }}>
                            Revise 2x
                          </span>
                        )}
                      </div>
                      {item.coachReason && (
                        <div style={{ fontSize: 11.5, color: 'var(--text-muted)', paddingLeft: 26 }}>
                          💡 {item.coachReason}
                        </div>
                      )}
                    </div>
                    {item.problemId && (
                      <Link to={`/problems/${item.problemId}`} className="btn btn-tertiary btn-sm" style={{ padding: '2px 8px', fontSize: 11, flexShrink: 0 }}>
                        Solve <ArrowRight size={12} />
                      </Link>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', padding: '12px 0' }}>
                  No tasks scheduled. Click "Customize Learning Plan" to generate your daily target!
                </div>
              )}
            </div>
          </div>

          {/* Factual Memory Highlights */}
          <div className="card">
            <div className="section-head" style={{ marginBottom: 12 }}>
              <h2 style={{ fontSize: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Brain size={16} className="text-accent" /> Factual Memory Engine
              </h2>
            </div>
            {memoryData?.timeline && memoryData.timeline.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {memoryData.timeline.slice(0, 2).map((mem) => (
                  <div key={mem.id} style={{ padding: '10px 12px', background: 'var(--surface-2)', borderRadius: 'var(--r-md)', fontSize: 12.5 }}>
                    <div style={{ fontWeight: 700, color: mem.type === 'breakthrough' ? 'var(--success)' : 'var(--warning)', marginBottom: 2 }}>
                      {mem.title}
                    </div>
                    <div style={{ color: 'var(--text-secondary)' }}>{mem.summary}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', padding: '12px 0' }}>
                Complete attempts and reflections to unlock factual memory insights!
              </div>
            )}
          </div>
        </div>

        {/* Stat Cards Strip */}
        <div className="stat-strip">
          <div className="stat-card">
            <div className="label">Solved Problems</div>
            <div className="value">
              {solvedCount} <small>/ {problems.length}</small>
            </div>
            <div className="delta">
              <TrendingUp size={12} /> Real user progress
            </div>
          </div>

          <div className="stat-card">
            <div className="label">Patterns Explored</div>
            <div className="value" style={{ color: 'var(--accent)' }}>
              {patternExposure.filter(p => p.status !== 'Unexplored').length} <small>/ {patternExposure.length || 31} active</small>
            </div>
            <div className="delta">Pattern-based learning</div>
          </div>

          <div className="stat-card">
            <div className="label">Revisions Due</div>
            <div className="value" style={{ color: revisions.length > 0 ? 'var(--danger)' : 'var(--success)' }}>
              {revisions.filter(r => r.status === 'Pending' || r.status === 'overdue' || r.status === 'today').length} <small>pending</small>
            </div>
            <div className="delta" style={{ color: 'var(--text-muted)' }}>
              Spaced repetition queue
            </div>
          </div>

          <div className="stat-card">
            <div className="label">Target Pace</div>
            <div className="value" style={{ color: 'var(--success)' }}>
              {aiData?.learningProfile?.dailyGoal || 2} <small>probs/day</small>
            </div>
            <div className="delta" style={{ color: 'var(--text-muted)' }}>
              Strategy: {aiData?.learningProfile?.preferredStrategy || 'depth-first'}
            </div>
          </div>
        </div>

        {/* 2 Column Layout */}
        <div className="two-col-layout">
          {/* Left Column: Revision Queue & Dynamic Pattern Mastery */}
          <div>
            <div className="card" style={{ marginBottom: '22px' }}>
              <div className="section-head">
                <h2>Spaced Repetition Queue</h2>
                <Link to="/revisions" className="see-all">View all ({revisions.length})</Link>
              </div>

              {revisions.length > 0 ? (
                revisions.slice(0, 3).map((rev) => {
                  const prob = problems.find(p => p._id === rev.problemId || p.id === rev.problemId) || { title: 'Revision Question' };
                  const isOverdue = rev.status === 'overdue' || rev.status === 'Pending';
                  return (
                    <div
                      key={rev._id || rev.id}
                      className="card-row"
                      onClick={() => navigate(`/problems/${rev.problemId}`)}
                    >
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div className={`rev-status-dot ${isOverdue ? 'overdue' : ''}`} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '14.5px' }}>{prob.title || 'Revision Task'}</div>
                          <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                            {rev.reason || 'Pattern revisit'} • Focus: {rev.focus || 'Reinforce core formula'}
                          </div>
                        </div>
                      </div>
                      <div className="row-action">
                        Start <ArrowRight size={14} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '12px 0' }}>
                  No revisions currently pending. Clean attempts!
                </div>
              )}
            </div>

            <div className="card">
              <div className="section-head">
                <h2>Pattern Exposure & Mastery</h2>
                <Link to="/patterns" className="see-all">View details</Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {patternExposure.length > 0 ? (
                  patternExposure.slice(0, 4).map((pat) => {
                    const isUnexplored = pat.status === 'Unexplored';
                    const isStrong = pat.status === 'Strong';
                    const isAttention = pat.status === 'Needs Attention';
                    return (
                      <div key={pat.name}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                          <span>{pat.name} ({pat.solved}/{pat.total} solved)</span>
                          <span className={`badge ${isUnexplored ? 'badge-neutral' : isStrong ? 'badge-success' : isAttention ? 'badge-danger' : 'badge-warning'}`}>
                            {pat.status}
                          </span>
                        </div>
                        <div className="pbar">
                          <div
                            className={`pbar-fill ${isStrong ? 'tone-success' : isAttention ? 'tone-danger' : ''}`}
                            style={{ width: `${isUnexplored ? 0 : pat.successRatio}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '12px 0' }}>
                    Loading pattern statistics...
                  </div>
                )}
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

              {attempts.length > 0 ? (
                <div className="timeline">
                  {attempts.slice(0, 4).map((att) => {
                    const prob = (typeof att.problemId === 'object' && att.problemId !== null)
                      ? att.problemId
                      : (problems.find(p => p._id === att.problemId || p.id === att.problemId) || { title: 'Problem Attempt' });
                    const isClean = att.outcome === 'Solved';
                    const isHints = att.outcome === 'SolvedWithHints' || att.outcome === 'Solved with hints';
                    return (
                      <div
                        key={att._id || att.id}
                        className="timeline-item"
                        onClick={() => navigate(`/attempts/${att._id || att.id}`)}
                      >
                        <div className={`timeline-dot ${isClean ? 'tone-success' : isHints ? 'tone-warning' : 'tone-danger'}`} />
                        <div className="timeline-card">
                          <div className="tl-top">
                            <div className="tl-title">{prob.title}</div>
                            <div className="tl-time">{att.createdAt ? new Date(att.createdAt).toLocaleDateString() : 'Recent'}</div>
                          </div>
                          <div className="desc">{att.approach || att.keyInsight || 'Logged attempt'}</div>
                          <div className="tl-meta">
                            <span className={`badge ${isClean ? 'badge-success' : isHints ? 'badge-warning' : 'badge-danger'}`}>
                              {att.outcome || 'Attempted'}
                            </span>
                            <span className="badge badge-neutral">Conf: {att.confidence || 4}/5</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '16px 0', textAlign: 'center' }}>
                  No attempts recorded yet. Click "Start Problem" above to begin your journey!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
