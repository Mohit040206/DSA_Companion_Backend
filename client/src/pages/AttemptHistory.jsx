import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import { attemptAPI, problemAPI } from '../services/api';
import { History, ArrowRight, Filter, Clock, CheckCircle2 } from 'lucide-react';

export default function AttemptHistory() {
  const [attempts, setAttempts] = useState([]);
  const [problems, setProblems] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      const [atts, probs] = await Promise.all([
        attemptAPI.getAll(),
        problemAPI.getAll()
      ]);
      setAttempts(atts || []);
      setProblems(probs || []);
      setLoading(false);
    }
    loadData();
  }, []);

  const filteredAttempts = attempts.filter(a => {
    if (filter === 'All') return true;
    if (filter === 'Solved') return a.outcome === 'Solved';
    if (filter === 'Hints') return a.outcome === 'Solved with hints';
    if (filter === 'Unsolved') return a.outcome === 'Could not solve';
    return true;
  });

  return (
    <AppShell title="Attempt Logs & History" crumb="Prepare">
      <div className="enter">
        <div className="page-intro">
          <h1>Problem Solving History</h1>
          <p>Review past attempts to inspect learning trajectories and reflection notes.</p>
        </div>

        {/* Filters */}
        <div className="toolbar">
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['All', 'Solved', 'Hints', 'Unsolved'].map(f => (
              <button
                key={f}
                className={`filter-chip ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="timeline">
          {filteredAttempts.map((att) => {
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
                    <div className="tl-title">
                      {prob.title} <small style={{ color: 'var(--text-muted)', fontWeight: 400 }}>#{att.attemptNumber}</small>
                    </div>
                    <div className="tl-time">{att.date} ({att.when || 'Past'})</div>
                  </div>
                  <div className="desc">{att.approach || att.algorithm || 'No approach notes.'}</div>
                  {att.keyInsight && (
                    <div style={{ fontSize: '12.5px', color: 'var(--success)', marginTop: '4px' }}>
                      💡 <strong>Insight:</strong> {att.keyInsight}
                    </div>
                  )}
                  <div className="tl-meta">
                    <span className={`badge ${isClean ? 'badge-success' : isHints ? 'badge-warning' : 'badge-danger'}`}>
                      {att.outcome}
                    </span>
                    <span className="badge badge-neutral">{att.durationMin || 25} mins</span>
                    {att.confidence && (
                      <span className="badge badge-accent">Confidence: {att.confidence}/5</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
