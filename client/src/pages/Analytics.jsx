import React, { useState, useEffect } from 'react';
import AppShell from '../components/layout/AppShell';
import { TrendingUp, Zap, AlertTriangle, BarChart2, BookOpen } from 'lucide-react';
import { attemptAPI } from '../services/api';
import { Link } from 'react-router-dom';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState([]);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const data = await attemptAPI.getAll();
        setAttempts(Array.isArray(data) ? data : []);
      } catch (err) {
        setAttempts([]);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  // Compute metrics from actual database attempts
  const totalAttempts = attempts.length;

  const solvedClean = attempts.filter(
    a => a.outcome === 'Solved' && (!a.hintsUsed || a.hintsUsed === 0)
  ).length;

  const solvedWithHints = attempts.filter(
    a => a.outcome === 'SolvedWithHints' || (a.hintsUsed > 0 && a.outcome === 'Solved')
  ).length;

  const solvedWithHelp = attempts.filter(
    a => a.outcome === 'SolvedWithExternalHelp' || a.outcome === 'NeedSolution'
  ).length;

  const couldNotSolve = attempts.filter(
    a => a.outcome === 'CouldNotSolve'
  ).length;

  const outcomeDistribution = [
    { label: 'Solved clean', value: solvedClean, color: 'var(--success)' },
    { label: 'Solved with hints', value: solvedWithHints, color: 'var(--warning)' },
    { label: 'External help / solution', value: solvedWithHelp, color: '#3b82f6' },
    { label: 'Could not solve', value: couldNotSolve, color: 'var(--danger)' },
  ];

  // Hint reliance calculation
  const completedAttempts = attempts.filter(a => a.completedAt);
  const cleanCount = completedAttempts.filter(
    a => (a.outcome === 'Solved' || a.outcome === 'SolvedClean') && (!a.hintsUsed || a.hintsUsed === 0)
  ).length;

  const hintReliancePct = completedAttempts.length > 0
    ? Math.round((cleanCount / completedAttempts.length) * 100)
    : 0;

  // Average confidence score
  const confidenceRatings = attempts
    .map(a => Number(a.confidence))
    .filter(c => !isNaN(c) && c > 0);

  const avgConfidence = confidenceRatings.length > 0
    ? (confidenceRatings.reduce((sum, val) => sum + val, 0) / confidenceRatings.length).toFixed(1)
    : 'N/A';

  // Confidence trajectory (first vs last 5 attempts)
  const recentConfidences = confidenceRatings.slice(-6);
  const earlyConf = recentConfidences.length > 0 ? recentConfidences[0] : 0;
  const latestConf = recentConfidences.length > 0 ? recentConfidences[recentConfidences.length - 1] : 0;

  // Weekly problem velocity calculation (last 5 weeks)
  const now = new Date();
  const weekCounts = [0, 0, 0, 0, 0];
  attempts.forEach(a => {
    if (!a.completedAt && !a.createdAt) return;
    const date = new Date(a.completedAt || a.createdAt);
    const diffWeeks = Math.floor((now - date) / (7 * 24 * 60 * 60 * 1000));
    if (diffWeeks >= 0 && diffWeeks < 5) {
      weekCounts[4 - diffWeeks]++;
    }
  });

  const maxWeekly = Math.max(...weekCounts, 1);

  return (
    <AppShell title="Analytics & Progress" crumb="Prepare">
      <div className="enter">
        <div className="page-intro">
          <h1>Learning Analytics & Trends</h1>
          <p>Data-driven breakdown of your confidence, hint reliance, and pattern mastery trajectory.</p>
        </div>

        {loading ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div className="spinner" style={{ margin: '0 auto 12px', width: '28px', height: '28px' }}></div>
            <p style={{ color: 'var(--text-muted)' }}>Calculating your learning metrics...</p>
          </div>
        ) : totalAttempts === 0 ? (
          /* Empty State for Users with No Attempts */
          <div className="card" style={{ textAlign: 'center', padding: '48px 24px', marginBottom: '24px' }}>
            <div className="state-icon" style={{ fontSize: '36px', marginBottom: '12px' }}>📊</div>
            <h3 style={{ marginBottom: '8px' }}>No Attempt Records Found</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 20px', lineHeight: '1.5' }}>
              Your analytics will automatically update as you practice problems or import past attempt history.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Link to="/problems" className="btn btn-primary" style={{ gap: '6px' }}>
                <BookOpen size={15} /> Start Solving Problems
              </Link>
              <Link to="/import-records" className="btn btn-secondary" style={{ gap: '6px' }}>
                <BarChart2 size={15} /> Import Existing Records
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Insight Strip */}
            <div className="insight-strip">
              <div className="insight-line">
                <TrendingUp />
                <div>
                  <b>Confidence Trajectory:</b> Your recent average rating is <b>{avgConfidence} ⭐</b> across {confidenceRatings.length} rated attempt{confidenceRatings.length === 1 ? '' : 's'}.
                  {recentConfidences.length >= 2 && (
                    <span style={{ marginLeft: '6px', color: 'var(--text-muted)' }}>
                      (Recent trend: {earlyConf.toFixed(1)} → {latestConf.toFixed(1)})
                    </span>
                  )}
                </div>
              </div>
              <div className="insight-line">
                <Zap />
                <div>
                  <b>Hint Reliance:</b> You solved <b>{hintReliancePct}%</b> of problem attempts clean without revealing hints during your first pass.
                </div>
              </div>
              <div className="insight-line">
                <AlertTriangle style={{ color: 'var(--warning)' }} />
                <div>
                  <b>Total Volume:</b> You have logged <b>{totalAttempts} total attempts</b> across your DSA problem bank.
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="two-col-layout" style={{ marginBottom: '24px' }}>
              {/* Chart 1: Confidence Trend Line Chart */}
              <div className="card chart-card">
                <div className="chart-title">Confidence Trend Over Time</div>
                <div className="chart-desc">Average confidence rating (1-5 ⭐) across recent attempts</div>

                <div className="line-chart-wrap" style={{ height: '180px', marginTop: '10px' }}>
                  {recentConfidences.length === 0 ? (
                    <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                      No confidence scores rated yet
                    </div>
                  ) : (
                    <svg viewBox="0 0 400 150" style={{ width: '100%', height: '100%' }}>
                      <defs>
                        <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Grid Lines */}
                      <line x1="40" y1="30" x2="380" y2="30" className="grid-line" />
                      <line x1="40" y1="70" x2="380" y2="70" className="grid-line" />
                      <line x1="40" y1="110" x2="380" y2="110" className="grid-line" />

                      {/* Data Points */}
                      {recentConfidences.map((rating, idx) => {
                        const count = recentConfidences.length;
                        const x = 40 + (idx / Math.max(1, count - 1)) * 340;
                        const y = 130 - (rating / 5) * 100;
                        return (
                          <g key={idx}>
                            <circle cx={x} cy={y} r="5" className="pt" fill="var(--accent)" />
                            <text x={x} y={y - 10} textAnchor="middle" fill="var(--text-secondary)" fontSize="11" fontWeight="600">
                              {rating}⭐
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  )}
                </div>
              </div>

              {/* Chart 2: Outcome Distribution */}
              <div className="card chart-card">
                <div className="chart-title">Outcome Distribution</div>
                <div className="chart-desc">Breakdown across all {totalAttempts} problem attempts</div>

                <div className="outcome-donut-wrap" style={{ paddingTop: '10px' }}>
                  <div className="donut-legend" style={{ width: '100%' }}>
                    {outcomeDistribution.map(item => (
                      <div key={item.label} className="donut-legend-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="donut-legend-dot" style={{ background: item.color }} />
                          <span style={{ fontWeight: 600, fontSize: '13px' }}>{item.label}</span>
                        </div>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '13px' }}>
                          {item.value} ({totalAttempts > 0 ? Math.round((item.value / totalAttempts) * 100) : 0}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Activity Bar Chart */}
            <div className="card chart-card">
              <div className="chart-title">Weekly Solved Problem Velocity</div>
              <div className="chart-desc">Number of problems solved each week (last 5 weeks)</div>

              <div className="bar-chart" style={{ marginTop: '16px' }}>
                {weekCounts.map((val, idx) => (
                  <div key={idx} className="bar-col">
                    <div
                      className="bar"
                      style={{
                        height: `${Math.max(12, (val / maxWeekly) * 100)}px`,
                        background: val > 0 ? 'var(--accent)' : 'var(--surface-2)'
                      }}
                    />
                    <span className="bar-label">Wk {idx + 1} ({val})</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
