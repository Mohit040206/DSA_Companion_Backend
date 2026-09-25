import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import { patternAPI } from '../services/api';
import { Share2, ArrowRight, CheckCircle2, AlertTriangle, Shield } from 'lucide-react';

export default function Patterns() {
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadPatterns() {
      const data = await patternAPI.getAll();
      setPatterns(data || []);
      setLoading(false);
    }
    loadPatterns();
  }, []);

  return (
    <AppShell title="Pattern Breakdown" crumb="Prepare">
      <div className="enter">
        <div className="page-intro">
          <h1>Algorithmic Pattern Directory</h1>
          <p>Mastering patterns transfers problem-solving intuition across hundreds of questions.</p>
        </div>

        <div className="pattern-grid">
          {patterns.map((pat) => {
            const pct = Math.round((pat.solved / (pat.attempted || 1)) * 100);
            const isStrong = pat.status === 'Strong';
            const isAttention = pat.status === 'Needs attention';
            return (
              <div
                key={pat.id}
                className="pattern-card"
                onClick={() => navigate(`/patterns/${pat.id}`)}
              >
                <div className="pattern-card-top">
                  <h3>{pat.name}</h3>
                  <span className={`badge ${isStrong ? 'badge-success' : isAttention ? 'badge-danger' : 'badge-warning'}`}>
                    {pat.status}
                  </span>
                </div>

                <div className="pattern-stats-row">
                  <div className="ps">
                    <div className="num">{pat.solved} / {pat.attempted}</div>
                    <div className="lbl">Solved / Attempted</div>
                  </div>
                  <div className="ps">
                    <div className="num">{pat.avgConfidence} ⭐</div>
                    <div className="lbl">Avg Confidence</div>
                  </div>
                  <div className="ps">
                    <div className="num">{pat.revisions}</div>
                    <div className="lbl">Revisions Pending</div>
                  </div>
                </div>

                <div className="pbar" style={{ marginTop: '12px' }}>
                  <div
                    className={`pbar-fill ${isStrong ? 'tone-success' : isAttention ? 'tone-danger' : ''}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                  <span>{pct}% Pattern Solve Rate</span>
                  <span className="row-action" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: 'var(--accent)' }}>
                    Explore <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
