import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import { problemAPI, adminAPI } from '../../services/api';
import { Shield, Plus, UploadCloud, Users, Code2, TrendingUp, ArrowRight } from 'lucide-react';

export default function AdminDashboard() {
  const [problems, setProblems] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function loadStats() {
      const [probs, u] = await Promise.all([
        problemAPI.getAll({ all: true }),
        adminAPI.getUsers({ all: true })
      ]);
      setProblems(probs || []);
      setUsers(u || []);
    }
    loadStats();
  }, []);

  return (
    <AppShell title="Admin Portal Dashboard" crumb="Admin">
      <div className="enter">
        <div className="page-intro">
          <h1>Platform Administration</h1>
          <p>Manage problem bank, content tiers, user accounts, and platform health.</p>
        </div>

        {/* Stat Cards Strip */}
        <div className="stat-strip">
          <div className="stat-card">
            <div className="label">TOTAL PROBLEMS</div>
            <div className="value">{problems.length}</div>
            <div className="delta"><TrendingUp size={12} /> Active in directory</div>
          </div>
          <div className="stat-card">
            <div className="label">TOTAL USERS</div>
            <div className="value">{users.length}</div>
            <div className="delta" style={{ color: 'var(--success)' }}>+100% active</div>
          </div>
          <div className="stat-card">
            <div className="label">CORE PROBLEMS</div>
            <div className="value">{problems.filter(p => p.tier !== 'Premium').length}</div>
          </div>
          <div className="stat-card">
            <div className="label">PREMIUM PROBLEMS</div>
            <div className="value" style={{ color: 'var(--accent)' }}>
              {problems.filter(p => p.tier === 'Premium').length}
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="two-col-layout" style={{ marginBottom: '24px' }}>
          <div className="card">
            <div className="section-head">
              <h2>Content Management</h2>
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '18px' }}>
              Add individual problems or batch import questions via CSV/JSON schemas.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link to="/admin/problems" className="btn btn-primary">
                <Code2 size={16} /> Manage Problems
              </Link>
              <Link to="/admin/bulk-upload" className="btn btn-secondary">
                <UploadCloud size={16} /> Bulk Importer
              </Link>
            </div>
          </div>

          <div className="card">
            <div className="section-head">
              <h2>User Administration</h2>
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '18px' }}>
              View user activity logs, assign roles, and manage account statuses.
            </p>
            <Link to="/admin/users" className="btn btn-primary">
              <Users size={16} /> Manage Users <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
