import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import { attemptAPI } from '../services/api';
import { useToast } from '../components/common/Toast';
import {
  FileSpreadsheet,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Download,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  Info,
  Sparkles
} from 'lucide-react';

const SAMPLE_JSON = `[
  {
    "problemTitle": "Two Sum",
    "outcome": "Solved",
    "confidence": 5,
    "pattern": "HashMap",
    "difficulty": "Easy",
    "approach": "Store target - x in hash map while iterating.",
    "keyInsight": "One-pass hash map reduces time complexity from O(N^2) to O(N).",
    "timeComplexity": "O(N)",
    "spaceComplexity": "O(N)",
    "mistakes": ["Forgot to check zero index on first try"],
    "notes": "Practiced hash map pattern.",
    "date": "2026-09-25"
  },
  {
    "problemTitle": "3Sum",
    "outcome": "SolvedWithHints",
    "confidence": 4,
    "pattern": "Two Pointers",
    "difficulty": "Medium",
    "approach": "Sort array first, then fix one element and use two pointers for remaining pair.",
    "keyInsight": "Skip duplicate elements to avoid duplicate triplets.",
    "timeComplexity": "O(N^2)",
    "spaceComplexity": "O(1)",
    "mistakes": ["Did not skip duplicates for two pointers loop"],
    "notes": "Need to review 4Sum variation later.",
    "date": "2026-09-26"
  }
]`;

const SAMPLE_CSV = `Problem Title,Outcome,Confidence,Pattern,Difficulty,Approach,Key Insight,Time Complexity,Space Complexity,Mistakes,Notes,Date
Two Sum,Solved,5,HashMap,Easy,Store target - x in hash map,One pass hash map,O(N),O(N),Forgot zero index check,Practiced hash map,2026-09-25
3Sum,SolvedWithHints,4,Two Pointers,Medium,Sort array then two pointers,Skip duplicate elements,O(N^2),O(1),Did not skip duplicates,Review 4Sum later,2026-09-26`;

const SAMPLE_TXT = `Problem: Two Sum
Outcome: Solved
Confidence: 5
Pattern: HashMap
Difficulty: Easy
Approach: Store target - x in hash map while iterating.
Key Insight: One-pass hash map reduces time complexity from O(N^2) to O(N).
Time Complexity: O(N)
Space Complexity: O(N)
Mistakes: Forgot zero index check
Notes: Practiced hash map pattern.
Date: 2026-09-25

---

Problem: 3Sum
Outcome: SolvedWithHints
Confidence: 4
Pattern: Two Pointers
Difficulty: Medium
Approach: Sort array first, then fix one element and use two pointers.
Key Insight: Skip duplicate elements to avoid duplicate triplets.
Time Complexity: O(N^2)
Space Complexity: O(1)
Mistakes: Did not skip duplicates
Notes: Need to review 4Sum variation later.
Date: 2026-09-26`;

