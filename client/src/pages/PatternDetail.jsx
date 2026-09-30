import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import { patternAPI, problemAPI } from '../services/api';
import { ChevronLeft, ArrowRight, Sparkles, Code, CheckCircle2 } from 'lucide-react';

export default function PatternDetail() {
  const { id } = useParams();
  const [pattern, setPattern] = useState(null);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function loadData() {
      try {
        const [pats, allProbs] = await Promise.all([
          patternAPI.getAll(),
          problemAPI.getAll()
        ]);
        const found = pats.find(p => p.id === id) || pats[0] || { id, name: 'Pattern', solved: 0, attempted: 0, avgConfidence: 4, status: 'Developing' };
        setPattern(found);

        const matchingProbs = allProbs.filter(p =>
          p.patterns?.some(pat => pat.toLowerCase().replace(/\s+/g, '-') === found.id.toLowerCase() || pat.toLowerCase().includes((found.name || '').toLowerCase()))
        );
        setProblems(matchingProbs.length > 0 ? matchingProbs : allProbs.slice(0, 5));
      } catch (err) {
        setProblems([]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading || !pattern) {
    return (
      <AppShell title="Pattern Detail" crumb="Patterns">
        <div className="state-block">
          <div className="skeleton skeleton-card" style={{ height: '200px' }} />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title={pattern.name} crumb="Patterns">
      <div className="enter">
        <div className="detail-header">
          <Link to="/patterns" className="breadcrumb-link">
            <ChevronLeft size={16} /> Back to Algorithmic Patterns
          </Link>
          <h1>{pattern.name} Pattern Deep-Dive</h1>
          <div className="badge-row">
            <span className={`badge ${pattern.status === 'Strong' ? 'badge-success' : 'badge-warning'}`}>
              {pattern.status}
            </span>
            <span className="badge badge-accent">Average Confidence: {pattern.avgConfidence} / 5 ⭐</span>
            <span className="badge badge-neutral">{pattern.solved} Solved out of {pattern.attempted}</span>
          </div>
        </div>

        {/* Constellation Diagram Panel */}
        <div className="constellation-panel">
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px' }}>
            <Sparkles size={18} style={{ color: 'var(--accent)' }} />
            <h3 style={{ fontSize: '15.5px' }}>Concept Map & Node Invariants</h3>
          </div>

          <svg viewBox="0 0 700 180" style={{ width: '100%', height: 'auto' }}>
            <line x1="100" y1="90" x2="260" y2="50" className="link active" />
            <line x1="100" y1="90" x2="260" y2="130" className="link active" />
            <line x1="260" y1="50" x2="440" y2="90" className="link active" />
            <line x1="260" y1="130" x2="440" y2="90" className="link active" />
            <line x1="440" y1="90" x2="600" y2="90" className="link active" />

            <circle cx="100" cy="90" r="28" fill="var(--surface)" stroke="var(--accent)" strokeWidth="3" />
            <text x="100" y="94" textAnchor="middle" className="strong">{pattern.name}</text>

            <circle cx="260" cy="50" r="22" fill="var(--surface)" stroke="var(--border-strong)" strokeWidth="2" />
            <text x="260" y="54" textAnchor="middle">State Map</text>

            <circle cx="260" cy="130" r="22" fill="var(--surface)" stroke="var(--border-strong)" strokeWidth="2" />
            <text x="260" y="134" textAnchor="middle">Complement</text>

            <circle cx="440" cy="90" r="24" fill="var(--surface)" stroke="var(--accent)" strokeWidth="2" />
            <text x="440" y="94" textAnchor="middle" className="strong">Prefix Sum</text>

            <circle cx="600" cy="90" r="22" fill="var(--surface)" stroke="var(--success)" strokeWidth="2" />
            <text x="600" y="94" textAnchor="middle">O(1) Query</text>
          </svg>
        </div>

        {/* Core Pattern Canonical Template */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="section-head">
            <h2>Canonical Code Blueprint ({pattern.name})</h2>
          </div>
          <pre className="code-editor-wrap" style={{ padding: '16px', margin: 0, overflowX: 'auto', fontSize: '13px' }}>
            <code>
{`// Canonical Pattern Template: ${pattern.name}
function solveWith${pattern.name.replace(/\s+/g, '')}(arr, target) {
  const map = new Map();
  // 1. Maintain invariant or precomputed state
  map.set(0, 1);
  let currentSum = 0;

  for (let i = 0; i < arr.length; i++) {
    currentSum += arr[i];
    // 2. Query target complement in O(1) time
    if (map.has(currentSum - target)) {
      // Found valid subarray or state match
    }
    // 3. Update lookup state
    map.set(currentSum, (map.get(currentSum) || 0) + 1);
  }
  return result;
}`}
            </code>
          </pre>
        </div>

        {/* Problems Associated with Pattern */}
        <div className="card card-flush">
          <div style={{ padding: '20px 22px 14px' }}>
            <h2>Problems Tagged Under {pattern.name} ({problems.length})</h2>
          </div>
          {(() => {
            const PAGE_SIZE = 10;
            const totalPages = Math.ceil(problems.length / PAGE_SIZE) || 1;
            const currentPage = Math.min(page, totalPages);
            const startIndex = (currentPage - 1) * PAGE_SIZE;
            const paginatedProblems = problems.slice(startIndex, startIndex + PAGE_SIZE);

            return (
              <>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Problem</th>
                      <th>Difficulty</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedProblems.map((p) => {
                      const probId = p._id || p.id;
                      return (
                        <tr key={probId}>
                          <td className="problem-name">{p.title}</td>
                          <td>
                            <span className={`badge ${p.difficulty === 'Easy' ? 'badge-success' : 'badge-warning'}`}>
                              {p.difficulty}
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
                {problems.length > 0 && (
                  <div style={{
                    display: 'flex',
                    justify: 'space-between',
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
