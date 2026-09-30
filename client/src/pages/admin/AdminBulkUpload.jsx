import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import { adminAPI, problemAPI } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { UploadCloud, FileDown, CheckCircle2, ArrowLeft, Check, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';

export default function AdminBulkUpload() {
  const [step, setStep] = useState(1);
  const [parsedRows, setParsedRows] = useState([]);
  const [importCount, setImportCount] = useState(0);
  const [page, setPage] = useState(1);
  const [isReseeding, setIsReseeding] = useState(false);

  const { showToast } = useToast();
  const navigate = useNavigate();

  const [isDragging, setIsDragging] = useState(false);

  const handleReseed500 = async () => {
    if (!window.confirm("This will purge all old fake variation problems from MongoDB and populate 500+ real LeetCode problems with direct URLs. Proceed?")) {
      return;
    }
    setIsReseeding(true);
    try {
      const res = await problemAPI.reseed();
      showToast(res.message || 'Reseeded 500+ real LeetCode problems!', 'success');
      setImportCount(res.data?.total || 500);
      setStep(3);
    } catch (err) {
      showToast('Error reseeding problems: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setIsReseeding(false);
    }
  };

  const processFile = (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target.result;
        let rows = [];
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          rows = Array.isArray(parsed) ? parsed : (parsed.problems || []);
        } else {
          // Simple CSV line parser
          const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
          if (lines.length > 1) {
            const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
            rows = lines.slice(1).map(line => {
              const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
              const obj = {};
              headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
              return obj;
            });
          }
        }

        if (rows.length === 0) {
          showToast('No valid rows found in file', 'warning');
          return;
        }

        const validated = rows.map(r => {
          const title = r.title || r.Title || '';
          const difficulty = r.difficulty || r.Difficulty || 'Medium';
          const platform = r.platform || r.Platform || 'LeetCode';
          const url = r.url || r.URL || '';
          const patterns = Array.isArray(r.patterns) ? r.patterns : (r.patterns || 'hashmap').split('|').map(p => p.trim());
          const tier = r.tier || 'Core';

          const isValid = title.length > 0 && /^https?:\/\//.test(url);
          return {
            data: { title, difficulty, platform, url, patterns, tier, estimatedTime: r.estimatedTime || '20 min' },
            isValid,
            error: !title ? 'Missing title' : !/^https?:\/\//.test(url) ? 'Invalid URL' : ''
          };
        });

        setParsedRows(validated);
        setStep(2);
      } catch (err) {
        showToast('Error parsing file format', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmImport = async () => {
    const validItems = parsedRows.filter(r => r.isValid).map(r => r.data);
    if (validItems.length === 0) return;

    try {
      await adminAPI.bulkUpload(validItems);
      setImportCount(validItems.length);
      setStep(3);
      showToast(`${validItems.length} problems imported platform-wide!`, 'success');
    } catch (err) {
      showToast('Error importing problems', 'error');
    }
  };

  const downloadTemplate = (type) => {
    let content = '';
    let filename = '';
    if (type === 'csv') {
      content = 'title,difficulty,platform,url,patterns,tier,estimatedTime\n"Valid Parentheses",Easy,LeetCode,https://leetcode.com/problems/valid-parentheses/,stack,Core,15 min';
      filename = 'problem-template.csv';
    } else {
      content = JSON.stringify([{
        title: "Valid Parentheses",
        difficulty: "Easy",
        platform: "LeetCode",
        url: "https://leetcode.com/problems/valid-parentheses/",
        patterns: ["stack"],
        tier: "Core",
        estimatedTime: "15 min"
      }], null, 2);
      filename = 'problem-template.json';
    }
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  return (
    <AppShell title="Bulk Upload Problems" crumb="Content">
      <div className="enter">
        <div className="page-intro">
          <h1>Bulk Upload Problems</h1>
          <p>Import multiple problems at once using standard CSV or JSON templates.</p>
        </div>

        {/* Wizard Step Tabs */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <div className={`filter-chip ${step === 1 ? 'active' : ''}`}>1. Upload File</div>
          <div className={`filter-chip ${step === 2 ? 'active' : ''}`}>2. Review & Validate</div>
          <div className={`filter-chip ${step === 3 ? 'active' : ''}`}>3. Confirm Import</div>
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div>
            {/* Quick Reseed Banner */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(168, 85, 247, 0.12) 100%)',
              border: '1px solid var(--accent)',
              borderRadius: 'var(--r-lg)',
              padding: '20px 24px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', marginBottom: '4px' }}>
                  <Sparkles size={16} /> One-Click Database Purge & Seed
                </div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Purge Fake Variations & Populate 500+ Real LeetCode Problems</h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Instantly clear all old placeholder "Variation #X" search links from MongoDB and load 500+ genuine problems with direct LeetCode URLs.
                </p>
              </div>
              <button
                className="btn btn-primary"
                style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                onClick={handleReseed500}
                disabled={isReseeding}
              >
                <RefreshCw size={16} style={{ animation: isReseeding ? 'spin 1s linear infinite' : 'none' }} />
                {isReseeding ? 'Seeding MongoDB...' : 'Reseed 500+ Real Problems'}
              </button>
            </div>

            <div
              className={`card drag-drop-zone ${isDragging ? 'dragging' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('bulkFileInput').click()}
              style={{
                textAlign: 'center',
                padding: '48px 24px',
                marginBottom: '20px',
                border: `2px dashed ${isDragging ? 'var(--accent)' : 'var(--border)'}`,
                background: isDragging ? 'var(--accent-tint)' : 'var(--surface-1)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <UploadCloud
                size={48}
                style={{
                  color: isDragging ? 'var(--accent)' : 'var(--accent)',
                  margin: '0 auto 14px',
                  transform: isDragging ? 'scale(1.15)' : 'scale(1)',
                  transition: 'transform 0.2s ease'
                }}
              />
              <h3>{isDragging ? 'Drop CSV or JSON File Here' : 'Drag & Drop a CSV or JSON File Here'}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px' }}>
                or <span style={{ color: 'var(--accent)', textDecoration: 'underline', fontWeight: 600 }}>click to browse</span> from your computer
              </p>
              <input
                type="file"
                accept=".csv,.json"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                id="bulkFileInput"
              />
            </div>

            <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '13.5px' }}>Need a template file?</div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Download starter format matching expected schema.</div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => downloadTemplate('csv')}>
                  <FileDown size={14} /> CSV Template
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => downloadTemplate('json')}>
                  <FileDown size={14} /> JSON Template
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (() => {
          const PAGE_SIZE = 10;
          const totalPages = Math.ceil(parsedRows.length / PAGE_SIZE) || 1;
          const currentPage = Math.min(page, totalPages);
          const startIndex = (currentPage - 1) * PAGE_SIZE;
          const paginatedRows = parsedRows.slice(startIndex, startIndex + PAGE_SIZE);

          return (
            <div>
              <div className="card card-flush" style={{ marginBottom: '20px' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Title</th>
                      <th>Difficulty</th>
                      <th>Platform</th>
                      <th>Patterns</th>
                      <th>Tier</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRows.map((row, idx) => (
                      <tr key={startIndex + idx}>
                        <td>{startIndex + idx + 1}</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{row.data.title || 'Untitled'}</div>
                          {row.error && <div style={{ fontSize: '11px', color: 'var(--danger)' }}>{row.error}</div>}
                        </td>
                        <td>{row.data.difficulty}</td>
                        <td>{row.data.platform}</td>
                        <td>{(row.data.patterns || []).join(', ')}</td>
                        <td>{row.data.tier}</td>
                        <td>
                          <span className={`badge ${row.isValid ? 'badge-success' : 'badge-danger'}`}>
                            {row.isValid ? 'Ready' : 'Error'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination Footer */}
                {parsedRows.length > 0 && (
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
                      Showing <strong>{startIndex + 1}</strong> to <strong>{Math.min(startIndex + PAGE_SIZE, parsedRows.length)}</strong> of <strong>{parsedRows.length}</strong> rows
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
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button className="btn btn-secondary" onClick={() => setStep(1)}>
                  <ArrowLeft size={15} /> Back
                </button>
                <button className="btn btn-primary" onClick={handleConfirmImport}>
                  <Check size={15} /> Import Valid Problems
                </button>
              </div>
            </div>
          );
        })()}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="card state-block">
            <div className="state-icon" style={{ background: 'var(--success-tint)', color: 'var(--success)' }}>
              <CheckCircle2 size={24} />
            </div>
            <h3>{importCount} Problems Successfully Imported!</h3>
            <p>They are now active in the platform problem directory.</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
              <Link to="/admin/problems" className="btn btn-primary">
                View All Problems
              </Link>
              <button className="btn btn-secondary" onClick={() => setStep(1)}>
                Upload Another File
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
