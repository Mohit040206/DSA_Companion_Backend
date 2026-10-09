import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import { patternAPI, problemAPI } from '../services/api';
import { getPatternKnowledge } from '../data/patternKnowledge';
import {
  ChevronLeft,
  ArrowRight,
  Sparkles,
  Code,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  ShieldCheck,
  Clock,
  Layers,
  HelpCircle,
  Lightbulb
} from 'lucide-react';

export default function PatternDetail() {
  const { id } = useParams();
  const [pattern, setPattern] = useState(null);
  const [knowledge, setKnowledge] = useState(null);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [pats, allProbs, dbPattern] = await Promise.all([
          patternAPI.getAll(),
          problemAPI.getAll({ all: true }),
          patternAPI.getDeepDive(id)
        ]);

        const rawList = Array.isArray(allProbs) ? allProbs : (allProbs.problems || []);

        const found = pats.find(p => p.id === id) ||
          pats.find(p => p.name?.toLowerCase().replace(/\s+/g, '-') === id?.toLowerCase()) ||
          pats[0] ||
          { id, name: id ? id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Pattern', solved: 0, attempted: 0, avgConfidence: 4, status: 'Developing' };

        setPattern(found);

        // Prioritize dynamic DB knowledge (with AI-generated info), fallback to curated knowledge
        if (dbPattern && dbPattern.nodes && dbPattern.nodes.length > 0) {
          setKnowledge(dbPattern);
        } else {
          setKnowledge(getPatternKnowledge(found.name, found.id));
        }

        const cleanId = (id || '').toLowerCase().replace(/-/g, ' ');
        const matchingProbs = rawList.filter(p => {
          return (p.patterns || []).some(pat => {
            const pLower = pat.toLowerCase();
            return pLower.includes(cleanId) ||
                   cleanId.includes(pLower) ||
                   (found.name && pLower.includes(found.name.toLowerCase())) ||
                   (found.name && found.name.toLowerCase().includes(pLower));
          });
        });

        setProblems(matchingProbs.length > 0 ? matchingProbs : rawList.slice(0, 10));
      } catch (err) {
        setProblems([]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  // Set default selected node
  useEffect(() => {
    if (knowledge?.nodes?.length > 0 && !selectedNodeId) {
      setSelectedNodeId(knowledge.nodes[0].id);
    }
  }, [knowledge, selectedNodeId]);

  const selectedNode = knowledge?.nodes?.find(n => n.id === selectedNodeId) || knowledge?.nodes?.[0];

  const handleCopyCode = () => {
    if (!knowledge?.blueprint) return;
    navigator.clipboard.writeText(knowledge.blueprint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading || !pattern || !knowledge) {
    return (
      <AppShell title="Pattern Detail" crumb="Patterns">
        <div className="state-block">
          <div className="skeleton skeleton-card" style={{ height: '240px' }} />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title={pattern.name} crumb="Patterns">
      <div className="enter">
        {/* Header Breadcrumb & Badges */}
        <div className="detail-header" style={{ marginBottom: '24px' }}>
          <Link to="/patterns" className="breadcrumb-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
            <ChevronLeft size={16} /> Back to Algorithmic Patterns
          </Link>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '6px' }}>{pattern.name} Deep-Dive</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', margin: 0 }}>
                {knowledge.subtitle}
              </p>
            </div>
            <div className="badge-row" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span className={`badge ${pattern.status === 'Strong' ? 'badge-success' : pattern.status === 'Needs attention' ? 'badge-danger' : 'badge-warning'}`}>
                {pattern.status || 'Developing'}
              </span>
              <span className="badge badge-accent">Confidence: {pattern.avgConfidence} / 5 ⭐</span>
              <span className="badge badge-neutral">
                {pattern.solved || 0} / {problems.length} Solved
              </span>
              <span className="badge" style={{ background: 'var(--surface-hover)', border: '1px solid var(--border)' }}>
                {problems.length} Problem{problems.length !== 1 ? 's' : ''} Tagged
              </span>
            </div>
          </div>
        </div>

        {/* ── BEGINNER INTUITION & MENTAL MODEL ── */}
        {knowledge.beginnerIntuition && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(139, 92, 246, 0.06) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: 'var(--r-md)',
            padding: '16px 20px',
            marginBottom: '22px',
            display: 'flex',
            gap: '14px',
            alignItems: 'flex-start'
          }}>
            <Lightbulb size={22} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                Beginner Intuition & Mental Model
              </div>
              <div style={{ fontSize: '13.5px', color: 'var(--text)', lineHeight: 1.6 }}>
                {knowledge.beginnerIntuition}
              </div>
            </div>
          </div>
        )}

        {/* ── CONCEPT MAP & INTERACTIVE NODE PIPELINE ── */}
        <div className="constellation-panel">
          <div className="concept-map-header">
            <div>
              <div className="concept-map-title">
                <Sparkles size={18} style={{ color: 'var(--accent)' }} />
                <span>Concept Map & Node Invariants</span>
              </div>
              <div className="concept-map-sub">
                Click any node in the pipeline below to inspect its operational role, invariant guarantee, and edge-case traps.
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
              <Layers size={14} />
              <span>{knowledge.nodes.length}-Stage Execution Model</span>
            </div>
          </div>

          {/* Interactive Node Flow Track */}
          <div className="concept-flow-track">
            {knowledge.nodes.map((node, index) => {
              const isSelected = node.id === selectedNode?.id;
              return (
                <div
                  key={node.id}
                  className={`concept-flow-node ${isSelected ? 'active' : ''}`}
                  onClick={() => setSelectedNodeId(node.id)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <span
                      className="concept-flow-node-badge"
                      style={{
                        background: `${node.color}22`,
                        color: node.color,
                        border: `1px solid ${node.color}44`
                      }}
                    >
                      Step {index + 1} · {node.badge}
                    </span>
                    {isSelected && (
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }} />
                    )}
                  </div>

                  <div className="concept-flow-node-title">{node.title}</div>
                  <div className="concept-flow-node-role">{node.role}</div>
                </div>
              );
            })}
          </div>

          {/* Selected Node Inspector Card */}
          {selectedNode && (
            <div className="concept-inspector-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '14px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text)' }}>
                      {selectedNode.title}
                    </h4>
                    <span className="badge" style={{ fontSize: '10.5px', padding: '2px 8px' }}>
                      {selectedNode.role}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.55 }}>
                    {selectedNode.desc}
                  </p>
                </div>
              </div>

              {/* Invariant & Pitfall Side-by-Side Breakdown */}
              <div className="concept-inspector-grid">
                <div className="concept-detail-block invariant">
                  <div className="concept-detail-lbl invariant">
                    <CheckCircle2 size={13} /> Invariant Maintained Here
                  </div>
                  <div className="concept-detail-txt">
                    {selectedNode.invariant}
                  </div>
                </div>

                <div className="concept-detail-block pitfall">
                  <div className="concept-detail-lbl pitfall">
                    <AlertTriangle size={13} /> Common Trap / Failure Mode
                  </div>
                  <div className="concept-detail-txt">
                    {selectedNode.pitfall}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── FORMAL ALGORITHMIC INVARIANT PROOF CARD ── */}
        <div className="invariant-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <ShieldCheck size={18} style={{ color: '#10b981' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
                  Algorithmic Invariant Proof
                </h3>
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0 }}>
                What is an invariant? It is a condition that must strictly hold true before and after each iteration, mathematically proving correctness upon termination.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span className="badge badge-accent" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <Clock size={12} /> {knowledge.invariants.timeComplexity}
              </span>
              <span className="badge badge-neutral" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <Layers size={12} /> {knowledge.invariants.spaceComplexity}
              </span>
            </div>
          </div>

          {/* Core Invariant Callout */}
          <div style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: 'var(--r-md)',
            padding: '14px 16px',
            marginTop: '16px',
            fontSize: '13.5px',
            color: 'var(--text)',
            lineHeight: 1.6
          }}>
            <strong>Core Invariant Statement: </strong>
            <span style={{ color: 'var(--text-secondary)' }}>{knowledge.invariants.core}</span>
          </div>

          {/* 3 Pillars of Invariant Induction */}
          <div className="invariant-proof-grid">
            <div className="invariant-step-card">
              <div className="invariant-step-header">
                <span style={{ color: '#3b82f6', fontFamily: 'var(--font-mono)' }}>1.</span>
                <span>Initialization (Base Case)</span>
              </div>
              <div className="invariant-step-body">
                {knowledge.invariants.initialization}
              </div>
            </div>

            <div className="invariant-step-card">
              <div className="invariant-step-header">
                <span style={{ color: '#10b981', fontFamily: 'var(--font-mono)' }}>2.</span>
                <span>Maintenance (Induction Step)</span>
              </div>
              <div className="invariant-step-body">
                {knowledge.invariants.maintenance}
              </div>
            </div>

            <div className="invariant-step-card">
              <div className="invariant-step-header">
                <span style={{ color: '#ec4899', fontFamily: 'var(--font-mono)' }}>3.</span>
                <span>Termination (Proof of Result)</span>
              </div>
              <div className="invariant-step-body">
                {knowledge.invariants.termination}
              </div>
            </div>
          </div>
        </div>

        {/* ── CANONICAL CODE BLUEPRINT ── */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="section-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Code size={18} style={{ color: 'var(--accent)' }} />
              <h2 style={{ fontSize: '15.5px', margin: 0 }}>Canonical Code Blueprint ({pattern.name})</h2>
            </div>
            <button
              className="btn btn-sm btn-secondary"
              onClick={handleCopyCode}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              {copied ? (
                <>
                  <Check size={14} style={{ color: '#10b981' }} /> Copied!
                </>
              ) : (
                <>
                  <Copy size={14} /> Copy Blueprint
                </>
              )}
            </button>
          </div>

          <pre className="code-editor-wrap" style={{ padding: '16px', margin: 0, overflowX: 'auto', fontSize: '13px', lineHeight: 1.6 }}>
            <code>{knowledge.blueprint}</code>
          </pre>
        </div>

        {/* ── PROBLEMS TAGGED UNDER PATTERN ── */}
        <div className="card card-flush">
          <div style={{ padding: '20px 22px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '16px', margin: 0 }}>
                Problems Tagged Under {pattern.name} ({problems.length})
              </h2>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                Practice questions from the curated bank that exercise this exact pattern.
              </p>
            </div>
          </div>

          {(() => {
            const PAGE_SIZE = 10;
            const totalPages = Math.ceil(problems.length / PAGE_SIZE) || 1;
            const currentPage = Math.min(page, totalPages);
            const startIndex = (currentPage - 1) * PAGE_SIZE;
            const paginatedProblems = problems.slice(startIndex, startIndex + PAGE_SIZE);

            if (problems.length === 0) {
              return (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                  No problems found for this pattern.
                </div>
              );
            }

            return (
              <>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Problem</th>
                      <th>Difficulty</th>
                      <th>Platform</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedProblems.map((p) => {
                      const probId = p._id || p.id;
                      return (
                        <tr key={probId}>
                          <td className="problem-name" style={{ fontWeight: 600 }}>
                            <Link to={`/problems/${probId}`} style={{ color: 'var(--text)', textDecoration: 'none' }}>
                              {p.title}
                            </Link>
                          </td>
                          <td>
                            <span className={`badge ${p.difficulty === 'Easy' ? 'badge-success' : p.difficulty === 'Hard' ? 'badge-danger' : 'badge-warning'}`}>
                              {p.difficulty}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                              {p.platform || 'LeetCode'}
                            </span>
                          </td>
                          <td>
                            <span className="badge badge-neutral">{p.status || 'Not Attempted'}</span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <Link to={`/problems/${probId}`} className="btn btn-sm btn-secondary">
                              Solve <ArrowRight size={13} />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Pagination Footer */}
                {problems.length > PAGE_SIZE && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px 20px',
                    borderTop: '1px solid var(--border)',
                    background: 'var(--surface-2)',
                    fontSize: '13px',
                    color: 'var(--text-secondary)'
                  }}>
                    <div>
                      Showing <strong>{startIndex + 1}</strong> to <strong>{Math.min(startIndex + PAGE_SIZE, problems.length)}</strong> of <strong>{problems.length}</strong> problems
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        className="btn btn-sm btn-secondary"
                        disabled={currentPage <= 1}
                        onClick={() => setPage(prev => Math.max(1, prev - 1))}
                      >
                        Previous
                      </button>
                      <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text)', padding: '0 6px' }}>
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        className="btn btn-sm btn-secondary"
                        disabled={currentPage >= totalPages}
                        onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </div>
    </AppShell>
  );
}
