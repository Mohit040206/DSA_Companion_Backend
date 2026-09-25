import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="error-page">
      <div>
        <div className="error-code">404</div>
        <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>Page Not Found</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          The DSA resource or route you requested could not be located.
        </p>
        <Link to="/dashboard" className="btn btn-primary">
          <ArrowLeft size={16} /> Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