export default function ImportRecords() {
  const [step, setStep] = useState(1);
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'paste'
  const [rawContent, setRawContent] = useState('');
  const [parsedRecords, setParsedRecords] = useState([]);
  const [parseError, setParseError] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const { showToast } = useToast();
  const navigate = useNavigate();

  // Helper to parse plain text key-value format
  const parseTextFormat = (text) => {
    const blocks = text.split(/(?:^|\n)\s*---\s*(?:\n|$)/);
    const records = [];

    for (const block of blocks) {
      if (!block.trim()) continue;
      const lines = block.split('\n');
      const rec = {};
      
      for (const line of lines) {
        const colonIdx = line.indexOf(':');
        if (colonIdx === -1) continue;
        const rawKey = line.substring(0, colonIdx).trim().toLowerCase();
        const val = line.substring(colonIdx + 1).trim();

        if (!val) continue;

        if (rawKey.includes('problem') || rawKey.includes('title')) {
          rec.problemTitle = val;
        } else if (rawKey.includes('outcome') || rawKey.includes('status')) {
          rec.outcome = val;
        } else if (rawKey.includes('confidence') || rawKey.includes('rating')) {
          rec.confidence = parseInt(val, 10) || 4;
        } else if (rawKey.includes('pattern')) {
          rec.pattern = val;
        } else if (rawKey.includes('diff') || rawKey.includes('level')) {
          rec.difficulty = val;
        } else if (rawKey.includes('approach')) {
          rec.approach = val;
        } else if (rawKey.includes('insight')) {
          rec.keyInsight = val;
        } else if (rawKey.includes('time') || rawKey.includes('timecomplexity')) {
          rec.timeComplexity = val;
        } else if (rawKey.includes('space') || rawKey.includes('spacecomplexity')) {
          rec.spaceComplexity = val;
        } else if (rawKey.includes('mistake')) {
          rec.mistakes = val.split(/[,;]/).map(s => s.trim()).filter(Boolean);
        } else if (rawKey.includes('note')) {
          rec.notes = val;
        } else if (rawKey.includes('date')) {
          rec.date = val;
        }
      }

      if (rec.problemTitle) {
        records.push(rec);
      }
    }
    return records;
  };

  // Helper to parse CSV format
  const parseCSVFormat = (text) => {
    const lines = text.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) return [];

    const parseCSVLine = (line) => {
      const result = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(cur.trim());
          cur = '';
        } else {
          cur += char;
        }
      }
      result.push(cur.trim());
      return result;
    };

    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
    const records = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i]);
      if (cols.length < 1) continue;
      
      const rec = {};
      headers.forEach((h, idx) => {
        const val = cols[idx] || '';
        if (h.includes('problem') || h.includes('title')) rec.problemTitle = val;
        else if (h.includes('outcome')) rec.outcome = val;
        else if (h.includes('confidence')) rec.confidence = parseInt(val, 10) || 4;
        else if (h.includes('pattern')) rec.pattern = val;
        else if (h.includes('difficulty')) rec.difficulty = val;
        else if (h.includes('approach')) rec.approach = val;
        else if (h.includes('insight')) rec.keyInsight = val;
        else if (h.includes('time')) rec.timeComplexity = val;
        else if (h.includes('space')) rec.spaceComplexity = val;
        else if (h.includes('mistake')) rec.mistakes = val ? [val] : [];
        else if (h.includes('note')) rec.notes = val;
        else if (h.includes('date')) rec.date = val;
      });

      if (rec.problemTitle) {
        records.push(rec);
      }
    }
    return records;
  };

  const handleParseContent = (contentToParse) => {
    setParseError('');
    const str = (contentToParse || rawContent).trim();
    if (!str) {
      setParseError('Please provide data to import (file upload or paste text).');
      return;
    }

    let records = [];
    // 1. Try JSON
    if (str.startsWith('[') || str.startsWith('{')) {
      try {
        const json = JSON.parse(str);
        records = Array.isArray(json) ? json : [json];
      } catch (err) {
        setParseError('Invalid JSON format. Please check syntax.');
        return;
      }
    }
    // 2. Try Key-Value Plain Text format
    else if (str.toLowerCase().includes('problem:') || str.toLowerCase().includes('outcome:')) {
      records = parseTextFormat(str);
    }
    // 3. Fallback CSV
    else {
      records = parseCSVFormat(str);
    }

    if (!records || records.length === 0) {
      setParseError('Could not parse any valid problem records. Check format examples below.');
      return;
    }

    setParsedRecords(records);
    setStep(2);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      setRawContent(text);
      handleParseContent(text);
    };
    reader.readAsText(file);
  };

  const handleRemoveRecord = (index) => {
    const updated = [...parsedRecords];
    updated.splice(index, 1);
    setParsedRecords(updated);
    if (updated.length === 0) {
      setStep(1);
    }
  };

  const handleExecuteImport = async () => {
    if (parsedRecords.length === 0) return;
    setIsImporting(true);

    try {
      const res = await attemptAPI.importRecords(parsedRecords);
      setImportResult(res.data);
      setStep(3);
      showToast('Records imported successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Import failed. Check format and try again.', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  const copyTemplate = (type, sampleStr) => {
    navigator.clipboard.writeText(sampleStr);
    setCopySuccess(type);
    setTimeout(() => setCopySuccess(''), 2000);
  };

  const downloadSample = (filename, content, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell title="Import My Records" crumb="Import">
      <div className="import-page-container">
        
        {/* Header Hero */}
        <div className="import-hero">
          <div className="import-hero-badge">
            <Sparkles size={14} /> Batch Attempt Import
          </div>
          <h1>Import Your DSA Records</h1>
          <p>
            Easily migrate your existing problem logs, notes, and attempt history into DSA Companion.
            Supports JSON, CSV, and plain-text note formats.
          </p>

          {/* Stepper Header */}
          <div className="import-stepper">
            <div className={`step-item ${step >= 1 ? 'active' : ''}`}>
              <div className="step-num">1</div>
              <span>Upload or Paste</span>
            </div>
            <div className="step-divider" />
            <div className={`step-item ${step >= 2 ? 'active' : ''}`}>
              <div className="step-num">2</div>
              <span>Review & Match ({parsedRecords.length})</span>
            </div>
            <div className="step-divider" />
            <div className={`step-item ${step >= 3 ? 'active' : ''}`}>
              <div className="step-num">3</div>
              <span>Complete</span>
            </div>
          </div>
        </div>

        {/* STEP 1: UPLOAD / PASTE */}
        {step === 1 && (
          <div className="import-step-card animate-fade-in">
            <div className="import-tabs">
              <button
                className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
                onClick={() => setActiveTab('upload')}
              >
                <UploadCloud size={16} /> File Upload (CSV / JSON)
              </button>
              <button
                className={`tab-btn ${activeTab === 'paste' ? 'active' : ''}`}
                onClick={() => setActiveTab('paste')}
              >
                <FileText size={16} /> Paste Raw Text / Notes
              </button>
            </div>

            {parseError && (
              <div className="import-alert error">
                <AlertCircle size={18} />
                <span>{parseError}</span>
              </div>
            )}

            {activeTab === 'upload' ? (
              <div className="dropzone-area">
                <input
                  type="file"
                  id="import-file"
                  accept=".csv,.json,.txt"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <label htmlFor="import-file" className="dropzone-label">
                  <div className="dropzone-icon">
                    <UploadCloud size={40} />
                  </div>
                  <h3>Drop your file here, or browse</h3>
                  <p>Supports .csv, .json, and .txt notes</p>
                  <span className="btn btn-primary btn-sm">Select File</span>
                </label>
              </div>
            ) : (
              <div className="paste-area">
                <label className="form-label">Paste JSON, CSV, or Text Notes:</label>
                <textarea
                  className="form-control code-font"
                  rows={10}
                  placeholder={`Paste your JSON array, CSV table, or text notes here...

Example Text Note:
Problem: Two Sum
Outcome: Solved
Confidence: 5
Pattern: HashMap
Approach: Hash Map lookup...`}
                  value={rawContent}
                  onChange={(e) => setRawContent(e.target.value)}
                />
                <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleParseContent()}
                  >
                    Parse Records <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Supported Formats Section */}
            <div className="formats-section">
              <h3><Info size={16} /> Supported Import Formats</h3>
              <p className="formats-desc">
                Choose from JSON, CSV, or plain text note format. Download sample templates or copy snippets below:
              </p>

              <div className="format-grid">
                {/* JSON Card */}
                <div className="format-card">
                  <div className="format-header">
                    <span className="badge badge-accent">JSON Format</span>
                    <div className="format-actions">
                      <button
                        className="btn-icon-subtle"
                        title="Copy Sample"
                        onClick={() => copyTemplate('json', SAMPLE_JSON)}
                      >
                        {copySuccess === 'json' ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                      <button
                        className="btn-icon-subtle"
                        title="Download Sample JSON"
                        onClick={() => downloadSample('sample_attempts.json', SAMPLE_JSON, 'application/json')}
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  </div>
                  <pre className="format-preview"><code>{SAMPLE_JSON}</code></pre>
                </div>

                {/* CSV Card */}
                <div className="format-card">
                  <div className="format-header">
                    <span className="badge badge-success">CSV Format</span>
                    <div className="format-actions">
                      <button
                        className="btn-icon-subtle"
                        title="Copy Sample"
                        onClick={() => copyTemplate('csv', SAMPLE_CSV)}
                      >
                        {copySuccess === 'csv' ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                      <button
                        className="btn-icon-subtle"
                        title="Download Sample CSV"
                        onClick={() => downloadSample('sample_attempts.csv', SAMPLE_CSV, 'text/csv')}
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  </div>
                  <pre className="format-preview"><code>{SAMPLE_CSV}</code></pre>
                </div>

                {/* TXT Note Card */}
                <div className="format-card">
                  <div className="format-header">
                    <span className="badge badge-warning">Plain Text Note</span>
                    <div className="format-actions">
                      <button
                        className="btn-icon-subtle"
                        title="Copy Sample"
                        onClick={() => copyTemplate('txt', SAMPLE_TXT)}
                      >
                        {copySuccess === 'txt' ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                      <button
                        className="btn-icon-subtle"
                        title="Download Sample TXT"
                        onClick={() => downloadSample('sample_notes.txt', SAMPLE_TXT, 'text/plain')}
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  </div>
                  <pre className="format-preview"><code>{SAMPLE_TXT}</code></pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: REVIEW PARSED RECORDS */}
        {step === 2 && (
          <div className="import-step-card animate-fade-in">
            <div className="step-card-header">
              <div>
                <h2>Review Parsed Records</h2>
                <p>We found <strong>{parsedRecords.length}</strong> record(s). Verify the details before importing into your history.</p>
              </div>
              <div className="step-card-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => setStep(1)}>
                  <RefreshCw size={14} /> Start Over
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleExecuteImport}
                  disabled={isImporting}
                >
                  {isImporting ? (
                    <>Importing...</>
                  ) : (
                    <>Confirm & Import {parsedRecords.length} Record(s) <ArrowRight size={16} /></>
                  )}
                </button>
              </div>
            </div>

            <div className="records-table-wrapper">
              <table className="records-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Problem Title</th>
                    <th>Outcome</th>
                    <th>Confidence</th>
                    <th>Pattern</th>
                    <th>Time / Space</th>
                    <th>Key Insight / Notes</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedRecords.map((rec, idx) => (
                    <tr key={idx}>
                      <td className="idx-col">{idx + 1}</td>
                      <td className="title-col">
                        <strong>{rec.problemTitle || rec.title || 'Untitled'}</strong>
                        {rec.difficulty && (
                          <span className={`diff-pill ${rec.difficulty.toLowerCase()}`}>
                            {rec.difficulty}
                          </span>
                        )}
                      </td>
                      <td>
                        <span className={`outcome-badge ${rec.outcome || 'Solved'}`}>
                          {rec.outcome || 'Solved'}
                        </span>
                      </td>
                      <td>
                        <span className="confidence-pill">
                          ★ {rec.confidence || 4}/5
                        </span>
                      </td>
                      <td>{rec.pattern || 'Custom'}</td>
                      <td className="code-font text-muted">
                        {rec.timeComplexity || rec.time || 'O(N)'} / {rec.spaceComplexity || rec.space || 'O(1)'}
                      </td>
                      <td className="notes-col">
                        {rec.keyInsight || rec.notes || rec.approach || '—'}
                      </td>
                      <td>
                        <button
                          className="btn-icon-danger"
                          title="Remove record"
                          onClick={() => handleRemoveRecord(idx)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* STEP 3: RESULTS SUMMARY */}
        {step === 3 && importResult && (
          <div className="import-step-card animate-fade-in text-center">
            <div className="success-icon-wrap">
              <CheckCircle2 size={56} className="text-success" />
            </div>

            <h2>Import Completed!</h2>
            <p className="text-secondary" style={{ marginBottom: 28 }}>
              {importResult.attemptsCreated} attempt records have been added to your profile history.
            </p>

            <div className="result-stats-grid">
              <div className="stat-card">
                <span className="stat-num text-primary">{importResult.attemptsCreated}</span>
                <span className="stat-lbl">Attempts Created</span>
              </div>
              <div className="stat-card">
                <span className="stat-num text-success">{importResult.matchedProblems}</span>
                <span className="stat-lbl">Matched Seed Problems</span>
              </div>
              <div className="stat-card">
                <span className="stat-num text-warning">{importResult.newProblemsCreated}</span>
                <span className="stat-lbl">Custom Questions Created</span>
              </div>
            </div>

            {importResult.errors && importResult.errors.length > 0 && (
              <div className="import-errors-box" style={{ textAlign: 'left', marginTop: 24 }}>
                <h4>Warnings / Errors during import ({importResult.errors.length}):</h4>
                <ul>
                  {importResult.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{ marginTop: 32, display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Link to="/attempts" className="btn btn-primary">
                View Attempts History
              </Link>
              <Link to="/dashboard" className="btn btn-secondary">
                Go to Dashboard
              </Link>
              <button className="btn btn-tertiary" onClick={() => { setStep(1); setParsedRecords([]); setRawContent(''); }}>
                Import More
              </button>
            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}
