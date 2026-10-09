import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import AuthBackground from '../../components/auth/AuthBackground';

import { authAPI } from '../../services/api';
import { useToast } from '../../components/common/Toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
      showToast('Password reset link sent to your email!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to send reset link. Please try again.', 'error');
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
        <h1>Reset Password</h1>
        <p className="sub">Enter your email and we'll send password reset instructions.</p>

        {sent ? (
          <div className="state-block" style={{ padding: '20px 0' }}>
            <div className="state-icon" style={{ background: 'var(--success-tint)', color: 'var(--success)' }}>
              ✓
            </div>
            <h3>Reset link sent!</h3>
            <p>If an account exists for {email}, a reset link has been dispatched.</p>
            <Link to="/auth/login" className="btn btn-secondary btn-block" style={{ marginTop: '20px' }}>
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Email Address</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Sending Instructions...' : 'Send Reset Link'} {!loading && <Send size={15} />}
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
