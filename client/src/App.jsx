import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Problems from './pages/Problems';
import ProblemDetail from './pages/ProblemDetail';
import Patterns from './pages/Patterns';
import PatternDetail from './pages/PatternDetail';
import InterviewMode from './pages/InterviewMode';
import AttemptHistory from './pages/AttemptHistory';
import AttemptDetail from './pages/AttemptDetail';
import ImportRecords from './pages/ImportRecords';
import Revisions from './pages/Revisions';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import CompanyPrep from './pages/CompanyPrep';
import NotFound from './pages/NotFound';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProblems from './pages/admin/AdminProblems';
import AdminProblemForm from './pages/admin/AdminProblemForm';
import AdminBulkUpload from './pages/admin/AdminBulkUpload';
import AdminUsers from './pages/admin/AdminUsers';
import AdminUserDetail from './pages/admin/AdminUserDetail';

import './styles/tokens.css';
import './styles/global.css';
import './styles/components.css';
import './styles/pages.css';

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const token = typeof window !== 'undefined' ? localStorage.getItem('dsa_token') : null;

  // Strict check 1: If there is no token in localStorage, immediately redirect to login
  if (!token) {
    return <Navigate to="/auth/login" replace />;
  }

  // Strict check 2: If token is present but validating with backend
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg, #0B0F14)'
      }}>
        <div className="pulse-dot" />
      </div>
    );
  }

  // Strict check 3: If backend validation failed or token is invalid
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
}

function RequireAdmin({ children }) {
  const { user, loading } = useAuth();
  const token = typeof window !== 'undefined' ? localStorage.getItem('dsa_token') : null;

  if (!token) {
    return <Navigate to="/auth/login" replace />;
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg, #0B0F14)'
      }}>
        <div className="pulse-dot" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();
  const token = typeof window !== 'undefined' ? localStorage.getItem('dsa_token') : null;

  if (loading && token) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg, #0B0F14)'
      }}>
        <div className="pulse-dot" />
      </div>
    );
  }

  if (token && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function RootRoute() {
  const { user, loading } = useAuth();
  const token = typeof window !== 'undefined' ? localStorage.getItem('dsa_token') : null;

  if (!token) {
    return <LandingPage />;
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg, #0B0F14)'
      }}>
        <div className="pulse-dot" />
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              {/* Root route: Landing for visitors, Dashboard for logged-in users */}
              <Route path="/" element={<RootRoute />} />
              <Route path="/landing" element={<LandingPage />} />

              {/* Auth Routes */}
              <Route path="/auth/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
              <Route path="/auth/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
              <Route path="/auth/forgot-password" element={<ForgotPassword />} />
              <Route path="/auth/reset-password" element={<ResetPassword />} />

              {/* Learner App Routes — Strictly Protected */}
              <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
              <Route path="/company-prep" element={<RequireAuth><CompanyPrep /></RequireAuth>} />
              <Route path="/problems" element={<RequireAuth><Problems /></RequireAuth>} />
              <Route path="/problems/:id" element={<RequireAuth><ProblemDetail /></RequireAuth>} />
              <Route path="/patterns" element={<RequireAuth><Patterns /></RequireAuth>} />
              <Route path="/patterns/:id" element={<RequireAuth><PatternDetail /></RequireAuth>} />
              <Route path="/interview-mode" element={<RequireAuth><InterviewMode /></RequireAuth>} />
              <Route path="/attempts" element={<RequireAuth><AttemptHistory /></RequireAuth>} />
              <Route path="/attempts/:id" element={<RequireAuth><AttemptDetail /></RequireAuth>} />
              <Route path="/import-records" element={<RequireAuth><ImportRecords /></RequireAuth>} />
              <Route path="/revisions" element={<RequireAuth><Revisions /></RequireAuth>} />
              <Route path="/analytics" element={<RequireAuth><Analytics /></RequireAuth>} />
              <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
              <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />

              {/* Admin Portal Routes */}
              <Route path="/admin" element={<RequireAdmin><Navigate to="/admin/dashboard" replace /></RequireAdmin>} />
              <Route path="/admin/dashboard" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
              <Route path="/admin/problems" element={<RequireAdmin><AdminProblems /></RequireAdmin>} />
              <Route path="/admin/problems/new" element={<RequireAdmin><AdminProblemForm /></RequireAdmin>} />
              <Route path="/admin/problems/edit/:id" element={<RequireAdmin><AdminProblemForm /></RequireAdmin>} />
              <Route path="/admin/bulk-upload" element={<RequireAdmin><AdminBulkUpload /></RequireAdmin>} />
              <Route path="/admin/users" element={<RequireAdmin><AdminUsers /></RequireAdmin>} />
              <Route path="/admin/users/:id" element={<RequireAdmin><AdminUserDetail /></RequireAdmin>} />

              {/* Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}
