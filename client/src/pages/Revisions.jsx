import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import { revisionAPI, problemAPI } from '../services/api';
import { useToast } from '../components/common/Toast';
import { RotateCcw, ArrowRight, CheckCircle2, Clock, X, AlertTriangle } from 'lucide-react';

export default function Revisions() {
  const [revisions, setRevisions] = useState([]);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadRevisions() {
      try {
        const [revs, probs] = await Promise.all([
          revisionAPI.getAll({ all: true }),
          problemAPI.getAll({ all: true })
        ]);
        setRevisions(Array.isArray(revs) ? revs : []);
        setProblems(Array.isArray(probs) ? probs : []);
      } catch (err) {
        showToast('Error loading revisions', 'error');
        setRevisions([]);
        setProblems([]);
      } finally {
        setLoading(false);
      }
    }
    loadRevisions();
  }, []);

  const handleStartRevision = async (rev) => {
    try {
      const pId = rev.problemId?._id || rev.problemId;
      const pTitle = rev.problemId?.title || 'question';
      await revisionAPI.start(rev.id || rev._id);
      showToast(`Started revision for ${pTitle}`, 'success');
      navigate(`/problems/${pId}`);
    } catch (err) {
      showToast('Error starting revision', 'error');
    }
  };

  const handleSkipRevision = async (revId) => {
    try {
      await revisionAPI.skip(revId);
      setRevisions(prev => prev.filter(r => r.id !== revId && r._id !== revId));
      showToast('Revision skipped / completed', 'info');
    } catch (err) {
      showToast('Error skipping revision', 'error');
    }
  };

  if (loading) {
    return (
      <AppShell title="Spaced Repetition Queue" crumb="Prepare">
        <div className="state-block">
          <div className="skeleton skeleton-card" style={{ height: '200px' }} />
        </div>
      </AppShell>
    );
  }

  const safeRevisions = Array.isArray(revisions) ? revisions : [];
  const safeProblems = Array.isArray(problems) ? problems : [];

  const overdueList = safeRevisions.filter(r => r.status === 'overdue');
  const todayList = safeRevisions.filter(r => r.status === 'today');
  const upcomingList = safeRevisions.filter(r => r.status === 'tomorrow' || r.status === 'upcoming');

  const getProblemTitle = (rev) => {
    if (typeof rev.problemId === 'object' && rev.problemId !== null) {
      return rev.problemId.title || 'Revision Question';
    }
    const found = safeProblems.find(p => p._id === rev.problemId || p.id === rev.problemId);
    return found?.title || (typeof rev.problemId === 'string' ? rev.problemId : 'Revision Question');
  };

  return (
    <AppShell title="Spaced Repetition Queue" crumb="Prepare">
      <div className="enter">
        <div className="page-intro">
          <h1>Revision Queue</h1>
          <p>Spaced repetition reinforces weak patterns before cold interview sessions.</p>
        </div>

        {/* Overdue Section */}
        {overdueList.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <div className="section-head">
              <h2 style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={18} /> Overdue Revisions ({overdueList.length})
              </h2>
            </div>
            {overdueList.map(rev => {
              return (
                <div key={rev.id || rev._id} className="revision-card">
                  <div className="rev-status-dot overdue" />
                  <div className="rev-body">
                    <div className="rev-title">{getProblemTitle(rev)}</div>
                    <div className="rev-reason">
                      <strong>Reason:</strong> {rev.reason} • <strong>Focus:</strong> {rev.focus}
                    </div>
                    <div className="rev-meta-row">
                      <span className="badge badge-danger">Overdue by {rev.overdueByDays || 2} days</span>
                      <span className="badge badge-neutral">Scheduled: {rev.scheduledFor}</span>
                    </div>
                  </div>
                  <div className="rev-right">
                    <button className="btn btn-primary btn-sm" onClick={() => handleStartRevision(rev)}>
                      Solve Now <ArrowRight size={13} />
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleSkipRevision(rev.id || rev._id)} style={{ marginTop: '6px' }}>
                      Skip
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Today Section */}
        <div style={{ marginBottom: '28px' }}>
          <div className="section-head">
            <h2>Due Today ({todayList.length})</h2>
          </div>
          {todayList.length === 0 ? (
            <div className="card" style={{ color: 'var(--text-secondary)', fontSize: '13.5px' }}>
              No revisions due today! Great job keeping your queue clean.
            </div>
          ) : (
            todayList.map(rev => {
              return (
                <div key={rev.id || rev._id} className="revision-card">
                  <div className="rev-status-dot" />
                  <div className="rev-body">
                    <div className="rev-title">{getProblemTitle(rev)}</div>
                    <div className="rev-reason">
                      <strong>Reason:</strong> {rev.reason} • <strong>Focus:</strong> {rev.focus}
                    </div>
                    <div className="rev-meta-row">
                      <span className="badge badge-warning">Due Today</span>
                      <span className="badge badge-neutral">Scheduled: {rev.scheduledFor}</span>
                    </div>
                  </div>
                  <div className="rev-right">
                    <button className="btn btn-primary btn-sm" onClick={() => handleStartRevision(rev)}>
                      Start Revision <ArrowRight size={13} />
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleSkipRevision(rev.id || rev._id)} style={{ marginTop: '6px' }}>
                      Complete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Upcoming Section */}
        <div>
          <div className="section-head">
            <h2>Upcoming Schedule ({upcomingList.length})</h2>
          </div>
          {upcomingList.length === 0 ? (
            <div className="card" style={{ color: 'var(--text-secondary)', fontSize: '13.5px' }}>
              No upcoming revisions queued yet.
            </div>
          ) : (
            upcomingList.map(rev => {
              return (
                <div key={rev.id || rev._id} className="revision-card">
                  <div className="rev-status-dot" style={{ background: 'var(--accent)' }} />
                  <div className="rev-body">
                    <div className="rev-title">{getProblemTitle(rev)}</div>
                    <div className="rev-reason">
                      <strong>Focus:</strong> {rev.focus}
                    </div>
                    <div className="rev-meta-row">
                      <span className="badge badge-accent">Scheduled for {rev.scheduledFor}</span>
                    </div>
                  </div>
                  <div className="rev-right">
                    <button className="btn btn-secondary btn-sm" onClick={() => handleStartRevision(rev)}>
                      Preview
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AppShell>
  );
}
