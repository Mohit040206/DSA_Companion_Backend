import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import { problemAPI, patternAPI, adminAPI } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { ArrowLeft, Check, Plus, X } from 'lucide-react';

export default function AdminProblemForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [patternsList, setPatternsList] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    difficulty: 'Medium',
    platform: 'LeetCode',
    url: '',
    estimatedTime: '20-25 min',
    tier: 'Core',
    patterns: [],
    concepts: [],
    companies: [],
    learningObjectives: ''
  });

  const [conceptInput, setConceptInput] = useState('');
  const [companyInput, setCompanyInput] = useState('');
  const [newPatternInput, setNewPatternInput] = useState('');
  const [creatingPattern, setCreatingPattern] = useState(false);

  useEffect(() => {
    async function loadFormDependencies() {
      const pats = await patternAPI.getAll();
      setPatternsList(pats || []);

      if (isEditing) {
        const prob = await problemAPI.getById(id);
        if (prob) {
          setFormData({
            title: prob.title || '',
            difficulty: prob.difficulty || 'Medium',
            platform: prob.platform || 'LeetCode',
            url: prob.url || '',
            estimatedTime: prob.estimatedTime || '20-25 min',
            tier: prob.tier || 'Core',
            patterns: prob.patterns || [],
            concepts: prob.concepts || [],
            companies: prob.companies || [],
            learningObjectives: prob.learningObjectives || ''
          });
        }
      }
    }
    loadFormDependencies();
  }, [id, isEditing]);

  const togglePattern = (patName) => {
    if (!patName) return;
    setFormData(prev => {
      const exists = prev.patterns.some(p => p.toLowerCase() === patName.toLowerCase());
      return {
        ...prev,
        patterns: exists
          ? prev.patterns.filter(p => p.toLowerCase() !== patName.toLowerCase())
          : [...prev.patterns, patName]
      };
    });
  };

  const handleAddNewPattern = async () => {
    const trimmed = newPatternInput.trim();
    if (!trimmed) return;
    setCreatingPattern(true);
    try {
      const res = await patternAPI.create({ name: trimmed });
      const createdName = res.name || trimmed;
      setPatternsList(prev => {
        if (!prev.some(p => (p.name || '').toLowerCase() === createdName.toLowerCase())) {
          return [...prev, { id: res.slug || res.id || createdName, name: createdName }];
        }
        return prev;
      });
      togglePattern(createdName);
      setNewPatternInput('');
      showToast(`Pattern "${createdName}" created & AI deep dive generated!`, 'success');
    } catch (err) {
      showToast('Failed to create pattern', 'error');
    } finally {
      setCreatingPattern(false);
    }
  };

  const addConcept = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && conceptInput.trim()) {
      e.preventDefault();
      if (!formData.concepts.includes(conceptInput.trim())) {
        setFormData(prev => ({ ...prev, concepts: [...prev.concepts, conceptInput.trim()] }));
      }
      setConceptInput('');
    }
  };

  const removeConcept = (index) => {
    setFormData(prev => ({ ...prev, concepts: prev.concepts.filter((_, i) => i !== index) }));
  };

  const addCompany = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && companyInput.trim()) {
      e.preventDefault();
      if (!formData.companies.includes(companyInput.trim())) {
        setFormData(prev => ({ ...prev, companies: [...prev.companies, companyInput.trim()] }));
      }
      setCompanyInput('');
    }
  };

  const removeCompany = (index) => {
    setFormData(prev => ({ ...prev, companies: prev.companies.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.url) {
      showToast('Please fill in title and URL', 'warning');
      return;
    }
    try {
      if (isEditing) {
        await adminAPI.updateProblem(id, formData);
        showToast('Problem updated successfully!', 'success');
      } else {
        await problemAPI.create(formData);
        showToast('Problem created platform-wide!', 'success');
      }
      navigate('/admin/problems');
    } catch (err) {
      showToast('Error saving problem', 'error');
    }
  };

  return (
    <AppShell title={isEditing ? 'Edit Problem' : 'Add Problem'} crumb="Content">
      <div className="enter">
        <Link to="/admin/problems" className="breadcrumb-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
          <ArrowLeft size={16} /> All Problems
        </Link>
        <div className="page-intro">
          <h1>{isEditing ? 'Edit Problem' : 'Add a Problem'}</h1>
          <p>This appears across every learner's problem browser once saved.</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basics Card */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="section-head"><h2>Basics</h2></div>
            <div className="field">
              <label>Problem Title</label>
              <input
                className="input"
                placeholder="e.g. Subarray Sum Equals K"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="field">
                <label>Difficulty</label>
                <select
                  className="input"
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div className="field">
                <label>Platform</label>
                <select
                  className="input"
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                >
                  <option value="LeetCode">LeetCode</option>
                  <option value="HackerRank">HackerRank</option>
                  <option value="Codeforces">Codeforces</option>
                  <option value="Internal">Internal</option>
                </select>
              </div>
            </div>

            <div className="field">
              <label>Problem URL</label>
              <input
                className="input"
                placeholder="https://leetcode.com/problems/..."
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="field">
                <label>Estimated Time</label>
                <input
                  className="input"
                  placeholder="e.g. 20–25 min"
                  value={formData.estimatedTime}
                  onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                />
              </div>

              <div className="field">
                <label>Access Tier</label>
                <select
                  className="input"
                  value={formData.tier}
                  onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                >
                  <option value="Core">Core (Free)</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>
            </div>
          </div>

          {/* Classification Card */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="section-head"><h2>Classification & Patterns</h2></div>
            <div className="field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ margin: 0 }}>Algorithmic Patterns ({formData.patterns.length} selected)</label>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Click chips to toggle
                </span>
              </div>

              {/* Pattern Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                {patternsList.map(pat => {
                  const patName = pat.name || pat.id;
                  const isChecked = formData.patterns.some(p => p.toLowerCase() === patName.toLowerCase());
                  return (
                    <button
                      type="button"
                      key={pat.id || patName}
                      className={`filter-chip ${isChecked ? 'active' : ''}`}
                      onClick={() => togglePattern(patName)}
                      style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                    >
                      {isChecked ? '✓ ' : ''}{patName}
                    </button>
                  );
                })}
              </div>

              {/* Inline Create New Pattern (Admin Exclusive) */}
              <div style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-sm)',
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}>
                    ➕ Admin: Create New Algorithmic Pattern
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--accent)' }}>
                    ✨ AI auto-generates deep-dive & invariants into MongoDB
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Segment Tree, Monotonic Deque, Trie..."
                    value={newPatternInput}
                    onChange={(e) => setNewPatternInput(e.target.value)}
                    style={{ height: '34px', fontSize: '13px', maxWidth: '340px' }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddNewPattern();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={handleAddNewPattern}
                    disabled={!newPatternInput.trim() || creatingPattern}
                    style={{ height: '34px' }}
                  >
                    {creatingPattern ? 'Generating with AI...' : '+ Add Pattern'}
                  </button>
                </div>
              </div>
            </div>

            <div className="field">
              <label>Concepts Tags (Type and press Enter)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                {formData.concepts.map((c, i) => (
                  <span key={i} className="badge badge-accent" style={{ padding: '6px 10px', fontSize: '12px' }}>
                    {c} <X size={12} style={{ cursor: 'pointer', marginLeft: '4px' }} onClick={() => removeConcept(i)} />
                  </span>
                ))}
              </div>
              <input
                className="input"
                placeholder="e.g. Running sum, Complement search (press Enter)..."
                value={conceptInput}
                onChange={(e) => setConceptInput(e.target.value)}
                onKeyDown={addConcept}
              />
            </div>

            <div className="field">
              <label>Companies Asked (Type and press Enter)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                {formData.companies.map((c, i) => (
                  <span key={i} className="badge badge-neutral" style={{ padding: '6px 10px', fontSize: '12px' }}>
                    {c} <X size={12} style={{ cursor: 'pointer', marginLeft: '4px' }} onClick={() => removeCompany(i)} />
                  </span>
                ))}
              </div>
              <input
                className="input"
                placeholder="e.g. Meta, Stripe, Google (press Enter)..."
                value={companyInput}
                onChange={(e) => setCompanyInput(e.target.value)}
                onKeyDown={addCompany}
              />
            </div>
          </div>

          {/* Learning Objectives */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="section-head"><h2>Learning Context</h2></div>
            <div className="field">
              <label>Learning Objective / Core Takeaway</label>
              <textarea
                className="input"
                rows="3"
                placeholder="What should a learner take away from solving this problem?"
                value={formData.learningObjectives}
                onChange={(e) => setFormData({ ...formData, learningObjectives: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <Link to="/admin/problems" className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary">
              <Check size={16} /> Save Problem
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
