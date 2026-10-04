import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import { problemAPI } from '../services/api';
import { useToast } from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  X
} from 'lucide-react';

export default function Problems() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const searchParamVal = searchParams.get('search') || '';
  const diffParamVal = searchParams.get('difficulty') || 'All';
  const statusParamVal = searchParams.get('status') || 'All';
  const patternParamVal = searchParams.get('pattern') || 'All';
  const pageParamVal = parseInt(searchParams.get('page')) || 1;

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParamVal);
  const [difficultyFilter, setDifficultyFilter] = useState(diffParamVal);
  const [statusFilter, setStatusFilter] = useState(statusParamVal);
  const [patternFilter, setPatternFilter] = useState(patternParamVal);
  const [page, setPage] = useState(pageParamVal);
  const PAGE_SIZE = 10;

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

  // Sync state if searchParams change externally (e.g. browser back/forward)
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setDifficultyFilter(searchParams.get('difficulty') || 'All');
    setStatusFilter(searchParams.get('status') || 'All');
    setPatternFilter(searchParams.get('pattern') || 'All');
    setPage(parseInt(searchParams.get('page')) || 1);
  }, [searchParams]);

  useEffect(() => {
    async function loadProblems() {
      try {
        const data = await problemAPI.getAll();
        setProblems(Array.isArray(data) ? data : []);
      } catch (err) {
        showToast('Failed to load problems. Is the server running?', 'error');
        setProblems([]);
      } finally {
        setLoading(false);
      }
    }
    loadProblems();
  }, []);

  // Extract unique pattern options from existing problems
  const availablePatterns = ['All', ...Array.from(new Set(problems.flatMap(p => p.patterns || [])))];

  const updateFilterParams = (newFilters) => {
    const nextSearch = newFilters.search !== undefined ? newFilters.search : search;
    const nextDiff = newFilters.difficulty !== undefined ? newFilters.difficulty : difficultyFilter;
    const nextStatus = newFilters.status !== undefined ? newFilters.status : statusFilter;
    const nextPattern = newFilters.pattern !== undefined ? newFilters.pattern : patternFilter;
    const nextPage = newFilters.page !== undefined ? newFilters.page : 1;

    setSearch(nextSearch);
    setDifficultyFilter(nextDiff);
    setStatusFilter(nextStatus);
    setPatternFilter(nextPattern);
    setPage(nextPage);

    const params = {};
    if (nextSearch) params.search = nextSearch;
    if (nextDiff !== 'All') params.difficulty = nextDiff;
    if (nextStatus !== 'All') params.status = nextStatus;
    if (nextPattern !== 'All') params.pattern = nextPattern;
    if (nextPage > 1) params.page = String(nextPage);

    setSearchParams(params, { replace: true });
  };

  const handleSearchChange = (e) => {
    updateFilterParams({ search: e.target.value, page: 1 });
  };

  const handleDifficultyChange = (diff) => {
    updateFilterParams({ difficulty: diff, page: 1 });
  };

  const handleStatusChange = (st) => {
    updateFilterParams({ status: st, page: 1 });
  };

  const handlePatternChange = (pat) => {
    updateFilterParams({ pattern: pat, page: 1 });
  };

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
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.patterns?.some(pat => pat.toLowerCase().includes(search.toLowerCase()));

    const matchesDiff = difficultyFilter === 'All' || p.difficulty === difficultyFilter;
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    const matchesPattern = patternFilter === 'All' || p.patterns?.includes(patternFilter);

    return matchesSearch && matchesDiff && matchesStatus && matchesPattern;
  });

  const totalPages = Math.ceil(filteredProblems.length / PAGE_SIZE) || 1;
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedProblems = filteredProblems.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <AppShell title="Problems Directory" crumb="Prepare">
      <div className="enter">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div className="page-intro" style={{ marginBottom: 0 }}>
            <h1>DSA Problem Bank</h1>
            <p>Targeted problem list tagged by core algorithmic pattern and status.</p>
          </div>
          {user?.role === 'admin' && (
            <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
              <Plus size={16} /> Add Problem
            </button>
          )}
        </div>

        {/* Toolbar & Filters */}
        <div className="toolbar" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '12px' }}>
          {/* Top row: Search + Difficulty + Status */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="search-box" style={{ width: '280px' }}>
              <Search size={15} />
              <input
                type="text"
                placeholder="Search problems or patterns..."
                value={search}
                onChange={handleSearchChange}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                <button
                  key={diff}
                  className={`filter-chip ${difficultyFilter === diff ? 'active' : ''}`}
                  onClick={() => handleDifficultyChange(diff)}
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
                  onClick={() => handleStatusChange(st)}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Pattern Filter Row (Horizontally Scrollable) */}
          <div className="pattern-filter-bar">
            <span className="filter-label">
              <Filter size={13} /> Pattern:
            </span>
            <div className="pattern-filter-scroll">
              {availablePatterns.map((pat) => (
                <button
                  key={pat}
                  className={`filter-chip ${patternFilter === pat ? 'active' : ''}`}
                  onClick={() => handlePatternChange(pat)}
                >
                  {pat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table Container */}
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
              {paginatedProblems.length === 0 ? (
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
                paginatedProblems.map((p) => {
                  const probId = p._id || p.id;
                  const isSolved = p.status === 'Solved';
                  const isRev = p.status === 'Needs Revision';
                  return (
                    <tr key={probId}>
                      <td>
                        <Link to={`/problems/${probId}`} className="problem-name" style={{ color: 'var(--text)' }}>
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
                          {p.status || 'Not Attempted'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Link to={`/problems/${probId}`} className="btn btn-sm btn-secondary">
                          Practice
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Pagination Footer */}
          {filteredProblems.length > 0 && (
            <div style={{
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center',
              padding: '14px 20px',
              borderTop: '1px solid var(--border)',
              background: 'var(--surface-2)',
              fontSize: '13px',
              color: 'var(--text-secondary)'
            }}>
              <div>
                Showing <strong>{startIndex + 1}</strong> to <strong>{Math.min(startIndex + PAGE_SIZE, filteredProblems.length)}</strong> of <strong>{filteredProblems.length}</strong> problems
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  className="btn btn-sm btn-secondary"
                  disabled={currentPage <= 1}
                  onClick={() => updateFilterParams({ page: Math.max(1, currentPage - 1) })}
                  style={{ gap: '4px' }}
                >
                  <ChevronLeft size={14} /> Previous
                </button>
                
                <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text)', padding: '0 6px' }}>
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  className="btn btn-sm btn-secondary"
                  disabled={currentPage >= totalPages}
                  onClick={() => updateFilterParams({ page: Math.min(totalPages, currentPage + 1) })}
                  style={{ gap: '4px' }}
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Problem Modal Overlay (Admin Only) */}
      {user?.role === 'admin' && modalOpen && (
        <div className={`modal-overlay open`} onClick={(e) => { if (e.target.classList.contains('modal-overlay')) setModalOpen(false); }}>
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
      )}
    </AppShell>
  );
}
