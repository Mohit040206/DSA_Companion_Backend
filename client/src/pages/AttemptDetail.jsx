import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import { attemptAPI, problemAPI, aiAPI } from '../services/api';
import AIEvaluationCard from '../components/ai/AIEvaluationCard';
import { useToast } from '../components/common/Toast';
import { ChevronLeft, ArrowRight, Lightbulb, AlertOctagon, CheckCircle2, Clock } from 'lucide-react';

export default function AttemptDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [attempt, setAttempt] = useState(null);
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAttempt = async () => {
    try {
      const att = await attemptAPI.getById(id);
      if (att) {
        setAttempt(att);
        try {
          const prob = await problemAPI.getById(att.problemId);
          setProblem(prob);
        } catch (_) { /* ignore problem fetch error */ }
      }
    } catch (err) {
      setAttempt(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttempt();
  }, [id]);

  const handleReevaluate = async (attId) => {
    try {
      const res = await aiAPI.evaluateAttempt(attId);
      showToast('AI Evaluation completed!', 'success');
      await loadAttempt();
    } catch (err) {
      showToast('AI Evaluation failed', 'error');
    }
  };

  const handleRetry = (att, retryFocus) => {
    const pId = att?.problemId?._id || att?.problemId;
    showToast(`Retry attempt started — focus on: ${retryFocus || 'fixing identified issue'}`, 'info');
    navigate(`/problems/${pId}?retryOf=${att._id}`);
  };

  if (loading || !attempt) {
    return (
      <AppShell title="Attempt Journal" crumb="Attempts">
        <div className="state-block">
          <div className="skeleton skeleton-card" style={{ height: '200px' }} />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title={`Attempt #${attempt.attemptNumber || ''}`} crumb="Attempts">
      <div className="journal-shell enter">
        <div className="detail-header">
          <Link to="/attempts" className="breadcrumb-link">
            <ChevronLeft size={16} /> Back to All Attempt Logs
          </Link>
          <h1>{problem?.title || attempt.problemId}</h1>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Logged on {attempt.date || (attempt.createdAt ? new Date(attempt.createdAt).toLocaleDateString() : 'Recent')}
          </div>
        </div>

        {/* Journal Meta Strip */}
        <div className="journal-meta-strip">
          <div className="jm">
            <div className="label">OUTCOME</div>
            <div className="val" style={{ color: attempt.outcome === 'Solved' ? 'var(--success)' : 'var(--warning)' }}>
              {attempt.outcome}
            </div>
          </div>
          <div className="jm">
            <div className="label">CONFIDENCE</div>
            <div className="val">{attempt.confidence || 3} / 5 ⭐</div>
          </div>
          <div className="jm">
            <div className="label">DURATION</div>
            <div className="val">{attempt.durationMin || 20} mins</div>
          </div>
          <div className="jm">
            <div className="label">HINTS USED</div>
            <div className="val">{attempt.hintsUsed || attempt.hints || 0} hint(s)</div>
          </div>
        </div>

        {/* AI Evaluation Card */}
        <AIEvaluationCard
          evaluation={attempt.aiEvaluation}
          attempt={attempt}
          onRetry={handleRetry}
          onReevaluate={handleReevaluate}
        />

        {/* Journal Sections */}
        <div className="journal-section">
          <div className="jh">APPROACH & ALGORITHM</div>
          <div className="jb">
            {attempt.approach || 'Attempted initial brute force, then transitioned into precomputed hashtable lookup.'}
          </div>
        </div>

        {attempt.keyInsight && (
          <div className="journal-section">
            <div className="jh">KEY INSIGHT (THE AHA MOMENT)</div>
            <div className="jb insight">
              💡 {attempt.keyInsight}
            </div>
          </div>
        )}

        {attempt.mistakes && (
          <div className="journal-section">
            <div className="jh">MISTAKES & EDGE CASES CAUGHT</div>
            <div className="jb mistakes">
              ⚠️ {attempt.mistakes}
            </div>
          </div>
        )}

        <div className="journal-section">
          <div className="jh">COMPLEXITY ANALYSIS</div>
          <div className="jb">
            {attempt.complexity || 'O(N) Time complexity, O(N) Space complexity.'}
          </div>
        </div>

        {attempt.reflectionNote && (
          <div className="journal-section">
            <div className="jh">PERSONAL REFLECTION NOTE</div>
            <div className="jb" style={{ fontStyle: 'italic', background: 'var(--surface)' }}>
              "{attempt.reflectionNote}"
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
          <Link to={`/problems/${attempt.problemId}`} className="btn btn-primary">
            Try Again <ArrowRight size={15} />
          </Link>
          <Link to="/revisions" className="btn btn-secondary">
            View Revision Queue
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
