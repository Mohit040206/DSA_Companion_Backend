import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) setSent(true);
  };

  return (
    <div className="auth-page">
      <div className="auth-card enter">
        <div className="auth-brand">
          <div className="mark">IC</div>
          <div className="name">Interview Companion</div>
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

            <button type="submit" className="btn btn-primary btn-block">
              Send Reset Link <Send size={15} />
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
