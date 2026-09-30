import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import { adminAPI } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { ArrowLeft, Shield, CheckCircle2, AlertTriangle, UserX, UserCheck } from 'lucide-react';

export default function AdminUserDetail() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    async function loadUserData() {
      try {
        const u = await adminAPI.getUserById(id);
        setUser(u);
      } catch (err) {
        showToast('Error loading user profile', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadUserData();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      await adminAPI.updateUserStatus(id, newStatus);
      setUser(prev => ({ ...prev, status: newStatus }));
      showToast(`User status updated to ${newStatus}`, 'success');
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  if (loading || !user) {
    return (
      <AppShell title="User Profile" crumb="People">
        <div className="state-block">
          <div className="skeleton skeleton-card" style={{ height: '200px' }} />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title={user.name} crumb="People">
      <div className="enter">
        <Link to="/admin/users" className="breadcrumb-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
          <ArrowLeft size={16} /> All Users
        </Link>

        <div className="card profile-head">
          <div className="avatar lg">{(user.name || 'U').split(' ').map(n=>n[0]).join('')}</div>
          <div>
            <h1 className="profile-name">{user.name}</h1>
            <div className="profile-role">{user.email} • Role: <strong>{user.role}</strong></div>
            <div style={{ marginTop: '8px' }}>
              <span className={`badge ${user.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                Status: {user.status}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <div className="section-head"><h2>Account Management</h2></div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {user.status !== 'Active' && (
              <button className="btn btn-primary" onClick={() => handleStatusChange('Active')}>
                <UserCheck size={16} /> Activate Account
              </button>
            )}
            {user.status !== 'Suspended' && (
              <button className="btn btn-secondary" style={{ color: 'var(--danger)' }} onClick={() => handleStatusChange('Suspended')}>
                <UserX size={16} /> Suspend Account
              </button>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
