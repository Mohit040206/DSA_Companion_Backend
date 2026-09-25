import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

import Dashboard from './pages/Dashboard';
import Problems from './pages/Problems';
import ProblemDetail from './pages/ProblemDetail';
import Patterns from './pages/Patterns';
import PatternDetail from './pages/PatternDetail';
import InterviewMode from './pages/InterviewMode';
import AttemptHistory from './pages/AttemptHistory';
import AttemptDetail from './pages/AttemptDetail';
import Revisions from './pages/Revisions';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

import './styles/tokens.css';
import './styles/global.css';
import './styles/components.css';
import './styles/pages.css';

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

              {/* Main App Routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/problems" element={<Problems />} />
              <Route path="/problems/:id" element={<ProblemDetail />} />
              <Route path="/patterns" element={<Patterns />} />
              <Route path="/patterns/:id" element={<PatternDetail />} />
              <Route path="/interview-mode" element={<InterviewMode />} />
              <Route path="/attempts" element={<AttemptHistory />} />
              <Route path="/attempts/:id" element={<AttemptDetail />} />
              <Route path="/revisions" element={<Revisions />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />

              {/* Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}
