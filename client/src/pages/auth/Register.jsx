import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, User, Mail, Lock, Building, Briefcase } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: 'Mohit Gupta',
    email: 'mohit@example.com',
    password: 'password123',
    role: 'Software Engineer',
    company: 'Razorpay'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError('Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card enter" style={{ width: '460px' }}>
        <div className="auth-brand">
          <div className="mark">IC</div>
          <div className="name">Interview Companion</div>
        </div>
        <h1>Create your account</h1>
        <p className="sub">Start tracking patterns, attempts, and spaced repetition goals.</p>

        {error && <div className="field-error" style={{ display: 'block', marginBottom: '16px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              className="input"
              value={formData.name}
              onChange={handleChange}
              placeholder="Mohit Gupta"
              required
            />
          </div>

          <div className="field">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              className="input"
              value={formData.email}
              onChange={handleChange}
              placeholder="mohit@example.com"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="field">
              <label>Current Role</label>
              <input
                type="text"
                name="role"
                className="input"
                value={formData.role}
                onChange={handleChange}
                placeholder="Software Engineer"
              />
            </div>
            <div className="field">
              <label>Target / Current Company</label>
              <input
                type="text"
                name="company"
                className="input"
                value={formData.company}
                onChange={handleChange}
                placeholder="Razorpay"
              />
            </div>
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              name="password"
              className="input"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating Account...' : 'Get Started Free'} <ArrowRight size={16} />
          </button>
        </form>

        <div className="auth-foot">
          Already have an account? <Link to="/auth/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
