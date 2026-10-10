import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, User, Mail, Lock, Building, Briefcase, Eye, EyeOff } from 'lucide-react';
import AuthBackground from '../../components/auth/AuthBackground';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: '',
    company: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      // Auto-suggest username from name if username field hasn't been manually customized
      if (name === 'name' && (!prev.username || prev.username === prev.name?.toLowerCase().replace(/[^a-z0-9]/g, ''))) {
        updated.username = value.toLowerCase().replace(/[^a-z0-9]/g, '');
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <AuthBackground />
      <div className="auth-card enter" style={{ width: '480px' }}>
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
        <h1>Create your Ancora account</h1>
        <p className="sub">They know your submissions. Ancora knows your journey.</p>

        {error && <div className="field-error" style={{ display: 'block', marginBottom: '16px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="field">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                className="input"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Alex Morgan"
                required
              />
            </div>
            <div className="field">
              <label>Username</label>
              <input
                type="text"
                name="username"
                className="input"
                value={formData.username}
                onChange={handleChange}
                placeholder="e.g. alex01"
                required
              />
            </div>
          </div>

          <div className="field">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              className="input"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@company.com"
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
                placeholder="e.g. Software Engineer"
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
                placeholder="e.g. Google, Amazon, Startup"
              />
            </div>
          </div>

          <div className="field">
            <label>Password</label>
            <div className="input-with-icon" style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="input"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  color: 'var(--text-muted)'
                }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
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
