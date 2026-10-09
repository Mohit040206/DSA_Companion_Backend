import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import { attemptAPI, problemAPI } from '../services/api';
import { useToast } from '../components/common/Toast';
import { History, ArrowRight, Filter, Clock, CheckCircle2, ChevronLeft, ChevronRight, UploadCloud, X, FileDown } from 'lucide-react';

export default function AttemptHistory() {
  const [attempts, setAttempts] = useState([]);
  const [problems, setProblems] = useState([]);
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importing, setImporting] = useState(false);

  const { showToast } = useToast();
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    try {
      const [atts, probs] = await Promise.all([
        attemptAPI.getAll({
          page,
          limit: pageSize,
          outcome: filter !== 'All' ? filter : undefined
        }),
        problemAPI.getAll({ all: true })
      ]);
      const list = Array.isArray(atts) ? atts : (atts?.attempts || []);
      setAttempts(list);
      if (atts?.pagination) {
        setTotalCount(atts.pagination.total);
        setTotalPages(atts.pagination.totalPages);
      } else {
        setTotalCount(list.length);
        setTotalPages(Math.ceil(list.length / pageSize) || 1);
      }
      setProblems(Array.isArray(probs) ? probs : []);
    } catch (err) {
      setAttempts([]);
      setProblems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, pageSize, filter]);

  const [isDragging, setIsDragging] = useState(false);

  const handleFilterChange = (f) => {
    setFilter(f);
    setPage(1);
  };

  const processFile = (file) => {
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target.result;
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length <= 1) {
          showToast('CSV file is empty or missing data rows', 'warning');
          setImporting(false);
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
        let count = 0;

        for (let i = 1; i < lines.length; i++) {
          const vals = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
          const row = {};
          headers.forEach((h, idx) => { row[h] = vals[idx] || ''; });

          const title = row.problem || row.title || row.name;
          if (!title) continue;

          const difficulty = row.difficulty || 'Easy';
          const patternStr = row.pattern || 'Array';
          const confidence = parseInt(row.confidence) || 5;

          // Find or create problem
          let prob = problems.find(p => p.title.toLowerCase() === title.toLowerCase());
          if (!prob) {
            try {
              prob = await problemAPI.create({
                title,
                difficulty,
                platform: 'LeetCode',
                url: `https://leetcode.com/problems/${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/`,
                patterns: patternStr.split('|').map(p => p.trim()),
                estimatedTime: '20 min',
                learningObjectives: `Master ${patternStr} algorithm.`
              });
            } catch (_) {
              continue;
            }
          }

          // Submit attempt record
          if (prob) {
            try {
              const probId = prob._id || prob.id;
              const outcome = confidence === 5 ? 'Solved' : confidence >= 3 ? 'Solved with hints' : 'Could not solve';
              await attemptAPI.start(probId);
              await attemptAPI.submit('a-import-' + Date.now() + '-' + i, {
                problemId: probId,
                outcome,
                confidence,
                hints: confidence === 5 ? 0 : 1,
                approach: `Imported historical practice: ${patternStr}`,
                keyInsight: `Historical excel record import.`
              });
              count++;
            } catch (_) {}
          }
        }

        showToast(`Successfully imported ${count} historical question records!`, 'success');
        setImportModalOpen(false);
        setImporting(false);
        await loadData();
      } catch (err) {
        showToast('Error reading CSV file', 'error');
        setImporting(false);
      }
    };
    reader.readAsText(file);
  };

  const handleCSVUpload = (e) => {
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

  const downloadCSVTemplate = () => {
    const csvContent = 'Problem,LeetCode,Pattern,Difficulty,Solved,Confidence,Notes\n"Two Sum",1,HashMap,Easy,Yes,5,Yes\n"Move Zeroes",283,"Two Pointers",Easy,Yes,4,Yes\n"Range Sum Query",303,"Prefix Sum",Easy,Yes,3,Yes';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dsa-tracker-history-template.csv';
    a.click();
  };

  const paginatedAttempts = attempts;

  return (
    <AppShell title="Attempt Logs & History" crumb="Prepare">
      <div className="enter">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div className="page-intro" style={{ marginBottom: 0 }}>
            <h1>Problem Solving History</h1>
            <p>Review past attempts or import your personal Excel/CSV solving records.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setImportModalOpen(true)}>
            <UploadCloud size={16} /> Import My Solving History
          </button>
        </div>

        {/* Filters */}
        <div className="toolbar">
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['All', 'Solved', 'Hints', 'Unsolved'].map(f => (
              <button
                key={f}
                className={`filter-chip ${filter === f ? 'active' : ''}`}
                onClick={() => handleFilterChange(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline */}
        {paginatedAttempts.length === 0 ? (
          <div className="card">
            <div className="state-block">
              <div className="state-icon">📝</div>
              <h3>No attempts logged yet</h3>
              <p>Practice a problem or import your Excel solving history to build your log.</p>
              <button className="btn btn-secondary" style={{ marginTop: '14px' }} onClick={() => setImportModalOpen(true)}>
                <UploadCloud size={15} /> Import Excel / CSV Records
              </button>
            </div>
          </div>
        ) : (
          <div className="timeline">
            {paginatedAttempts.map((att) => {
              const attId = att._id || att.id;
              const probObj = (typeof att.problemId === 'object' && att.problemId !== null)
                ? att.problemId
                : problems.find(p => (p._id && p._id === att.problemId) || (p.id && p.id === att.problemId));
              const probTitle = probObj?.title || (typeof att.problemId === 'string' ? att.problemId : 'Problem');
              const isClean = att.outcome === 'Solved';
              const isHints = att.outcome === 'Solved with hints' || att.outcome === 'SolvedWithHints';
              return (
                <div
                  key={attId}
                  className="timeline-item"
                  onClick={() => navigate(`/attempts/${attId}`)}
                >
                  <div className={`timeline-dot ${isClean ? 'tone-success' : isHints ? 'tone-warning' : 'tone-danger'}`} />
                  <div className="timeline-card">
                    <div className="tl-top">
                      <div className="tl-title">
                        {probTitle} {att.attemptNumber && <small style={{ color: 'var(--text-muted)', fontWeight: 400 }}>#{att.attemptNumber}</small>}
                      </div>
                      <div className="tl-time">{att.date || (att.createdAt ? new Date(att.createdAt).toLocaleDateString() : 'Recent')}</div>
                    </div>
                    <div className="desc">{att.approach || att.algorithm || 'No approach notes.'}</div>
                    {att.keyInsight && (
                      <div style={{ fontSize: '12.5px', color: 'var(--success)', marginTop: '4px' }}>
                        💡 <strong>Insight:</strong> {att.keyInsight}
                      </div>
                    )}
                    <div className="tl-meta">
                      <span className={`badge ${isClean ? 'badge-success' : isHints ? 'badge-warning' : 'badge-danger'}`}>
                        {isClean ? 'Solved' : isHints ? 'Solved with hints' : 'Unsolved'}
                      </span>
                      <span className="badge badge-neutral">{att.durationMin || 20} mins</span>
                      {att.confidence && (
                        <span className="badge badge-accent">Confidence: {att.confidence}/5 ⭐</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Footer */}
        {totalCount > 0 && (
          <div style={{
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            padding: '14px 20px',
            marginTop: '20px',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-md)',
            background: 'var(--surface-2)',
            fontSize: '13px',
            color: 'var(--text-secondary)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <div>
                Showing <strong>{(page - 1) * pageSize + 1}</strong> to <strong>{Math.min(page * pageSize, totalCount)}</strong> of <strong>{totalCount}</strong> attempt logs
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px' }}>Rows:</span>
                <select
                  className="input"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(parseInt(e.target.value) || 15);
                    setPage(1);
                  }}
                  style={{ width: 'auto', padding: '2px 8px', fontSize: '12px', height: '26px' }}
                >
                  <option value="10">10 / page</option>
                  <option value="15">15 / page</option>
                  <option value="25">25 / page</option>
                  <option value="50">50 / page</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                className="btn btn-sm btn-secondary"
                disabled={page <= 1}
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                style={{ gap: '4px' }}
              >
                <ChevronLeft size={14} /> Previous
              </button>
              
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text)', padding: '0 6px' }}>
                Page {page} of {totalPages}
              </span>

              <button
                className="btn btn-sm btn-secondary"
                disabled={page >= totalPages}
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                style={{ gap: '4px' }}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Import History Modal */}
      <div className={`modal-overlay ${importModalOpen ? 'open' : ''}`}>
        <div className="modal">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3>Import Personal Solving History</h3>
            <button className="icon-btn" onClick={() => setImportModalOpen(false)}><X size={18} /></button>
          </div>
          <p>
            Upload your personal Excel or CSV file containing your past question records (columns: <code>Problem</code>, <code>Pattern</code>, <code>Difficulty</code>, <code>Confidence</code>).
          </p>

          <div
            className={`drag-drop-zone ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('csvHistoryInput').click()}
            style={{
              margin: '20px 0',
              padding: '30px 20px',
              border: `2px dashed ${isDragging ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 'var(--r-md)',
              background: isDragging ? 'var(--accent-tint)' : 'var(--surface-2)',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <input
              type="file"
              accept=".csv"
              id="csvHistoryInput"
              style={{ display: 'none' }}
              onChange={handleCSVUpload}
            />
            <UploadCloud
              size={42}
              style={{
                color: isDragging ? 'var(--accent)' : 'var(--accent)',
                marginBottom: '10px',
                transition: 'transform 0.2s ease',
                transform: isDragging ? 'scale(1.15)' : 'scale(1)'
              }}
            />
            <h4 style={{ margin: '0 0 6px', fontSize: '15px', color: 'var(--text)', fontWeight: 600 }}>
              {isDragging ? 'Drop CSV File Here' : 'Drag & Drop CSV File Here'}
            </h4>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
              or <span style={{ color: 'var(--accent)', textDecoration: 'underline', fontWeight: 600 }}>click to browse</span> from your computer
            </p>
            {importing && (
              <div style={{ marginTop: '12px', fontSize: '12.5px', color: 'var(--accent)', fontWeight: 600 }}>
                ⚡ Importing solved history...
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Need a sample CSV format?</span>
            <button className="btn btn-secondary btn-sm" onClick={downloadCSVTemplate}>
              <FileDown size={14} /> Download Template
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
