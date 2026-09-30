import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import { adminAPI } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { Search, UserCheck, Shield, AlertTriangle, Users as UsersIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await adminAPI.getUsers();
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        showToast('Failed to load users', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, []);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (st) => {
    setStatusFilter(st);
    setPage(1);
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase().trim();
    const matchesSearch = !q || (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE) || 1;
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + PAGE_SIZE);

  const activeCount = users.filter(u => u.status === 'Active').length;
  const suspendedCount = users.filter(u => u.status === 'Suspended').length;

  return (
    <AppShell title="Users Management" crumb="People">
      <div className="enter">
        <div className="page-intro">
          <h1>Platform Users</h1>
          <p>Manage accounts, access tiers, and study activity of all registered users.</p>
        </div>

        {/* Stat Strip */}
        <div className="stat-strip">
          <div className="stat-card">
            <div className="label">TOTAL USERS</div>
            <div className="value">{users.length}</div>
          </div>
          <div className="stat-card">
            <div className="label">ACTIVE USERS</div>
            <div className="value" style={{ color: 'var(--success)' }}>{activeCount}</div>
          </div>
          <div className="stat-card">
            <div className="label">PREMIUM PLAN</div>
            <div className="value">{users.filter(u => u.plan === 'Premium' || u.role === 'admin').length}</div>
          </div>
          <div className="stat-card">
            <div className="label">SUSPENDED</div>
            <div className="value" style={{ color: 'var(--danger)' }}>{suspendedCount}</div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <div className="search-box" style={{ width: '280px' }}>
            <Search size={15} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={handleSearchChange}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {['all', 'Active', 'Inactive', 'Suspended'].map(st => (
              <button
                key={st}
                className={`filter-chip ${statusFilter === st ? 'active' : ''}`}
                onClick={() => handleStatusChange(st)}
              >
                {st === 'all' ? 'All Status' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="card card-flush">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Target Role</th>
                <th>Problems Solved</th>
                <th>Streak</th>
                <th>Status</th>
                <th>Last Active</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <div className="state-block">
                      <div className="state-icon">👤</div>
                      <h3>No users found</h3>
                      <p>Try clearing filters or search terms.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => {
                  const userId = u._id || u.id;
                  return (
                    <tr
                      key={userId}
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/admin/users/${userId}`)}
                    >
                      <td>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <div className="avatar">{(u.name || 'User').split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{u.name || 'Unnamed User'}</div>
                            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: '13px' }}>{u.targetRole || 'Software Engineer'}</td>
                      <td className="mono">{u.problemsSolved || 0} / {u.problemsAttempted || 0}</td>
                      <td className="mono">{u.currentStreak || 0}d 🔥</td>
                      <td>
                        <span className={`badge ${
                          u.status === 'Active' ? 'badge-success' : u.status === 'Suspended' ? 'badge-danger' : 'badge-neutral'
                        }`}>
                          {u.status || 'Active'}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{u.lastActive || 'Recent'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Pagination Footer */}
          {filteredUsers.length > 0 && (
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
                Showing <strong>{startIndex + 1}</strong> to <strong>{Math.min(startIndex + PAGE_SIZE, filteredUsers.length)}</strong> of <strong>{filteredUsers.length}</strong> users
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  className="btn btn-sm btn-secondary"
                  disabled={currentPage <= 1}
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
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
    </AppShell>
  );
}
