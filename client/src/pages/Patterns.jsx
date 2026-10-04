import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import { patternAPI } from '../services/api';
import { ArrowRight } from 'lucide-react';

export default function Patterns() {
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadPatterns() {
      try {
        const data = await patternAPI.getAll();
        setPatterns(data || []);
      } catch (err) {
        setPatterns([]);
      } finally {
        setLoading(false);
      }
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

        {loading ? (
          <div className="pattern-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card" style={{ height: '170px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div className="skeleton" style={{ width: '120px', height: '20px', borderRadius: '4px' }} />
                  <div className="skeleton" style={{ width: '70px', height: '22px', borderRadius: '12px' }} />
                </div>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                  <div className="skeleton" style={{ width: '60px', height: '28px', borderRadius: '4px' }} />
                  <div className="skeleton" style={{ width: '60px', height: '28px', borderRadius: '4px' }} />
                  <div className="skeleton" style={{ width: '60px', height: '28px', borderRadius: '4px' }} />
                </div>
                <div className="skeleton" style={{ width: '100%', height: '8px', borderRadius: '4px' }} />
              </div>
            ))}
          </div>
        ) : patterns.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px 20px' }}>
            <div className="state-icon" style={{ fontSize: '36px', marginBottom: '12px' }}>🧩</div>
            <h3>No Algorithmic Patterns Available</h3>
            <p style={{ color: 'var(--text-muted)' }}>Add problems to your problem bank to auto-generate pattern analytics.</p>
          </div>
        ) : (
          <div className="pattern-grid">
            {patterns.map((pat) => {
              const isUnexplored = pat.attempted === 0 || pat.status === 'Unexplored';
              const pct = isUnexplored ? 0 : Math.round((pat.solved / (pat.attempted || 1)) * 100);
              const isStrong = pat.status === 'Strong';
              const isAttention = pat.status === 'Needs attention' || pat.status === 'Needs Attention';
              return (
                <div
                  key={pat.id}
                  className="pattern-card"
                  onClick={() => navigate(`/patterns/${pat.id}`)}
                >
                  <div className="pattern-card-top">
                    <h3>{pat.name}</h3>
                    <span className={`badge ${isUnexplored ? 'badge-neutral' : isStrong ? 'badge-success' : isAttention ? 'badge-danger' : 'badge-warning'}`}>
                      {isUnexplored ? 'Unexplored' : pat.status}
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
        )}
      </div>
    </AppShell>
  );
}
