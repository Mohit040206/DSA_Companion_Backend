import React from 'react';
import AppShell from '../components/layout/AppShell';
import {
  CONFIDENCE_TREND,
  HINTS_TREND,
  SOLVED_PER_WEEK,
  OUTCOME_DISTRIBUTION
} from '../services/mockData';
import { TrendingUp, Award, Zap, AlertTriangle } from 'lucide-react';

export default function Analytics() {
  return (
    <AppShell title="Analytics & Progress" crumb="Prepare">
      <div className="enter">
        <div className="page-intro">
          <h1>Learning Analytics & Trends</h1>
          <p>Data-driven breakdown of your confidence, hint reliance, and pattern mastery trajectory.</p>
        </div>

        {/* Insight Strip */}
        <div className="insight-strip">
          <div className="insight-line">
            <TrendingUp />
            <div>
              <b>Confidence Trajectory:</b> Your confidence rating has increased from <b>2.0 → 3.8</b> over your last 6 problem attempts.
            </div>
          </div>
          <div className="insight-line">
            <Zap />
            <div>
              <b>Hint Reliance:</b> You solved <b>64%</b> of problems clean without revealing hints during first pass.
            </div>
          </div>
          <div className="insight-line">
            <AlertTriangle style={{ color: 'var(--warning)' }} />
            <div>
              <b>Focus Area:</b> Graphs & Topological Sort require 2 additional cold attempts before interview date.
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

                {/* Area & Path */}
                <path
                  d="M 40 110 Q 100 110, 100 90 T 170 70 T 240 100 T 310 40 T 380 70 L 380 130 L 40 130 Z"
                  className="fill-path"
                />
                <path
                  d="M 40 110 Q 100 110, 100 90 T 170 70 T 240 100 T 310 40 T 380 70"
                  className="line-path"
                />

                {/* Data Points */}
                <circle cx="40" cy="110" r="4.5" className="pt" />
                <circle cx="100" cy="90" r="4.5" className="pt" />
                <circle cx="170" cy="70" r="4.5" className="pt" />
                <circle cx="240" cy="100" r="4.5" className="pt" />
                <circle cx="310" cy="40" r="4.5" className="pt" />
                <circle cx="380" cy="70" r="4.5" className="pt" />
              </svg>
            </div>
          </div>

          {/* Chart 2: Outcome Distribution */}
          <div className="card chart-card">
            <div className="chart-title">Outcome Distribution</div>
            <div className="chart-desc">Breakdown across all 70 problem attempts</div>

            <div className="outcome-donut-wrap" style={{ paddingTop: '10px' }}>
              <svg viewBox="0 0 120 120" style={{ width: '120px', height: '120px', flexShrink: 0 }}>
                <circle cx="60" cy="60" r="42" fill="none" stroke="var(--surface-2)" strokeWidth="16" />
                <circle cx="60" cy="60" r="42" fill="none" stroke="var(--success)" strokeWidth="16" strokeDasharray="263.8" strokeDashoffset="100" />
                <circle cx="60" cy="60" r="42" fill="none" stroke="var(--warning)" strokeWidth="16" strokeDasharray="263.8" strokeDashoffset="190" />
                <circle cx="60" cy="60" r="42" fill="none" stroke="var(--danger)" strokeWidth="16" strokeDasharray="263.8" strokeDashoffset="240" />
              </svg>

              <div className="donut-legend">
                {OUTCOME_DISTRIBUTION.map(item => (
                  <div key={item.label} className="donut-legend-item">
                    <span className="donut-legend-dot" style={{ background: item.color }} />
                    <span style={{ fontWeight: 600 }}>{item.label}:</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Activity Bar Chart */}
        <div className="card chart-card">
          <div className="chart-title">Weekly Solved Problem Velocity</div>
          <div className="chart-desc">Number of problems solved each week during current prep cycle</div>

          <div className="bar-chart">
            {SOLVED_PER_WEEK.map((val, idx) => (
              <div key={idx} className="bar-col">
                <div className="bar" style={{ height: `${val * 24}px` }} />
                <span className="bar-label">Wk {idx + 1} ({val})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
