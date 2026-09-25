import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import { attemptAPI, problemAPI } from '../services/api';
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
  X
} from 'lucide-react';

export default function InterviewMode() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [problem, setProblem] = useState(null);
  const [timeLeft, setTimeLeft] = useState(45 * 60); // 45 minutes
  const [isRunning, setIsRunning] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('JavaScript');

  const handleLanguageChange = (lang) => {
    setSelectedLanguage(lang);
    if (lang === 'Python') {
      setCode(`class Solution:\n    def canFinish(self, numCourses, prerequisites):\n        # Write Python solution here\n        pass`);
    } else if (lang === 'Java') {
      setCode(`class Solution {\n    public boolean canFinish(int numCourses, int[][] prerequisites) {\n        // Write Java solution here\n        return true;\n    }\n}`);
    } else if (lang === 'C++') {
      setCode(`#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {\n        // Write C++ solution here\n        return true;\n    }\n};`);
    } else if (lang === 'Go') {
      setCode(`package main\n\nfunc canFinish(numCourses int, prerequisites [][]int) bool {\n    // Write Go solution here\n    return true;\n}`);
    } else if (lang === 'TypeScript') {
      setCode(`function canFinish(numCourses: number, prerequisites: number[][]): boolean {\n  // Write TypeScript solution here\n  return true;\n}`);
    } else {
      setCode(`// Mock Interview Submission\n// Language: JavaScript\n\nfunction canFinish(numCourses, prerequisites) {\n  // 1. Build adjacency list\n  \n  // 2. Detect cycle\n  \n  return true;\n}`);
    }
  };

  const HINTS = [
    "Hint 1: Can you represent the course dependencies as a directed graph?",
    "Hint 2: What graph property corresponds to impossible course completion? (Hint: Cycle)",
    "Hint 3: Use DFS with 3 states (0 = Unvisited, 1 = Visiting in current stack, 2 = Fully Visited) or Kahn's BFS Algorithm."
  ];

  useEffect(() => {
    async function loadMockProblem() {
      const data = await problemAPI.getAll();
      const mockProb = data.find(p => p.id === 'course-schedule') || data[0];
      setProblem(mockProb);
      setCode(`// Mock Interview Submission\n// Language: JavaScript\n\nfunction canFinish(numCourses, prerequisites) {\n  // 1. Build adjacency list\n  \n  // 2. Detect cycle\n  \n  return true;\n}`);
    }
    loadMockProblem();
  }, []);

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

  const handleRevealHint = () => {
    if (hintsRevealed < HINTS.length) {
      setHintsRevealed(prev => prev + 1);
      showToast(`Hint ${hintsRevealed + 1} revealed`, 'info');
    }
  };

  const handleCompleteSession = async (e) => {
    e.preventDefault();
    try {
      const durationMin = Math.max(1, Math.round((45 * 60 - timeLeft) / 60));
      await attemptAPI.start(problem?.id || 'course-schedule');
      await attemptAPI.submit('a-mock-' + Date.now(), {
        problemId: problem?.id || 'course-schedule',
        outcome: hintsRevealed > 0 ? 'Solved with hints' : 'Solved',
        hints: hintsRevealed,
        confidence: hintsRevealed === 0 ? 4 : 2,
        durationMin,
        keyInsight: '3-color DFS state tracking signals directed cycle',
        reflectionNote: 'Mock exam completed under timed conditions.'
      });
      showToast('Mock Interview Session logged!', 'success');
      setSubmitModalOpen(false);
      navigate('/attempts');
    } catch (err) {
      showToast('Error logging session', 'error');
    }
  };

  return (
    <AppShell title="Interview Mode" crumb="Focus">
      <div className="enter">
        <div className="interview-shell">
          {/* Top Band */}
          <div className="interview-topband">
            <div className="content">
              <div className="interview-eyebrow">🔴 LIVE MOCK INTERVIEW ASSESSMENT</div>
              <h1>{problem?.title || 'Course Schedule (System Cycle Detection)'}</h1>
              <p style={{ fontSize: '13.5px', opacity: 0.85, maxWidth: '600px' }}>
                Simulate realistic technical interview conditions. Keep your explanation concise and manage time.
              </p>

              <div className="countdown-row">
                <div className="countdown-item">
                  <div className="num">{formatTime(timeLeft)}</div>
                  <div className="lbl">TIME REMAINING</div>
                </div>
                <div className="countdown-item">
                  <div className="num">{hintsRevealed} / 3</div>
                  <div className="lbl">HINTS USED</div>
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
                {isRunning ? <><Pause size={15} /> Pause Timer</> : <><Play size={15} /> Start Mock Session</>}
              </button>
            </div>
            <div className="dial-panel">
              <button
                className="btn btn-secondary btn-block"
                onClick={handleRevealHint}
                disabled={hintsRevealed >= HINTS.length}
              >
                <Lightbulb size={15} /> Reveal Hint ({HINTS.length - hintsRevealed} left)
              </button>
            </div>
            <div className="dial-panel">
              <button
                className="btn btn-primary btn-block"
                onClick={() => setSubmitModalOpen(true)}
              >
                <Send size={15} /> Submit Solution
              </button>
            </div>
          </div>

          {/* Revealed Hints Box */}
          {hintsRevealed > 0 && (
            <div style={{ padding: '20px 32px', background: 'var(--accent-tint)', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--accent)', marginBottom: '8px' }}>
                REVEALED INTERVIEW HINTS:
              </div>
              {HINTS.slice(0, hintsRevealed).map((h, i) => (
                <div key={i} style={{ fontSize: '13px', color: 'var(--text)', marginBottom: '6px' }}>
                  {h}
                </div>
              ))}
            </div>
          )}

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
                    <option value="JavaScript">JavaScript</option>
                    <option value="TypeScript">TypeScript</option>
                    <option value="Python">Python</option>
                    <option value="Java">Java</option>
                    <option value="C++">C++</option>
                    <option value="Go">Go</option>
                  </select>
                </div>
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Auto-saving local session</span>
              </div>
              <textarea
                className="code-textarea"
                style={{ height: '320px' }}
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
            <h3>Finalize Mock Interview</h3>
            <button className="icon-btn" onClick={() => setSubmitModalOpen(false)}><X size={18} /></button>
          </div>
          <p>
            Are you ready to submit your mock interview session? Your time ({formatTime(45 * 60 - timeLeft)}) and hint count ({hintsRevealed}) will be logged into your analytics profile.
          </p>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setSubmitModalOpen(false)}>
              Continue Coding
            </button>
            <button className="btn btn-primary" onClick={handleCompleteSession}>
              Confirm & Save Session
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
