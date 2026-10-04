import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import { attemptAPI, problemAPI, aiAPI } from '../services/api';
import { useToast } from '../components/common/Toast';
import {
  Target,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  Send,
  X,
  Shuffle,
  Brain,
  Sparkles,
  ArrowRight,
  ExternalLink,
  BookOpen,
  ChevronDown,
  ChevronUp,
  FileText
} from 'lucide-react';

export default function InterviewMode() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const [allProblems, setAllProblems] = useState([]);
  const [problem, setProblem] = useState(null);
  const [timeLeft, setTimeLeft] = useState(45 * 60); // 45 minutes
  const [isRunning, setIsRunning] = useState(false);
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [revealedHintList, setRevealedHintList] = useState([]);
  const [code, setCode] = useState('');
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('Java');
  const [submitting, setSubmitting] = useState(false);
  const [requestingHint, setRequestingHint] = useState(false);
  const [showProblemStatement, setShowProblemStatement] = useState(true);

  // Load problem based on URL param or pick unattempted problem
  useEffect(() => {
    async function loadMockProblem() {
      try {
        const probs = await problemAPI.getAll();
        const safeProbs = Array.isArray(probs) ? probs : [];
        setAllProblems(safeProbs);

        const paramProbId = searchParams.get('problemId');
        let selected = null;

        if (paramProbId) {
          selected = safeProbs.find(p => p._id === paramProbId || p.id === paramProbId);
        }

        if (!selected && safeProbs.length > 0) {
          selected = safeProbs[Math.floor(Math.random() * safeProbs.length)];
        }

        if (selected) {
          setProblem(selected);
          initCodeForLanguage(selectedLanguage, selected);
        }
      } catch (err) {
        console.error('Failed to load problem for interview mode:', err);
      }
    }
    loadMockProblem();
  }, [searchParams]);

  // Handle language switch
  const initCodeForLanguage = (lang, targetProb) => {
    const title = targetProb?.title || 'Solution';
    const cleanTitle = title.replace(/[^a-zA-Z0-9]/g, '');

    if (lang === 'Python') {
      setCode(`class Solution:\n    def solve(self, input_data):\n        # Write Python solution for ${title}\n        pass`);
    } else if (lang === 'Java') {
      setCode(`class Solution {\n    public void ${cleanTitle.toLowerCase() || 'solve'}() {\n        // Write Java solution for ${title}\n    }\n}`);
    } else if (lang === 'C++') {
      setCode(`#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    void solve() {\n        // Write C++ solution for ${title}\n    }\n};`);
    } else if (lang === 'Go') {
      setCode(`package main\n\nfunc solve() {\n    // Write Go solution for ${title}\n}`);
    } else if (lang === 'TypeScript') {
      setCode(`function solve(): void {\n  // Write TypeScript solution for ${title}\n}`);
    } else {
      setCode(`// Mock Interview Solution for ${title}\n\nfunction solve() {\n  // Write JavaScript solution\n}`);
    }
  };

  const handleLanguageChange = (lang) => {
    setSelectedLanguage(lang);
    initCodeForLanguage(lang, problem);
  };

  // Pick another random problem for mock interview
  const handleNextRandomProblem = () => {
    if (allProblems.length === 0) return;
    const filtered = allProblems.filter(p => p._id !== problem?._id);
    const pick = filtered[Math.floor(Math.random() * filtered.length)] || allProblems[0];
    setProblem(pick);
    setTimeLeft(45 * 60);
    setIsRunning(false);
    setHintsRevealed(0);
    setRevealedHintList([]);
    initCodeForLanguage(selectedLanguage, pick);
    showToast(`Switched mock interview problem to: ${pick.title}`, 'info');
  };

  // Helper for direct LeetCode / platform link
  const getExternalProblemUrl = (prob) => {
    if (!prob) return '#';
    if (prob.url && prob.url.includes('leetcode.com/problems/')) {
      return prob.url;
    }
    const cleanTitle = (prob.title || '').replace(/\s*Variation\s*#\d+/i, '').trim();
    return `https://leetcode.com/problemset/all/?search=${encodeURIComponent(cleanTitle)}`;
  };

  // Offline Pattern Hints
  const getOfflineHint = (level) => {
    if (!problem) return 'Review core data structure choices.';
    const pat = problem.patterns?.[0] || 'Core DSA';
    const obj = problem.learningObjectives?.[0] || 'Analyze constraints and write optimal code.';
    const pre = problem.prerequisites?.[0] || 'Check edge cases and boundary inputs.';

    if (level === 1) {
      return `💡 Pattern Focus: Consider applying the ${pat} pattern. What data structure yields optimal lookup efficiency?`;
    } else if (level === 2) {
      return `💡 Strategy Objective: ${obj}`;
    } else {
      return `💡 Complexity & Edge Target: ${pre}`;
    }
  };

  // Timer countdown
  useEffect(() => {
    let timer;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Hybrid Hint Handler
  const handleRevealHint = async () => {
    if (hintsRevealed >= 3) {
      showToast('Maximum 3 hints reached for this session.', 'warning');
      return;
    }

    const nextLevel = hintsRevealed + 1;
    const isCodeUserWritten = code.length > 120 && !code.includes('Write Java solution') && !code.includes('# Write Python solution');

    try {
      setRequestingHint(true);
      let hintText = '';

      if (isCodeUserWritten) {
        const res = await aiAPI.generateHint({
          problemId: problem._id || problem.id,
          code,
          language: selectedLanguage,
          hintLevel: nextLevel
        });
        hintText = res.hint || getOfflineHint(nextLevel);
      } else {
        hintText = getOfflineHint(nextLevel);
      }

      setRevealedHintList(prev => [...prev, hintText]);
      setHintsRevealed(nextLevel);
      showToast(`Hint ${nextLevel} revealed!`, 'info');
    } catch (err) {
      console.error('Failed to request hint:', err);
      setRevealedHintList(prev => [...prev, getOfflineHint(nextLevel)]);
      setHintsRevealed(nextLevel);
    } finally {
      setRequestingHint(false);
    }
  };

  // Submit session & trigger real AI Evaluation
  const handleCompleteSession = async (e) => {
    e.preventDefault();
    if (!problem) return;

    try {
      setSubmitting(true);
      const probId = problem._id || problem.id;
      const durationMin = Math.max(1, Math.round((45 * 60 - timeLeft) / 60));

      const startRes = await attemptAPI.start(probId);
      const attemptId = startRes._id || startRes.id;

      await attemptAPI.submit(attemptId, {
        problemId: probId,
        outcome: hintsRevealed > 0 ? 'Solved with hints' : 'Solved',
        hints: hintsRevealed,
        confidence: hintsRevealed === 0 ? 4 : 2,
        durationMin,
        code,
        keyInsight: `Timed mock interview execution (${durationMin} min spent)`,
        reflectionNote: `Completed 45-minute mock interview session with ${hintsRevealed} hints used.`
      });

      showToast('Session logged! Requesting AI Evaluation...', 'info');

      try {
        await aiAPI.evaluateAttempt(attemptId);
        showToast('🧠 AI Evaluation completed!', 'success');
      } catch (aiErr) {
        console.warn('AI Evaluation queued:', aiErr);
      }

      setSubmitModalOpen(false);
      navigate(`/attempts/${attemptId}`);
    } catch (err) {
      console.error('Error submitting mock interview:', err);
      showToast('Error logging interview session', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell title="Interview Mode" crumb="Focus">
      <div className="enter">
        <div className="interview-shell">
          {/* Top Band Header */}
          <div className="interview-topband">
            <div className="content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                <div className="interview-eyebrow">🔴 LIVE MOCK INTERVIEW ASSESSMENT</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <a
                    href={getExternalProblemUrl(problem)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  >
                    Open on {problem?.platform || 'LeetCode'} <ExternalLink size={12} />
                  </a>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleNextRandomProblem}
                    style={{ fontSize: 12 }}
                  >
                    <Shuffle size={13} /> Switch Question
                  </button>
                </div>
              </div>

              <h1 style={{ marginBottom: 6 }}>{problem?.title || 'Loading Question...'}</h1>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
                <span className={`badge ${problem?.difficulty === 'Hard' ? 'badge-danger' : problem?.difficulty === 'Medium' ? 'badge-warning' : 'badge-success'}`}>
                  {problem?.difficulty || 'Medium'}
                </span>
                <span className="badge badge-accent">Pattern: {problem?.patterns?.[0] || 'DSA'}</span>
                <span className="badge badge-neutral">Platform: {problem?.platform || 'LeetCode'}</span>
                <span className="badge badge-mono">Est. Time: {problem?.estimatedTime || 30} min</span>
              </div>

              <p style={{ fontSize: '13.5px', opacity: 0.85, maxWidth: '640px', margin: 0 }}>
                Simulate realistic technical interview conditions. You have <strong>45 minutes</strong> to read the question, design an algorithm, write code, and optimize time/space complexity.
              </p>

              <div className="countdown-row" style={{ marginTop: 16 }}>
                <div className="countdown-item">
                  <div className="num" style={{ color: timeLeft < 300 ? 'var(--danger)' : 'var(--text)' }}>
                    {formatTime(timeLeft)}
                  </div>
                  <div className="lbl">TIME REMAINING</div>
                </div>
                <div className="countdown-item">
                  <div className="num">{hintsRevealed} / 3</div>
                  <div className="lbl">HINTS REVEALED</div>
                </div>
              </div>
            </div>
          </div>

          {/* Control Dials */}
          <div className="dial-panel-row">
            <div className="dial-panel">
              <button
                className={`btn ${isRunning ? 'btn-secondary' : 'btn-primary'} btn-block`}
                onClick={() => setIsRunning(!isRunning)}
              >
                {isRunning ? <><Pause size={15} /> Pause Timer</> : <><Play size={15} /> Start Mock Timer</>}
              </button>
            </div>
            <div className="dial-panel">
              <button
                className="btn btn-secondary btn-block"
                onClick={handleRevealHint}
                disabled={hintsRevealed >= 3 || requestingHint}
              >
                <Lightbulb size={15} /> {requestingHint ? 'Analyzing Code for Hint...' : `Reveal Hint (${3 - hintsRevealed} left)`}
              </button>
            </div>
            <div className="dial-panel">
              <button
                className="btn btn-primary btn-block"
                onClick={() => setSubmitModalOpen(true)}
              >
                <Send size={15} /> Submit for AI Evaluation
              </button>
            </div>
          </div>

          {/* Revealed Hints Box */}
          {revealedHintList.length > 0 && (
            <div style={{ padding: '20px 32px', background: 'var(--accent-tint)', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--accent)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Brain size={15} /> REVEALED HINTS FOR THIS SESSION ({revealedHintList.length} / 3):
              </div>
              {revealedHintList.map((h, i) => (
                <div key={i} style={{ fontSize: '13px', color: 'var(--text)', marginBottom: '6px', background: 'var(--surface-1)', padding: '8px 12px', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                  <strong>Hint {i + 1}:</strong> {h}
                </div>
              ))}
            </div>
          )}

          {/* Detailed Problem Statement & Examples Expandable Panel */}
          <div style={{ padding: '20px 32px 0' }}>
            <div className="card" style={{ padding: 16 }}>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => setShowProblemStatement(!showProblemStatement)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 14 }}>
                  <FileText size={16} className="text-accent" /> Problem Description & Objective Case
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--accent)' }}>
                  {showProblemStatement ? 'Collapse Statement' : 'Expand Problem Details'}
                  {showProblemStatement ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>

              {showProblemStatement && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)', fontSize: 13, color: 'var(--text-secondary)' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
                    Overview:
                  </div>
                  <p style={{ margin: '0 0 12px', lineHeight: 1.6 }}>
                    {problem?.description || problem?.learningObjectives?.[0] || `Given the input parameters for ${problem?.title || 'this problem'}, design an algorithm that achieves optimal execution time while satisfying all constraints.`}
                  </p>

                  {problem?.learningObjectives && problem.learningObjectives.length > 0 && (
                    <div style={{ marginBottom: 10 }}>
                      <strong style={{ color: 'var(--text)' }}>Core Learning Objective:</strong> {problem.learningObjectives.join(' • ')}
                    </div>
                  )}

                  {problem?.prerequisites && problem.prerequisites.length > 0 && (
                    <div style={{ marginBottom: 10 }}>
                      <strong style={{ color: 'var(--text)' }}>Prerequisites & Key Invariants:</strong> {problem.prerequisites.join(' • ')}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 12, fontSize: 12 }}>
                    <a
                      href={getExternalProblemUrl(problem)}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: 'var(--accent)', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 600 }}
                    >
                      Read full original problem statement & test cases on {problem?.platform || 'LeetCode'} <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Code Workspace */}
          <div style={{ padding: '24px 32px' }}>
            <div className="section-head">
              <h2>Code Implementation</h2>
            </div>
            <div className="code-editor-wrap">
              <div className="code-editor-header">
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '12.5px' }}>
                  <label htmlFor="interviewLangSelect" style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 600 }}>Language:</label>
                  <select
                    id="interviewLangSelect"
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
                    <option value="Java">Java</option>
                    <option value="JavaScript">JavaScript</option>
                    <option value="TypeScript">TypeScript</option>
                    <option value="Python">Python</option>
                    <option value="C++">C++</option>
                    <option value="Go">Go</option>
                  </select>
                </div>
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Sparkles size={13} className="text-accent" /> AI Hint & Evaluator Connected
                </span>
              </div>
              <textarea
                className="code-textarea"
                style={{ height: '320px', fontFamily: 'monospace', fontSize: 13.5 }}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck="false"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit Mock Session Modal */}
      <div className={`modal-overlay ${submitModalOpen ? 'open' : ''}`}>
        <div className="modal">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Brain size={20} className="text-accent" /> Finalize Mock Interview & Run AI Evaluation
            </h3>
            <button className="icon-btn" onClick={() => setSubmitModalOpen(false)}><X size={18} /></button>
          </div>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>
            Are you ready to submit your mock interview solution for <strong>{problem?.title}</strong>?
            <br /><br />
            The AI Evaluator will analyze your code correctness, time/space complexity, edge cases, and log evaluation findings to your profile.
          </p>

          <div style={{ background: 'var(--surface-2)', padding: 12, borderRadius: 'var(--r-md)', fontSize: 12.5, marginBottom: 20 }}>
            <div>⏱️ Time Spent: <strong>{formatTime(45 * 60 - timeLeft)}</strong></div>
            <div>💡 Hints Used: <strong>{hintsRevealed} / 3</strong></div>
          </div>

          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setSubmitModalOpen(false)}>
              Continue Coding
            </button>
            <button className="btn btn-primary" onClick={handleCompleteSession} disabled={submitting}>
              {submitting ? 'Running AI Evaluation...' : 'Confirm & Submit to AI'}
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
