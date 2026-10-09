import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Brain,
  Zap,
  Clock,
  HardDrive,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function AIEvaluationCard({ evaluation, attempt, onRetry, onReevaluate }) {
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);

  if (!evaluation || evaluation.status === 'NOT_REQUESTED') {
    return (
      <div className="card" style={{ padding: '16px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            <Sparkles size={16} style={{ color: 'var(--accent)' }} /> AI Solution Evaluation
          </div>
          <button
            className="btn btn-sm btn-secondary"
            onClick={async () => {
              if (onReevaluate && attempt?._id) {
                setLoading(true);
                await onReevaluate(attempt._id);
                setLoading(false);
              }
            }}
            disabled={loading}
          >
            {loading ? <RefreshCw size={13} className="spin" /> : <Sparkles size={13} />}
            Evaluate with AI
          </button>
        </div>
      </div>
    );
  }

  if (evaluation.status === 'PENDING') {
    return (
      <div className="card" style={{ padding: '20px', background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: 'var(--r-md)', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: 'var(--accent)', fontWeight: 600, fontSize: '13.5px' }}>
          <RefreshCw size={18} className="spin" />
          AI Coach is analyzing your solution statically...
        </div>
      </div>
    );
  }

  if (evaluation.status === 'FAILED') {
    return (
      <div className="card" style={{ padding: '16px', background: 'var(--danger-tint)', border: '1px solid var(--danger)', borderRadius: 'var(--r-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--danger)' }}>AI Evaluation Encountered an Issue</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{evaluation.error || 'Evaluation timed out.'}</div>
          </div>
          <button
            className="btn btn-sm btn-secondary"
            onClick={async () => {
              if (onReevaluate && attempt?._id) {
                setLoading(true);
                await onReevaluate(attempt._id);
                setLoading(false);
              }
            }}
            disabled={loading}
          >
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
            Retry Evaluation
          </button>
        </div>
      </div>
    );
  }

  const verdictConfig = {
    CORRECT: { label: 'Correct & Verified', color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.3)' },
    MOSTLY_CORRECT: { label: 'Mostly Correct', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.3)' },
    CORRECT_BUT_INEFFICIENT: { label: 'Correct but Inefficient', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)' },
    NEEDS_ANOTHER_ATTEMPT: { label: 'Needs Another Attempt', color: '#EC4899', bg: 'rgba(236, 72, 153, 0.1)', border: 'rgba(236, 72, 153, 0.3)' },
    INCORRECT: { label: 'Incorrect Solution', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)' },
    INCONCLUSIVE: { label: 'Inconclusive Data', color: '#6B7280', bg: 'rgba(107, 114, 128, 0.1)', border: 'rgba(107, 114, 128, 0.3)' }
  };

  const currentVerdict = verdictConfig[evaluation.verdict] || verdictConfig.MOSTLY_CORRECT;

  return (
    <div
      className="card"
      style={{
        padding: '18px',
        background: 'var(--surface-2)',
        border: `1px solid ${currentVerdict.border}`,
        borderRadius: 'var(--r-md)',
        marginBottom: '16px'
      }}
    >
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: expanded ? '14px' : '0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles size={18} style={{ color: 'var(--accent)' }} />
          <span style={{ fontWeight: 700, fontSize: '14.5px' }}>AI Solution Analysis</span>
          <span
            style={{
              fontSize: '11.5px',
              fontWeight: 700,
              padding: '3px 9px',
              borderRadius: 'var(--r-full)',
              color: currentVerdict.color,
              background: currentVerdict.bg,
              border: `1px solid ${currentVerdict.border}`
            }}
          >
            {currentVerdict.label}
          </span>
        </div>

        <button
          className="icon-btn"
          onClick={() => setExpanded(!expanded)}
          title={expanded ? 'Collapse AI Analysis' : 'Expand AI Analysis'}
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {expanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Big Brother Coach Note */}
          {evaluation.coachFeedback && (
            <div
              style={{
                padding: '12px 14px',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)',
                border: '1px solid rgba(139, 92, 246, 0.25)',
                borderRadius: 'var(--r-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: 'var(--accent)' }}>
                  <Brain size={16} /> Big Brother Coach Insights
                </div>
                {evaluation.patternContext?.isSpike && (
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      background: 'rgba(245, 158, 11, 0.15)',
                      color: '#F59E0B',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      fontWeight: 700
                    }}
                  >
                    Tricky Variation
                  </span>
                )}
              </div>
              <div style={{ fontSize: '13px', lineHeight: '1.55', color: 'var(--text)', fontWeight: 500 }}>
                {evaluation.coachFeedback}
              </div>
            </div>
          )}

          {/* AI Derived Complexity & Approach */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
            <div style={{ padding: '10px 12px', background: 'var(--surface)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px' }}>
                <Clock size={12} /> Time Complexity
              </div>
              <div style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--accent)' }}>
                {evaluation.derivedComplexity?.time || attempt?.complexity?.time || 'O(N)'}
              </div>
            </div>

            <div style={{ padding: '10px 12px', background: 'var(--surface)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px' }}>
                <HardDrive size={12} /> Space Complexity
              </div>
              <div style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--accent-2)' }}>
                {evaluation.derivedComplexity?.space || attempt?.complexity?.space || 'O(N)'}
              </div>
            </div>

            <div style={{ padding: '10px 12px', background: 'var(--surface)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)', gridColumn: 'span 2' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px' }}>
                <Zap size={12} /> Derived Approach & Algorithm
              </div>
              <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text)' }}>
                {evaluation.derivedApproach || attempt?.approach || 'Pattern-based Solution'} ({evaluation.derivedAlgorithm || attempt?.algorithm || 'Standard Technique'})
              </div>
            </div>
          </div>

          {/* What Was Done Well */}
          {Array.isArray(evaluation.whatWasDoneWell) && evaluation.whatWasDoneWell.length > 0 && (
            <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: 'var(--r-sm)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#10B981', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <CheckCircle2 size={14} /> What You Did Correctly
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                {evaluation.whatWasDoneWell.map((item, idx) => (
                  <li key={idx} style={{ marginBottom: '3px' }}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Issues & Discovered Mistakes */}
          {Array.isArray(evaluation.issues) && evaluation.issues.length > 0 && (
            <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: 'var(--r-sm)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#EF4444', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <AlertTriangle size={14} /> Identified Issues & Edge Cases
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {evaluation.issues.map((iss, idx) => (
                  <div key={idx} style={{ fontSize: '12.5px', color: 'var(--text)', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', background: iss.severity === 'CRITICAL' || iss.severity === 'HIGH' ? '#EF4444' : '#F59E0B', color: '#fff', marginTop: '2px' }}>
                      {iss.type || 'EDGE_CASE'}
                    </span>
                    <span>{iss.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Learning Takeaway */}
          {evaluation.keyLearning && (
            <div style={{ padding: '12px', background: 'var(--surface)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Brain size={14} /> Key Learning Takeaway
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                {evaluation.keyLearning}
              </div>
            </div>
          )}

          {/* Retry Recommendation Action Bar */}
          {evaluation.retryRecommended && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'rgba(236, 72, 153, 0.08)', border: '1px solid rgba(236, 72, 153, 0.25)', borderRadius: 'var(--r-sm)' }}>
              <div style={{ fontSize: '12.5px', color: 'var(--text)' }}>
                <span style={{ fontWeight: 700, color: '#EC4899' }}>Retry Recommended: </span>
                {evaluation.retryFocus || 'Fix identified issue and re-attempt algorithm.'}
              </div>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => {
                  if (onRetry) onRetry(attempt, evaluation.retryFocus);
                }}
                style={{ flexShrink: 0, gap: '6px', background: 'linear-gradient(135deg, #EC4899, #8B5CF6)' }}
              >
                <RotateCcw size={13} /> {evaluation.retryFocus?.toLowerCase().includes('twice') ? 'Revise 2x' : 'Try Again'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
