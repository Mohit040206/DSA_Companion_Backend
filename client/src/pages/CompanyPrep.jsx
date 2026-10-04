import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import { companyPrepAPI } from '../services/api';
import { useToast } from '../components/common/Toast';
import {
  Building2,
  Calendar,
  Briefcase,
  Search,
  RefreshCw,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Brain,
  Globe,
  Sliders,
  Clock,
  Layers,
  Check
} from 'lucide-react';

const COMMON_COMPANIES = ['Amazon', 'Google', 'Meta', 'Microsoft', 'Uber', 'Razorpay', 'Atlassian', 'Flipkart'];
const COMMON_ROLES = ['SDE-1', 'Backend Engineer', 'Senior SDE', 'Fullstack Engineer'];

export default function CompanyPrep() {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [activeWeekFilter, setActiveWeekFilter] = useState('all'); // 'all' | 1 | 2 ...

  // Form State
  const [company, setCompany] = useState('Amazon');
  const [role, setRole] = useState('SDE-1');
  const [interviewDate, setInterviewDate] = useState('');

  const fetchPlan = async () => {
    try {
      setLoading(true);
      const data = await companyPrepAPI.getPlan();
      if (data) {
        setPlan(data);
        setCompany(data.company || 'Amazon');
        setRole(data.role || 'SDE-1');
        if (data.interviewDate) {
          setInterviewDate(new Date(data.interviewDate).toISOString().split('T')[0]);
        }
      } else {
        setShowConfigModal(true);
      }
    } catch (err) {
      console.error('Failed to load company prep plan:', err);
      showToast('Failed to load company preparation plan', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, []);

  const handleGeneratePlan = async (e) => {
    if (e) e.preventDefault();
    if (!company.trim()) {
      showToast('Please specify a target company', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const updatedPlan = await companyPrepAPI.createPlan({
        company: company.trim(),
        role: role.trim() || 'Software Engineer',
        interviewDate: interviewDate || null
      });
      setPlan(updatedPlan);
      setShowConfigModal(false);
      showToast(`🎯 Personalized prep plan generated for ${company}!`, 'success');
    } catch (err) {
      console.error('Error generating plan:', err);
      showToast(err.response?.data?.message || 'Failed to generate plan', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefreshPlan = async () => {
    try {
      setRefreshing(true);
      const updatedPlan = await companyPrepAPI.refreshPlan();
      setPlan(updatedPlan);
      showToast('🔄 Plan recalculated with latest performance data!', 'success');
    } catch (err) {
      console.error('Error refreshing plan:', err);
      showToast(err.response?.data?.message || 'Failed to recalculate plan', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  // Helper to compute human timeline string
  const getTimelineString = () => {
    if (!plan?.interviewDate) return null;
    const target = new Date(plan.interviewDate);
    const now = new Date();
    const diffTime = target.getTime() - now.getTime();
    if (diffTime <= 0) return 'Passed / Today';
    
    const weeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
    const months = Math.round((diffTime / (1000 * 60 * 60 * 24 * 30.44)) * 10) / 10;

    if (months >= 2) {
      return `~${months} Months away (${weeks} Weeks)`;
    }
    return `~${weeks} Weeks away`;
  };

  const timelineString = getTimelineString();
  const displayedWeeks = plan?.weeklyPlan
    ? activeWeekFilter === 'all'
      ? plan.weeklyPlan
      : plan.weeklyPlan.filter((w) => w.weekNumber === parseInt(activeWeekFilter, 10))
    : [];

  return (
    <AppShell title="Company Preparation Engine" crumb="Company Prep">
      <div className="enter">
        {/* Header Strip */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
          <div>
            <h1 className="greeting" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Building2 className="text-accent" size={28} />
              Company Preparation Engine
            </h1>
            <p className="greeting-sub" style={{ marginBottom: 0 }}>
              Real Web Research + AI Evaluation Insights + Personalized Spaced Repetition Roadmap
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {plan && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleRefreshPlan}
                disabled={refreshing}
              >
                <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
                {refreshing ? 'Recalculating...' : 'Recalculate Plan'}
              </button>
            )}
            <button className="btn btn-primary btn-sm" onClick={() => setShowConfigModal(true)}>
              <Sliders size={14} /> {plan ? 'Edit Target' : 'Set Target Company'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
            <div className="pulse-dot" style={{ margin: '0 auto 12px' }} />
            Loading Company Preparation Context & Web Research...
          </div>
        ) : !plan ? (
          /* Empty / Onboarding State */
          <div className="card" style={{ padding: 40, textAlign: 'center', maxWidth: 640, margin: '40px auto' }}>
            <Building2 size={48} className="text-accent" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: 20, marginBottom: 8 }}>Target Your Next Engineering Role</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
              Select a target company and role. We perform real web research on public interview reports and combine it with your actual pattern mastery, AI evaluation history, and memory engine.
            </p>
            <button className="btn btn-primary btn-lg" onClick={() => setShowConfigModal(true)}>
              Set Target Company & Role <ArrowRight size={18} />
            </button>
          </div>
        ) : (
          /* Main Dashboard Layout */
          <>
            {/* Target Overview Hero Card */}
            <div className="hero-action" style={{ marginBottom: 24, padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <div className="hero-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <ShieldCheck size={14} /> ACTIVE TARGET PREPARATION
                  </div>
                  <h1 style={{ fontSize: 28, marginTop: 6, marginBottom: 8 }}>
                    {plan.company} — <span style={{ color: 'var(--accent)' }}>{plan.role}</span>
                  </h1>
                  <div className="meta-row">
                    <span className="hero-meta-item">
                      Interview Target: <span className="v">{plan.interviewDate ? new Date(plan.interviewDate).toLocaleDateString() : 'Flexible'}</span>
                      {timelineString && (
                        <span className="badge badge-accent" style={{ marginLeft: 8, fontSize: 11 }}>
                          <Clock size={11} style={{ marginRight: 4 }} /> {timelineString}
                        </span>
                      )}
                    </span>
                    <span className="hero-meta-item">
                      Research Status:{' '}
                      <span className="v" style={{ color: plan.researchStatus === 'SUCCESS' ? 'var(--success)' : 'var(--warning)' }}>
                        {plan.researchStatus === 'SUCCESS' ? '🌐 Live Web Research Verified' : '⚠️ Limited Web Data (Fallback Mode)'}
                      </span>
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <div className="badge badge-neutral" style={{ padding: '6px 12px', fontSize: 13 }}>
                    Target Patterns: {plan.companyResearch?.targetPatterns?.slice(0, 3).join(', ') || 'HashMap, Sliding Window'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Difficulty: {plan.companyResearch?.difficultyDistribution?.easyPct || 20}% Easy / {plan.companyResearch?.difficultyDistribution?.mediumPct || 60}% Med / {plan.companyResearch?.difficultyDistribution?.hardPct || 20}% Hard
                  </div>
                </div>
              </div>

              {/* Long-timeline Banner Explanation */}
              {timelineString && timelineString.includes('Months') && (
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: 12.5, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Calendar size={15} className="text-accent" />
                  <span>
                    Your interview target is <strong>{timelineString}</strong>. The roadmap displays your <strong>Active Phase 1 Sprint ({plan.weeklyPlan?.length || 12} Weeks Focus)</strong>. As you solve problems and progress, your plan automatically recalculates for future phases.
                  </span>
                </div>
              )}
            </div>

            {/* Research & Provenance Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
              {/* Public Web Research & Provenance Sources */}
              <div className="card">
                <div className="section-head" style={{ marginBottom: 12 }}>
                  <h2 style={{ fontSize: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Globe size={16} className="text-accent" /> Public Research & Sources Provenance
                  </h2>
                </div>
                <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 12 }}>
                  {plan.companyResearch?.interviewProcessNotes || 'Reported interview rounds extracted from public candidate experiences.'}
                </p>

                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>
                  Verified Sources Metadata ({plan.companyResearch?.sources?.length || 0})
                </div>
                {plan.companyResearch?.sources && plan.companyResearch.sources.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {plan.companyResearch.sources.map((src, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: 'var(--surface-2)', borderRadius: 'var(--r-md)', fontSize: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                          <span className={`badge ${src.sourceType === 'OFFICIAL' ? 'badge-success' : 'badge-neutral'}`} style={{ fontSize: 10 }}>
                            {src.sourceType}
                          </span>
                          <span style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 220 }}>
                            {src.title}
                          </span>
                        </div>
                        {src.url && (
                          <a href={src.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            Visit <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No external source links retrieved for this target.</div>
                )}
              </div>

              {/* Publicly Reported Questions Disclaimer Card */}
              <div className="card">
                <div className="section-head" style={{ marginBottom: 12 }}>
                  <h2 style={{ fontSize: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <BookOpen size={16} className="text-accent" /> Community Reported Questions
                  </h2>
                </div>
                <div style={{ padding: '8px 12px', background: 'rgba(234, 179, 8, 0.1)', border: '1px solid var(--warning)', borderRadius: 'var(--r-md)', fontSize: 12, color: 'var(--warning)', marginBottom: 12 }}>
                  <strong>Disclaimer:</strong> Listed questions are publicly reported by candidate community reports and are NOT official or guaranteed company interview questions.
                </div>

                {plan.companyResearch?.publiclyReportedQuestions && plan.companyResearch.publiclyReportedQuestions.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {plan.companyResearch.publiclyReportedQuestions.map((q, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: 'var(--surface-2)', borderRadius: 'var(--r-md)', fontSize: 12 }}>
                        <div>
                          <span style={{ fontWeight: 600 }}>{q.title}</span>
                          <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>({q.platform || 'LeetCode'})</span>
                        </div>
                        <span className="badge badge-neutral" style={{ fontSize: 11 }}>{q.frequency || 'Reported'}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', padding: '12px 0' }}>
                    No specific public question titles surfaced. System will focus on high-probability company patterns.
                  </div>
                )}
              </div>
            </div>

            {/* Weekly Adaptive Plan Roadmap Header & Navigation Tabs */}
            <div className="section-head" style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h2 style={{ fontSize: 18, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Layers size={18} className="text-accent" />
                  Personalized Preparation Roadmap ({plan.weeklyPlan?.length || 0} Weeks)
                </h2>
                <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                  Recalculated dynamically based on your actual problem solved history & AI evaluations.
                </span>
              </div>

              {/* Week Navigation Filter Pill Tabs */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className={`badge ${activeWeekFilter === 'all' ? 'badge-accent' : 'badge-neutral'}`}
                  style={{ cursor: 'pointer', padding: '6px 12px', fontSize: 12 }}
                  onClick={() => setActiveWeekFilter('all')}
                >
                  All Weeks ({plan.weeklyPlan?.length || 0})
                </button>
                {plan.weeklyPlan && plan.weeklyPlan.map((w) => (
                  <button
                    key={w.weekNumber}
                    type="button"
                    className={`badge ${activeWeekFilter === String(w.weekNumber) ? 'badge-accent' : 'badge-neutral'}`}
                    style={{ cursor: 'pointer', padding: '6px 10px', fontSize: 12 }}
                    onClick={() => setActiveWeekFilter(String(w.weekNumber))}
                  >
                    W{w.weekNumber}
                  </button>
                ))}
              </div>
            </div>

            {/* Render Selected / All Weeks */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {displayedWeeks.map((week) => (
                <div key={week.weekNumber} className="card" style={{ borderLeft: '4px solid var(--accent)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
                    <div>
                      <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>{week.title}</h3>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0' }}>{week.objective}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span className="badge badge-neutral">Difficulty: {week.difficultyLevel}</span>
                      <span className="badge badge-accent">Target: {week.targetPatterns?.join(', ')}</span>
                    </div>
                  </div>

                  {/* Dual Rationale Breakdown */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16, background: 'var(--surface-2)', padding: 12, borderRadius: 'var(--r-md)' }}>
                    <div style={{ fontSize: 12.5 }}>
                      <div style={{ fontWeight: 700, color: 'var(--accent)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Globe size={14} /> Company Research Rationale
                      </div>
                      <div style={{ color: 'var(--text-secondary)' }}>{week.companyResearchReason}</div>
                    </div>
                    <div style={{ fontSize: 12.5 }}>
                      <div style={{ fontWeight: 700, color: 'var(--success)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Brain size={14} /> Personal Performance & AI Eval Rationale
                      </div>
                      <div style={{ color: 'var(--text-secondary)' }}>{week.personalPerformanceReason}</div>
                    </div>
                  </div>

                  {/* Recommended DB Problems */}
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase' }}>
                      Curated Practice Problems ({week.recommendedProblemIds?.length || 0})
                    </div>
                    {week.recommendedProblemIds && week.recommendedProblemIds.length > 0 ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                        {week.recommendedProblemIds.map((prob) => (
                          <div
                            key={prob._id}
                            style={{
                              padding: '12px 14px',
                              background: 'var(--surface-1)',
                              border: '1px solid var(--border)',
                              borderRadius: 'var(--r-md)',
                              display: 'flex',
                              alignItems: 'center',
                              justify: 'space-between',
                              gap: 12
                            }}
                          >
                            <div style={{ overflow: 'hidden' }}>
                              <div style={{ fontWeight: 600, fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {prob.title}
                              </div>
                              <div style={{ fontSize: 11.5, color: 'var(--text-muted)', display: 'flex', gap: 8, marginTop: 4, alignItems: 'center' }}>
                                <span style={{ fontWeight: 700, color: prob.difficulty === 'Hard' ? 'var(--danger)' : prob.difficulty === 'Medium' ? 'var(--warning)' : 'var(--success)' }}>
                                  {prob.difficulty}
                                </span>
                                • <span>{prob.patterns?.[0] || 'Core Pattern'}</span>
                              </div>
                            </div>
                            <Link to={`/problems/${prob._id}`} className="btn btn-tertiary btn-sm" style={{ padding: '4px 10px', fontSize: 11, flexShrink: 0 }}>
                              Solve <ArrowRight size={12} />
                            </Link>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '8px 0' }}>
                        General pattern study and revision focus for this week.
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Configuration Modal */}
        {showConfigModal && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}>
            <div className="card enter" style={{ width: '100%', maxWidth: 500, padding: 28, boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
              <h2 style={{ fontSize: 20, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Building2 size={22} className="text-accent" /> Configure Preparation Target
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
                Specify target company, role, and interview date. Web search queries will fetch recent interview reports.
              </p>

              <form onSubmit={handleGeneratePlan}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 6 }}>Target Company</label>
                  <input
                    type="text"
                    className="input"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Amazon, Google, Meta, Razorpay"
                    required
                  />
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                    {COMMON_COMPANIES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        className={`badge ${company === c ? 'badge-accent' : 'badge-neutral'}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setCompany(c)}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 6 }}>Target Role</label>
                  <input
                    type="text"
                    className="input"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. SDE-1, Senior Backend Engineer"
                  />
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                    {COMMON_ROLES.map((r) => (
                      <button
                        key={r}
                        type="button"
                        className={`badge ${role === r ? 'badge-accent' : 'badge-neutral'}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setRole(r)}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 6 }}>Expected Interview Date (Optional)</label>
                  <input
                    type="date"
                    className="input"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  {plan && (
                    <button type="button" className="btn btn-secondary" onClick={() => setShowConfigModal(false)}>
                      Cancel
                    </button>
                  )}
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Searching Web & Generating...' : 'Generate Personalized Plan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
