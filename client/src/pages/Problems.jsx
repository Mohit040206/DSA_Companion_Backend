import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import { problemAPI } from '../services/api';
import { useToast } from '../components/common/Toast';
import {
  Plus,
  Search,
  ExternalLink,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  X
} from 'lucide-react';

export default function Problems() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);

  const { showToast } = useToast();

  const [newProblem, setNewProblem] = useState({
    title: '',
    difficulty: 'Medium',
    platform: 'LeetCode',
    patterns: 'hashmap',
    estimatedTime: '20 min',
    learningObjectives: '',
    url: ''
  });

  useEffect(() => {
    async function loadProblems() {
      try {
        const data = await problemAPI.getAll();
        setProblems(data || []);
      } catch (err) {
        showToast('Failed to load problems', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadProblems();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newProblem.title) return;
    try {
      const added = await problemAPI.create({
        ...newProblem,
        patterns: newProblem.patterns.split(',').map(p => p.trim())
      });
      setProblems(prev => [added, ...prev]);
      showToast('Problem added successfully!', 'success');
      setModalOpen(false);
      setNewProblem({
        title: '',
        difficulty: 'Medium',
        platform: 'LeetCode',
        patterns: 'hashmap',
        estimatedTime: '20 min',
        learningObjectives: '',
        url: ''
      });
    } catch (err) {
      showToast('Failed to add problem', 'error');
    }
  };

  const filteredProblems = problems.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.patterns?.some(pat => pat.toLowerCase().includes(search.toLowerCase()));

    const matchesDiff = difficultyFilter === 'All' || p.difficulty === difficultyFilter;
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;

    return matchesSearch && matchesDiff && matchesStatus;
  });

  return (
    <AppShell title="Problems Directory" crumb="Prepare">
      <div className="enter">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div className="page-intro" style={{ marginBottom: 0 }}>
            <h1>DSA Problem Bank</h1>
            <p>Targeted problem list tagged by core algorithmic pattern and status.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
            <Plus size={16} /> Add Problem
          </button>
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <div className="search-box" style={{ width: '280px' }}>
            <Search size={15} />
            <input
              type="text"
              placeholder="Search problems or patterns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
              <button
                key={diff}
                className={`filter-chip ${difficultyFilter === diff ? 'active' : ''}`}
                onClick={() => setDifficultyFilter(diff)}
              >
                {diff}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginLeft: 'auto' }}>
            {['All', 'Solved', 'Needs Revision', 'In Progress', 'Not Attempted'].map((st) => (
              <button
                key={st}
                className={`filter-chip ${statusFilter === st ? 'active' : ''}`}
                onClick={() => setStatusFilter(st)}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Table / Card Container */}
        <div className="card card-flush">
          <table className="table">
            <thead>
              <tr>
                <th>Problem</th>
                <th>Patterns & Concepts</th>
                <th>Difficulty</th>
                <th>Est. Time</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProblems.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <div className="state-block">
                      <div className="state-icon">🔍</div>
                      <h3>No matching problems found</h3>
                      <p>Try clearing filters or search for another term.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProblems.map((p) => {
                  const isSolved = p.status === 'Solved';
                  const isRev = p.status === 'Needs Revision';
                  return (
                    <tr key={p.id || p._id}>
                      <td>
                        <Link to={`/problems/${p.id || p._id}`} className="problem-name" style={{ color: 'var(--text)' }}>
                          {p.title}
                        </Link>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{p.platform || 'LeetCode'}</div>
                      </td>
                      <td>
                        <div className="pattern-tag-row">
                          {(p.patterns || []).map((pat) => (
                            <span key={pat} className="pattern-tag">
                              {pat}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${
                          p.difficulty === 'Easy' ? 'badge-success' : p.difficulty === 'Medium' ? 'badge-warning' : 'badge-danger'
                        }`}>
                          {p.difficulty}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '12.5px' }}>
                        {p.estimatedTime || '20 min'}
                      </td>
                      <td>
                        <span className={`badge ${
                          isSolved ? 'badge-success' : isRev ? 'badge-danger' : 'badge-neutral'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Link to={`/problems/${p.id || p._id}`} className="btn btn-sm btn-secondary">
                          Practice
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Problem Modal Overlay */}
      <div className={`modal-overlay ${modalOpen ? 'open' : ''}`} onClick={(e) => { if (e.target.classList.contains('modal-overlay')) setModalOpen(false); }}>
        <div className="modal">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3>Add New DSA Problem</h3>
            <button className="icon-btn" onClick={() => setModalOpen(false)}><X size={18} /></button>
          </div>

          <form onSubmit={handleAddSubmit}>
            <div className="field">
              <label>Problem Title</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Valid Anagram"
                value={newProblem.title}
                onChange={(e) => setNewProblem({ ...newProblem, title: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="field">
                <label>Difficulty</label>
                <select
                  className="input"
                  value={newProblem.difficulty}
                  onChange={(e) => setNewProblem({ ...newProblem, difficulty: e.target.value })}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div className="field">
                <label>Platform</label>
                <select
                  className="input"
                  value={newProblem.platform}
                  onChange={(e) => setNewProblem({ ...newProblem, platform: e.target.value })}
                >
                  <option value="LeetCode">LeetCode</option>
                  <option value="HackerRank">HackerRank</option>
                  <option value="Codeforces">Codeforces</option>
                  <option value="GeeksforGeeks">GeeksforGeeks</option>
                </select>
              </div>
            </div>

            <div className="field">
              <label>Patterns (comma separated)</label>
              <input
                type="text"
                className="input"
                placeholder="hashmap, sliding-window"
                value={newProblem.patterns}
                onChange={(e) => setNewProblem({ ...newProblem, patterns: e.target.value })}
              />
            </div>

            <div className="field">
              <label>Learning Objectives / Core Concept</label>
              <textarea
                className="input"
                rows="2"
                placeholder="e.g. Single pass lookup with frequency count..."
                value={newProblem.learningObjectives}
                onChange={(e) => setNewProblem({ ...newProblem, learningObjectives: e.target.value })}
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Problem
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
