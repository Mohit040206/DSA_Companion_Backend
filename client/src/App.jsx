import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

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

function RequireAdmin({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              {/* Root redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Auth Routes */}
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/register" element={<Register />} />
              <Route path="/auth/forgot-password" element={<ForgotPassword />} />
              <Route path="/auth/reset-password" element={<ResetPassword />} />

              {/* Learner App Routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/company-prep" element={<CompanyPrep />} />
              <Route path="/problems" element={<Problems />} />
              <Route path="/problems/:id" element={<ProblemDetail />} />
              <Route path="/patterns" element={<Patterns />} />
              <Route path="/patterns/:id" element={<PatternDetail />} />
              <Route path="/interview-mode" element={<InterviewMode />} />
              <Route path="/attempts" element={<AttemptHistory />} />
              <Route path="/attempts/:id" element={<AttemptDetail />} />
              <Route path="/import-records" element={<ImportRecords />} />
              <Route path="/revisions" element={<Revisions />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />

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
