import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import { problemAPI, adminAPI } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import {
  UploadCloud,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

export default function AdminProblems() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [targetProblem, setTargetProblem] = useState(null);

  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const queryParams = {
          page,
          limit: pageSize,
          search: search || undefined,
          tier: tierFilter !== 'all' ? tierFilter : undefined
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
        showToast('Failed to load admin problems', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [page, pageSize, search, tierFilter]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleTierChange = (tier) => {
    setTierFilter(tier);
    setPage(1);
  };

  const confirmDelete = (problem) => {
    setTargetProblem(problem);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!targetProblem) return;
    try {
      const probId = targetProblem._id || targetProblem.id;
      await adminAPI.deleteProblem(probId);
      setProblems(prev => prev.filter(p => p._id !== probId && p.id !== probId));
      showToast(`"${targetProblem.title}" removed successfully.`, 'success');
      setDeleteModalOpen(false);
      setTargetProblem(null);
    } catch (err) {
      showToast('Failed to remove problem', 'error');
    }
  };

  const paginatedProblems = problems;

  return (
    <AppShell title="Manage Problems" crumb="Content">
      <div className="enter">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
          <div className="page-intro" style={{ marginBottom: 0 }}>
            <h1>Manage Platform Problems</h1>
            <p>Every problem learners see across Interview Companion.</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/admin/bulk-upload" className="btn btn-secondary">
              <UploadCloud size={16} /> Bulk Upload
            </Link>
            <Link to="/admin/problems/new" className="btn btn-primary">
              <Plus size={16} /> Add Problem
            </Link>
          </div>
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <div className="search-box" style={{ width: '300px' }}>
            <Search size={15} />
            <input
              type="text"
              placeholder="Search title, pattern, company..."
              value={search}
              onChange={handleSearchChange}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {['all', 'Core', 'Premium'].map((t) => (
              <button
                key={t}
                className={`filter-chip ${tierFilter === t ? 'active' : ''}`}
                onClick={() => handleTierChange(t)}
              >
                {t === 'all' ? 'All Tiers' : t}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="card card-flush">
          <table className="table">
            <thead>
              <tr>
                <th>Problem Title</th>
                <th>Difficulty</th>
                <th>Patterns</th>
                <th>Companies</th>
                <th>Tier</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProblems.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <div className="state-block">
                      <div className="state-icon">🔍</div>
                      <h3>No matching problems found</h3>
                      <p>Try clearing filters or search terms.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedProblems.map((p) => {
                  const probId = p._id || p.id;
                  return (
                    <tr key={probId}>
                      <td
                        className="problem-name"
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/admin/problems/edit/${probId}`)}
                      >
                        {p.title}
                      </td>
                      <td>
                        <span className={`badge ${p.difficulty === 'Easy' ? 'badge-success' : p.difficulty === 'Medium' ? 'badge-warning' : 'badge-danger'}`}>
                          {p.difficulty}
                        </span>
                      </td>
                      <td>
                        <div className="pattern-tag-row">
                          {(p.patterns || []).map((pat) => (
                            <span key={pat} className="pattern-tag mono">{pat}</span>
                          ))}
                        </div>
                      </td>
                      <td style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                        {(p.companies || []).join(', ') || '—'}
                      </td>
                      <td>
                        <span className={`badge ${p.tier === 'Premium' ? 'badge-accent' : 'badge-neutral'}`}>
                          {p.tier || 'Core'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button
                          className="icon-btn"
                          title="Edit"
                          onClick={(e) => { e.stopPropagation(); navigate(`/admin/problems/edit/${probId}`); }}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          className="icon-btn"
                          title="Delete"
                          style={{ color: 'var(--danger)' }}
                          onClick={(e) => { e.stopPropagation(); confirmDelete(p); }}
                        >
                          <Trash2 size={15} />
                        </button>
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
                  Showing <strong>{(page - 1) * pageSize + 1}</strong> to <strong>{Math.min(page * pageSize, totalCount)}</strong> of <strong>{totalCount}</strong> platform problems
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '12px' }}>Rows:</span>
                  <select
                    className="input"
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(parseInt(e.target.value) || 10);
                      setPage(1);
                    }}
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
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
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
                  onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                  style={{ gap: '4px' }}
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <div className={`modal-overlay ${deleteModalOpen ? 'open' : ''}`}>
        <div className="modal">
          <h3>Remove this problem?</h3>
          <p>
            This removes <strong>"{targetProblem?.title}"</strong> from every learner's problem browser. This action cannot be undone.
          </p>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              style={{ background: 'var(--danger)' }}
              onClick={handleDelete}
            >
              Remove Problem
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
