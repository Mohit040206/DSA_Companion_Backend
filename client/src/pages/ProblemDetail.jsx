import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import { problemAPI, attemptAPI, revisionAPI, aiAPI } from '../services/api';
import AIEvaluationCard from '../components/ai/AIEvaluationCard';
import { useToast } from '../components/common/Toast';
import {
  ChevronLeft,
  ExternalLink,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Send,
  X
} from 'lucide-react';

export default function ProblemDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const initialRetryOf = searchParams.get('retryOf') || null;

  const navigate = useNavigate();
  const { showToast } = useToast();

  const [problem, setProblem] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('workspace'); // workspace | history
  const [retryOfAttemptId, setRetryOfAttemptId] = useState(initialRetryOf);

  const [selectedLanguage, setSelectedLanguage] = useState('JavaScript');
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [reflectionForm, setReflectionForm] = useState({
    outcome: 'Solved',
    confidence: 4,
    hints: 0,
    durationMin: 20,
    language: 'JavaScript',
    keyInsight: '',
    reflectionNote: ''
  });

  const refreshAttempts = async (probId) => {
    try {
      const atts = await attemptAPI.getByProblem(probId);
      setAttempts(Array.isArray(atts) ? atts : []);
    } catch (_) {
      setAttempts([]);
    }
  };

  useEffect(() => {
    async function loadProblemData() {
      try {
        let prob = null;
        try {
          prob = await problemAPI.getById(id);
        } catch (_) {
          try {
            const allProbs = await problemAPI.getAll();
            if (Array.isArray(allProbs) && allProbs.length > 0) {
              prob = allProbs.find(p =>
                p._id === id || p.id === id || (p.title && p.title.toLowerCase().replace(/\s+/g, '-') === id.toLowerCase())
              ) || allProbs[0];
            }
          } catch (_) {
            prob = null;
          }
        }

        if (prob) {
          setProblem(prob);
          const fnName = prob?.title ? prob.title.toLowerCase().replace(/[^a-z0-9]/g, '_') : 'solution';
          setCode(prob?.codeSnippet || `// Write your solution here\nfunction ${fnName}(nums) {\n  \n}`);
          await refreshAttempts(prob._id || id);
        } else {
          showToast('Problem not found', 'error');
        }
      } catch (err) {
        showToast('Error loading problem details', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadProblemData();
  }, [id]);

  const activeAttempt = attempts.find(a => !a.completedAt);
  const activeSessionRunning = activeAttempt && activeAttempt.sessions?.some(s => !s.endedAt);

  const handleStartAttempt = async () => {
    try {
      await attemptAPI.start(problem?._id || id);
      showToast('Attempt session started!', 'success');
      await refreshAttempts(problem?._id || id);
      setActiveTab('workspace');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error starting attempt';
      showToast(msg, 'error');
    }
  };

  const handlePauseSession = async () => {
    if (!activeAttempt) return;
    try {
      await attemptAPI.endSession(activeAttempt._id || activeAttempt.id);
      showToast('Session paused.', 'info');
      await refreshAttempts(problem?._id || id);
    } catch (err) {
      showToast(err.response?.data?.message || 'Error pausing session', 'error');
    }
  };

  const handleResumeSession = async () => {
    if (!activeAttempt) return;
    try {
      await attemptAPI.resumeSession(activeAttempt._id || activeAttempt.id);
      showToast('Session resumed!', 'success');
      await refreshAttempts(problem?._id || id);
    } catch (err) {
      showToast(err.response?.data?.message || 'Error resuming session', 'error');
    }
  };

  const handleReevaluate = async (attId) => {
    try {
      showToast('Evaluating solution with AI...', 'info');
      await aiAPI.evaluateAttempt(attId);
      showToast('AI Evaluation completed!', 'success');
      const updatedAtts = await attemptAPI.getByProblem(problem?._id || id);
      setAttempts(Array.isArray(updatedAtts) ? updatedAtts : []);
    } catch (err) {
      showToast('AI Evaluation failed', 'error');
    }
  };

  const handleRetry = (att, retryFocus) => {
    setRetryOfAttemptId(att._id || att.id);
    setActiveTab('workspace');
    showToast(`Retry attempt started — focus on: ${retryFocus || 'fixing identified issue'}`, 'info');
  };

  const handleSubmitAttempt = async (e) => {
    e.preventDefault();
    try {
      let activeAtt = attempts.find(a => !a.completedAt);
      let attId = activeAtt?._id || activeAtt?.id;
      if (!attId) {
        const startRes = await attemptAPI.start(problem?._id || id);
        attId = startRes._id || startRes.id;
      }

      const submitPayload = {
        problemId: problem?._id || id,
        ...reflectionForm,
        code: code || '',
        retryOfAttemptId: retryOfAttemptId || undefined
      };

      const submittedAtt = await attemptAPI.submit(attId, submitPayload);
      showToast('Attempt saved to database! Triggering AI analysis...', 'success');

      setSubmitModalOpen(false);
      setRetryOfAttemptId(null);

      // Trigger AI evaluation call
      try {
        await aiAPI.evaluateAttempt(submittedAtt._id || attId);
      } catch (aiErr) {
        console.warn('AI Evaluation trigger note:', aiErr.message);
      }

      // Refresh attempts list & switch to history tab
      const updatedAtts = await attemptAPI.getByProblem(problem?._id || id);
      setAttempts(Array.isArray(updatedAtts) ? updatedAtts : []);
      setActiveTab('history');
    } catch (err) {
      showToast(err.message || 'Failed to log attempt', 'error');
    }
  };

  const handleLanguageChange = (lang) => {
    setSelectedLanguage(lang);
    setReflectionForm(prev => ({ ...prev, language: lang }));

    const fnName = problem?.title ? problem.title.toLowerCase().replace(/[^a-z0-9]/g, '_') : 'solution';
    if (lang === 'Python') {
      setCode(`class Solution:\n    def ${fnName}(self, nums, k):\n        # Write Python solution here\n        pass`);
    } else if (lang === 'Java') {
      setCode(`class Solution {\n    public int ${fnName}(int[] nums, int k) {\n        // Write Java solution here\n        return 0;\n    }\n}`);
    } else if (lang === 'C++') {
      setCode(`#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int ${fnName}(vector<int>& nums, int k) {\n        // Write C++ solution here\n        return 0;\n    }\n};`);
    } else if (lang === 'Go') {
      setCode(`package main\n\nfunc ${fnName}(nums []int, k int) int {\n    // Write Go solution here\n    return 0;\n}`);
    } else if (lang === 'TypeScript') {
      setCode(`function ${fnName}(nums: number[], k: number): number {\n  // Write TypeScript solution here\n  return 0;\n}`);
    } else {
      setCode(problem?.codeSnippet || `function ${fnName}(nums, k) {\n  // Write JavaScript solution here\n  return 0;\n}`);
    }
  };

  if (loading) {
    return (
      <AppShell title="Loading Problem..." crumb="Problems">
        <div className="state-block">
          <div className="skeleton skeleton-card" style={{ height: '200px' }} />
        </div>
      </AppShell>
    );
  }

  if (!problem) {
    return (
      <AppShell title="Problem Not Found" crumb="Problems">
        <div className="state-block">
          <h3>Problem details could not be loaded.</h3>
          <Link to="/problems" className="btn btn-primary" style={{ marginTop: '14px' }}>
            Back to Problems List
          </Link>
        </div>
      </AppShell>
    );
  }

  const derivedStatus = (() => {
    if (!attempts || attempts.length === 0) return 'Not Attempted';
    const hasSolved = attempts.some(a => 
      a.outcome === 'Solved' || 
      a.outcome === 'SolvedWithHints' || 
      a.outcome === 'Solved with hints' ||
      a.outcome === 'SolvedWithExternalHelp'
    );
    if (hasSolved) return 'Solved';
    return 'In Progress';
  })();

  const getProblemExternalUrl = (prob) => {
    if (!prob) return '#';
    if (prob.url && !prob.url.includes('problem-variation-') && prob.url.includes('leetcode.com/problems/')) {
      return prob.url;
    }
    const title = prob.title || '';
    const cleanTitle = title.replace(/\s*Variation\s*#\d+/i, '').trim();
    const pattern = (prob.patterns && prob.patterns[0]) ? prob.patterns[0] : cleanTitle;
    return `https://leetcode.com/problemset/all/?search=${encodeURIComponent(pattern || cleanTitle)}`;
  };

  return (
    <AppShell title={problem.title} crumb="Problems">
      <div className="enter">
        <div className="detail-header">
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate('/problems');
              }
            }}
            className="breadcrumb-link"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              font: 'inherit',
              color: 'var(--text-secondary)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <ChevronLeft size={16} /> Back to Problems Directory
          </button>
          <h1>{problem.title}</h1>

          <div className="badge-row">
            <span className={`badge ${
              problem.difficulty === 'Easy' ? 'badge-success' : problem.difficulty === 'Medium' ? 'badge-warning' : 'badge-danger'
            }`}>
              {problem.difficulty}
            </span>
            <span className="badge badge-neutral">{problem.platform || 'LeetCode'}</span>
            <span className={`badge ${
              derivedStatus === 'Solved' ? 'badge-success' : derivedStatus === 'In Progress' ? 'badge-warning' : 'badge-neutral'
            }`}>
              Status: {derivedStatus}
            </span>
            {problem.lastConfidence && (
              <span className="badge badge-mono" style={{ background: 'var(--accent-tint)', color: 'var(--accent)' }}>
                Confidence: {problem.lastConfidence} / 5 ⭐
              </span>
            )}
          </div>

          <div className="action-row">
            {activeSessionRunning ? (
              <button className="btn btn-warning" onClick={handlePauseSession} style={{ background: 'var(--warning)', color: '#000', gap: '6px', fontWeight: 700 }}>
                <Pause size={16} /> Pause Session
              </button>
            ) : activeAttempt ? (
              <button className="btn btn-primary" onClick={handleResumeSession} style={{ gap: '6px' }}>
                <Play size={16} /> Resume Session
              </button>
            ) : (
              <button className="btn btn-primary" onClick={handleStartAttempt} style={{ gap: '6px' }}>
                <Play size={16} /> Start Attempt Session
              </button>
            )}
            <a href={getProblemExternalUrl(problem)} target="_blank" rel="noreferrer" className="btn btn-secondary">
              Open Original Problem <ExternalLink size={15} />
            </a>
          </div>
        </div>

        {/* Meta Grid */}
        <div className="meta-grid">
          <div className="card meta-item">
            <div className="label">ESTIMATED DURATION</div>
            <div className="val">{problem.estimatedTime ? `${problem.estimatedTime} min` : '20–25 min'}</div>
          </div>
          <div className="card meta-item">
            <div className="label">TOTAL ATTEMPTS</div>
            <div className="val">{attempts.length} session(s)</div>
          </div>
          <div className="card meta-item">
            <div className="label">PATTERN TAGS</div>
            <div className="val" style={{ fontSize: '12.5px', textTransform: 'capitalize' }}>
              {(problem.patterns || []).join(', ')}
            </div>
          </div>
          <div className="card meta-item">
            <div className="label">REVISION FOCUS</div>
            <div className="val" style={{ fontSize: '12.5px', color: 'var(--accent)' }}>
              {problem.lastConfidence <= 2 ? 'High Priority' : 'Regular Cycle'}
            </div>
          </div>
        </div>

        {/* Relationship Note */}
        <div className="relationship-note">
          <Sparkles />
          <div>
            <strong>Learning Objective:</strong> {problem.learningObjectives || 'Recognize core invariant patterns to solve in minimal linear time.'}
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <div
            className={`tab ${activeTab === 'workspace' ? 'active' : ''}`}
            onClick={() => setActiveTab('workspace')}
          >
            Code Workspace & Solution
          </div>
          <div
            className={`tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            Past Attempt History ({attempts.length})
          </div>
        </div>

        {/* Tab 1: Code Workspace */}
        {activeTab === 'workspace' && (
          <div className="enter">
            <div className="code-editor-wrap">
              <div className="code-editor-header">
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '12.5px' }}>
                  <label htmlFor="languageSelect" style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 600 }}>Language:</label>
                  <select
                    id="languageSelect"
                    value={selectedLanguage}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    style={{
                      background: '#21262d',
                      color: 'var(--accent)',
                      border: '1px solid #30363d',
                      borderRadius: 'var(--r-sm)',
                      padding: '4px 10px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="JavaScript">JavaScript</option>
                    <option value="TypeScript">TypeScript</option>
                    <option value="Python">Python</option>
                    <option value="Java">Java</option>
                    <option value="C++">C++</option>
                    <option value="Go">Go</option>
                  </select>
                  <span style={{ color: '#6e7681' }}>|</span>
                  <span style={{ color: '#8b949e', fontFamily: 'var(--font-mono)' }}>
                    {selectedLanguage === 'JavaScript' ? 'interactive_editor.js' :
                     selectedLanguage === 'TypeScript' ? 'interactive_editor.ts' :
                     selectedLanguage === 'Python' ? 'interactive_editor.py' :
                     selectedLanguage === 'Java' ? 'Solution.java' :
                     selectedLanguage === 'C++' ? 'solution.cpp' : 'solution.go'}
                  </span>
                </div>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => setSubmitModalOpen(true)}
                >
                  <Send size={13} /> Log Reflection & Submit
                </button>
              </div>
              <textarea
                className="code-textarea"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="// Write code solution here..."
                spellCheck="false"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Past Attempt History */}
        {activeTab === 'history' && (
          <div className="card enter">
            <div className="section-head">
              <h2>Attempt Log Timeline</h2>
            </div>
            {attempts.length === 0 ? (
              <div className="state-block">
                <p>No logged attempts yet for this problem. Start a new attempt session above!</p>
              </div>
            ) : (
              attempts.map((att, index) => {
                const isClean = att.outcome === 'Solved';
                const isHints = att.outcome === 'Solved with hints' || att.outcome === 'SolvedWithHints';
                const attId = att._id || att.id || index;
                return (
                  <div key={attId} style={{ marginBottom: '20px' }}>
                    <div className="attempt-record">
                      <div className={`attempt-num ${isClean ? 'tone-success' : isHints ? 'tone-warning' : 'tone-danger'}`}>
                        #{att.attemptNumber || attempts.length - index}
                      </div>
                      <div className="body">
                        <div className="top">
                          <div className="title">{att.outcome}</div>
                          <div className="when">{att.date || (att.createdAt ? new Date(att.createdAt).toLocaleDateString() : 'Past')}</div>
                        </div>
                        <div className="desc">
                          {att.approach || att.algorithm || 'No approach notes provided.'}
                        </div>
                        {att.keyInsight && (
                          <div style={{ fontSize: '12.5px', color: 'var(--success)', marginTop: '4px' }}>
                            💡 <strong>Insight:</strong> {att.keyInsight}
                          </div>
                        )}
                        <div className="tags">
                          <span className="badge badge-neutral">{att.durationMin || 20} mins</span>
                          <span className="badge badge-neutral">{att.hintsUsed || att.hints || 0} hints used</span>
                          <span className="badge badge-accent">Confidence: {att.confidence || 3}/5 ⭐</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: '10px', marginLeft: '36px' }}>
                      <AIEvaluationCard
                        evaluation={att.aiEvaluation}
                        attempt={att}
                        onRetry={handleRetry}
                        onReevaluate={handleReevaluate}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Log Reflection Modal */}
      <div className={`modal-overlay ${submitModalOpen ? 'open' : ''}`}>
        <div className="modal" style={{ width: '520px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3>Log Attempt Reflection</h3>
            <button className="icon-btn" onClick={() => setSubmitModalOpen(false)}><X size={18} /></button>
          </div>

          <form onSubmit={handleSubmitAttempt}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px', background: 'var(--surface-2)', padding: '8px 12px', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}>
              <Clock size={14} style={{ color: 'var(--accent)' }} />
              <span>Duration is automatically recorded from your active session timer.</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="field">
                <label>Language Used</label>
                <select
                  className="input"
                  value={selectedLanguage}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                >
                  <option value="JavaScript">JavaScript</option>
                  <option value="TypeScript">TypeScript</option>
                  <option value="Python">Python</option>
                  <option value="Java">Java</option>
                  <option value="C++">C++</option>
                  <option value="Go">Go</option>
                </select>
              </div>

              <div className="field">
                <label>Outcome</label>
                <select
                  className="input"
                  value={reflectionForm.outcome}
                  onChange={(e) => setReflectionForm({ ...reflectionForm, outcome: e.target.value })}
                >
                  <option value="Solved">Solved Clean (No Hints)</option>
                  <option value="Solved with hints">Solved With Hints</option>
                  <option value="Could not solve">Could Not Solve</option>
                  <option value="Paused">Paused / In Progress</option>
                </select>
              </div>
            </div>

            <div className="field">
              <label>Confidence (1-5 ⭐)</label>
              <select
                className="input"
                value={reflectionForm.confidence}
                onChange={(e) => setReflectionForm({ ...reflectionForm, confidence: parseInt(e.target.value) })}
              >
                <option value={5}>5 - Mastery (Automatic)</option>
                <option value={4}>4 - High Confidence</option>
                <option value={3}>3 - Moderate (Needed effort)</option>
                <option value={2}>2 - Low Confidence</option>
                <option value={1}>1 - Complete Struggle</option>
              </select>
            </div>

            <div className="field">
              <label>Key Insight ("The AHA moment")</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Look up currentSum - k in prefix map instead of raw sum."
                value={reflectionForm.keyInsight}
                onChange={(e) => setReflectionForm({ ...reflectionForm, keyInsight: e.target.value })}
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setSubmitModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save & Update History
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
