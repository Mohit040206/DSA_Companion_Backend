import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import { problemAPI } from '../services/api';
import { useToast } from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Filter
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
  const [pageSize, setPageSize] = useState(parseInt(searchParams.get('limit')) || 15);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const { showToast } = useToast();

  // Sync state if searchParams change externally (e.g. browser back/forward)
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setDifficultyFilter(searchParams.get('difficulty') || 'All');
    setStatusFilter(searchParams.get('status') || 'All');
    setPatternFilter(searchParams.get('pattern') || 'All');
    setPage(parseInt(searchParams.get('page')) || 1);
    setPageSize(parseInt(searchParams.get('limit')) || 15);
  }, [searchParams]);

  useEffect(() => {
    async function loadProblems() {
      setLoading(true);
      try {
        const queryParams = {
          page,
          limit: pageSize,
          search: search || undefined,
          difficulty: difficultyFilter !== 'All' ? difficultyFilter : undefined,
          status: statusFilter !== 'All' ? statusFilter : undefined,
          pattern: patternFilter !== 'All' ? patternFilter : undefined
        };
        const data = await problemAPI.getAll(queryParams);
        const list = Array.isArray(data) ? data : (data.problems || []);
        setProblems(list);
        if (data.pagination) {
          setTotalCount(data.pagination.total);
          setTotalPages(data.pagination.totalPages);
        } else {
          setTotalCount(list.length);
          setTotalPages(Math.ceil(list.length / pageSize) || 1);
        }
      } catch (err) {
        showToast('Failed to load problems. Is the server running?', 'error');
        setProblems([]);
      } finally {
        setLoading(false);
      }
    }
    loadProblems();
  }, [page, pageSize, search, difficultyFilter, statusFilter, patternFilter]);

  // Curated common pattern options plus any loaded patterns
  const standardPatterns = [
    'All',
    'HashMap',
    'Two Pointers',
    'Sliding Window',
    'Binary Search',
    'Prefix Sum',
    'Fast & Slow Pointers',
    'Linked List',
    'Trees',
    'Depth-First Search',
    'Breadth-First Search',
    'Graph',
    'Dynamic Programming',
    'Stack',
    'Monotonic Stack',
    'Heap',
    'Backtracking',
    'Trie',
    'Greedy',
    'Intervals',
    'Matrix',
    'Bit Manipulation'
  ];
  const availablePatterns = Array.from(new Set([...standardPatterns, ...(problems.flatMap(p => p.patterns || []))]));

  const updateFilterParams = (newFilters) => {
    const nextSearch = newFilters.search !== undefined ? newFilters.search : search;
    const nextDiff = newFilters.difficulty !== undefined ? newFilters.difficulty : difficultyFilter;
    const nextStatus = newFilters.status !== undefined ? newFilters.status : statusFilter;
    const nextPattern = newFilters.pattern !== undefined ? newFilters.pattern : patternFilter;
    const nextPage = newFilters.page !== undefined ? newFilters.page : 1;
    const nextLimit = newFilters.limit !== undefined ? newFilters.limit : pageSize;

    setSearch(nextSearch);
    setDifficultyFilter(nextDiff);
    setStatusFilter(nextStatus);
    setPatternFilter(nextPattern);
    setPage(nextPage);
    setPageSize(nextLimit);

    const params = {};
    if (nextSearch) params.search = nextSearch;
    if (nextDiff !== 'All') params.difficulty = nextDiff;
    if (nextStatus !== 'All') params.status = nextStatus;
    if (nextPattern !== 'All') params.pattern = nextPattern;
    if (nextPage > 1) params.page = String(nextPage);
    if (nextLimit !== 15) params.limit = String(nextLimit);

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

  const paginatedProblems = problems;

  return (
    <AppShell title="Problems Directory" crumb="Prepare">
      <div className="enter">
        <div className="page-intro" style={{ marginBottom: '20px' }}>
          <h1>DSA Problem Bank</h1>
          <p>Targeted problem list tagged by core algorithmic pattern and status.</p>
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
              {loading ? (
                <tr>
                  <td colSpan="6">
                    <div style={{ textAlign: 'center', padding: '48px 20px' }}>
                      <div className="spinner" style={{ margin: '0 auto 12px', width: '28px', height: '28px' }}></div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '13.5px' }}>Loading problems from database...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedProblems.length === 0 ? (
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
          {totalCount > 0 && (
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <div>
                  Showing <strong>{(page - 1) * pageSize + 1}</strong> to <strong>{Math.min(page * pageSize, totalCount)}</strong> of <strong>{totalCount}</strong> problems
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '12px' }}>Rows:</span>
                  <select
                    className="input"
                    value={pageSize}
                    onChange={(e) => updateFilterParams({ limit: parseInt(e.target.value) || 15, page: 1 })}
                    style={{ width: 'auto', padding: '2px 8px', fontSize: '12px', height: '26px' }}
                  >
                    <option value="10">10 / page</option>
                    <option value="15">15 / page</option>
                    <option value="25">25 / page</option>
                    <option value="50">50 / page</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  className="btn btn-sm btn-secondary"
                  disabled={page <= 1}
                  onClick={() => updateFilterParams({ page: Math.max(1, page - 1) })}
                  style={{ gap: '4px' }}
                >
                  <ChevronLeft size={14} /> Previous
                </button>
                
                <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text)', padding: '0 6px' }}>
                  Page {page} of {totalPages}
                </span>

                <button
                  className="btn btn-sm btn-secondary"
                  disabled={page >= totalPages}
                  onClick={() => updateFilterParams({ page: Math.min(totalPages, page + 1) })}
                  style={{ gap: '4px' }}
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
