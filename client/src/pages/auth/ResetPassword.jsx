import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import AuthBackground from '../../components/auth/AuthBackground';
import { authAPI } from '../../services/api';
import { useToast } from '../../components/common/Toast';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token || !email) {
      showToast('Missing reset token or email. Please request a new link.', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters long.', 'warning');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    setLoading(true);
    try {
      await authAPI.resetPassword({ email, token, newPassword });
      setSuccess(true);
      showToast('Password successfully reset! You can now log in.', 'success');
      setTimeout(() => {
        navigate('/auth/login');
      }, 2500);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to reset password. Link may have expired.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <AuthBackground />
      <div className="auth-card enter">
        <div className="auth-brand">
          <img
            src="/logo-mark.png"
            alt="Ancora"
            style={{
              width: 42,
              height: 42,
              filter: 'drop-shadow(0 0 16px rgba(99, 102, 241, 0.65))',
              objectFit: 'contain'
            }}
          />
          <div
            className="name"
            style={{
              fontWeight: 800,
              fontSize: 22,
              letterSpacing: '-0.5px',
              background: 'linear-gradient(135deg, #818CF8 0%, #C084FC 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Ancora
          </div>
        </div>

        <h1>Set New Password</h1>
        <p className="sub">
          {email ? `Updating password for ${email}` : 'Enter your new secure password.'}
        </p>

        {!token || !email ? (
          <div className="state-block" style={{ padding: '20px 0' }}>
            <div className="state-icon" style={{ background: 'var(--danger-tint)', color: 'var(--danger)' }}>
              <AlertCircle size={24} />
            </div>
            <h3>Invalid or Missing Reset Link</h3>
            <p>This password reset link is invalid or incomplete. Please request a fresh reset link.</p>
            <Link to="/auth/forgot-password" className="btn btn-secondary btn-block" style={{ marginTop: '20px' }}>
              Request New Reset Link
            </Link>
          </div>
        ) : success ? (
          <div className="state-block" style={{ padding: '20px 0' }}>
            <div className="state-icon" style={{ background: 'var(--success-tint)', color: 'var(--success)' }}>
              <CheckCircle2 size={24} />
            </div>
            <h3>Password Reset!</h3>
            <p>Your password has been updated successfully. Redirecting you to sign in...</p>
            <Link to="/auth/login" className="btn btn-primary btn-block" style={{ marginTop: '20px' }}>
              Sign In Now
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>New Password</label>
              <input
                type="password"
                className="input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                minLength={6}
                required
              />
            </div>

            <div className="field">
              <label>Confirm New Password</label>
              <input
                type="password"
                className="input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type your password"
                minLength={6}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Updating Password...' : 'Save New Password'} {!loading && <Lock size={15} />}
            </button>
          </form>
        )}

        <div className="auth-foot">
          <Link to="/auth/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <ArrowLeft size={14} /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
