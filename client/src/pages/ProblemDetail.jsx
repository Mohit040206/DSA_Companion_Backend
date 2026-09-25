import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import { problemAPI, attemptAPI, revisionAPI } from '../services/api';
import { useToast } from '../components/common/Toast';
import {
  ChevronLeft,
  ExternalLink,
  Play,
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
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [problem, setProblem] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('workspace'); // workspace | history

  const [selectedLanguage, setSelectedLanguage] = useState('JavaScript');
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [reflectionForm, setReflectionForm] = useState({
    outcome: 'Solved',
    confidence: 4,
    hints: 0,
    durationMin: 20,
    language: 'JavaScript',
    approach: '',
    keyInsight: '',
    mistakes: '',
    reflectionNote: ''
  });

  useEffect(() => {
    async function loadProblemData() {
      try {
        const [prob, atts] = await Promise.all([
          problemAPI.getById(id),
          attemptAPI.getByProblem(id)
        ]);
        setProblem(prob);
        setAttempts(atts || []);
        setCode(prob?.codeSnippet || `// Write your solution here\nfunction ${prob?.id ? prob.id.replace(/-/g, '_') : 'solution'}(nums) {\n  \n}`);
      } catch (err) {
        showToast('Error loading problem', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadProblemData();
  }, [id]);

  const handleStartAttempt = async () => {
    try {
      const newAtt = await attemptAPI.start(id);
      showToast('Attempt session started!', 'success');
      setActiveTab('workspace');
    } catch (err) {
      showToast('Error starting attempt', 'error');
    }
  };

  const handleSubmitAttempt = async (e) => {
    e.preventDefault();
    try {
      const attId = attempts[0]?.id || 'a-new-' + Date.now();
      await attemptAPI.submit(attId, {
        problemId: id,
        ...reflectionForm
      });
      // If low confidence or solved with hints, optionally queue revision
      if (reflectionForm.confidence <= 2 || reflectionForm.outcome === 'Solved with hints') {
        await revisionAPI.create({
          problemId: id,
          reason: 'Low confidence / needed hints',
          focus: reflectionForm.keyInsight || 'Cold practice without opening solution'
        });
        showToast('Attempt logged and queued for spaced revision!', 'success');
      } else {
        showToast('Attempt logged successfully!', 'success');
      }

      setSubmitModalOpen(false);
      // Reload attempts
      const updatedAtts = await attemptAPI.getByProblem(id);
      setAttempts(updatedAtts || []);
    } catch (err) {
      showToast('Failed to log attempt', 'error');
    }
  };

  const handleLanguageChange = (lang) => {
    setSelectedLanguage(lang);
    setReflectionForm(prev => ({ ...prev, language: lang }));

    const fnName = problem?.id ? problem.id.replace(/-/g, '_') : 'solution';
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

  return (
    <AppShell title={problem.title} crumb="Problems">
      <div className="enter">
        <div className="detail-header">
          <Link to="/problems" className="breadcrumb-link">
            <ChevronLeft size={16} /> Back to Problems Directory
          </Link>
          <h1>{problem.title}</h1>

          <div className="badge-row">
            <span className={`badge ${
              problem.difficulty === 'Easy' ? 'badge-success' : problem.difficulty === 'Medium' ? 'badge-warning' : 'badge-danger'
            }`}>
              {problem.difficulty}
            </span>
            <span className="badge badge-neutral">{problem.platform || 'LeetCode'}</span>
            <span className="badge badge-accent">
              Status: {problem.status || 'In Progress'}
            </span>
            {problem.lastConfidence && (
              <span className="badge badge-mono" style={{ background: 'var(--accent-tint)', color: 'var(--accent)' }}>
                Confidence: {problem.lastConfidence} / 5 ⭐
              </span>
            )}
          </div>

          <div className="action-row">
            <button className="btn btn-primary" onClick={handleStartAttempt}>
              <Play size={16} /> Start Attempt Session
            </button>
            <a href={problem.url} target="_blank" rel="noreferrer" className="btn btn-secondary">
              Open Original Problem <ExternalLink size={15} />
            </a>
          </div>
        </div>

        {/* Meta Grid */}
        <div className="meta-grid">
          <div className="card meta-item">
            <div className="label">ESTIMATED DURATION</div>
            <div className="val">{problem.estimatedTime || '20–25 min'}</div>
          </div>
          <div className="card meta-item">
            <div className="label">TOTAL ATTEMPTS</div>
            <div className="val">{attempts.length || 2} session(s)</div>
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
              attempts.map((att) => {
                const isClean = att.outcome === 'Solved';
                const isHints = att.outcome === 'Solved with hints';
                return (
                  <div key={att.id} className="attempt-record">
                    <div className={`attempt-num ${isClean ? 'tone-success' : isHints ? 'tone-warning' : 'tone-danger'}`}>
                      #{att.attemptNumber}
                    </div>
                    <div className="body">
                      <div className="top">
                        <div className="title">{att.outcome}</div>
                        <div className="when">{att.date} ({att.when || 'Past'})</div>
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
                        <span className="badge badge-neutral">{att.durationMin || 25} mins</span>
                        <span className="badge badge-neutral">{att.hints || 0} hints used</span>
                        <span className="badge badge-accent">Confidence: {att.confidence || 3}/5</span>
                      </div>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
                <label>Duration (Minutes)</label>
                <input
                  type="number"
                  className="input"
                  value={reflectionForm.durationMin}
                  onChange={(e) => setReflectionForm({ ...reflectionForm, durationMin: parseInt(e.target.value) })}
                />
              </div>
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

            <div className="field">
              <label>Mistakes / Edge Cases Caught</label>
              <textarea
                className="input"
                rows="2"
                placeholder="e.g. Forgot to seed prefix sum map with {0: 1}."
                value={reflectionForm.mistakes}
                onChange={(e) => setReflectionForm({ ...reflectionForm, mistakes: e.target.value })}
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
