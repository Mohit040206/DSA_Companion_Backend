import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, Lock, Mail, Code } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('mohit@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setError('Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card enter">
        <div className="auth-brand">
          <div className="mark">IC</div>
          <div className="name">Interview Companion</div>
        </div>
        <h1>Welcome back</h1>
        <p className="sub">Sign in to track your DSA mastery and interview prep.</p>

        {error && <div className="field-error" style={{ display: 'block', marginBottom: '16px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email Address</label>
            <div className="input-with-icon" style={{ position: 'relative' }}>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
              />
            </div>
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="auth-row">
            <label className="checkbox-row">
              <input type="checkbox" defaultChecked /> Remember me
            </label>
            <Link to="/auth/forgot-password">Forgot password?</Link>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'} <ArrowRight size={16} />
          </button>
        </form>

        <div className="divider-label">OR CONTINUE WITH</div>

        <div className="social-row">
          <button className="btn-social" type="button" onClick={() => { login({ email, password }); navigate('/dashboard'); }}>
            <Code size={16} /> Quick Demo Access
          </button>
        </div>

        <div className="auth-foot">
          Don't have an account? <Link to="/auth/register">Sign up</Link>
        </div>

        <div className="mock-note">
          💡 Demo Mode Active: You can click Sign In with default credentials to enter the workspace.
        </div>
      </div>
    </div>
  );
}
