import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../common/Toast';
import OnboardingModal from '../modals/OnboardingModal';
import AppBackground from './AppBackground';
import {
  LayoutDashboard,
  Code2,
  RotateCcw,
  Share2,
  History,
  LineChart,
  Target,
  Settings,
  User as UserIcon,
  Search,
  Sun,
  Moon,
  Monitor,
  Bell,
  ChevronLeft,
  LogOut,
  Keyboard,
  Shield,
  UploadCloud,
  Users,
  FileSpreadsheet,
  Building2,
  ChevronsUpDown
} from 'lucide-react';

const NAV_PRIMARY = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { key: 'problems', label: 'Problems', icon: Code2, path: '/problems' },
  { key: 'revisions', label: 'Revisions', icon: RotateCcw, path: '/revisions' },
  { key: 'patterns', label: 'Patterns', icon: Share2, path: '/patterns' },
  { key: 'attempts', label: 'Attempts', icon: History, path: '/attempts' },
  { key: 'analytics', label: 'Analytics', icon: LineChart, path: '/analytics' },
];

const NAV_SECONDARY = [
  { key: 'company-prep', label: 'Company Prep', icon: Building2, path: '/company-prep' },
  { key: 'interview', label: 'Interview Mode', icon: Target, path: '/interview-mode' },
  { key: 'import-records', label: 'Import Records', icon: FileSpreadsheet, path: '/import-records' },
];

const NAV_ADMIN = [
  { key: 'admin-dashboard', label: 'Admin Overview', icon: Shield, path: '/admin/dashboard' },
  { key: 'admin-problems', label: 'Manage Problems', icon: Code2, path: '/admin/problems' },
  { key: 'admin-upload', label: 'Bulk Upload', icon: UploadCloud, path: '/admin/bulk-upload' },
  { key: 'admin-users', label: 'Manage Users', icon: Users, path: '/admin/users' },
];

const NAV_FOOT = [
  { key: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

const MOBILE_ITEMS = [
  { key: 'dashboard', label: 'Home', icon: LayoutDashboard, path: '/dashboard' },
  { key: 'problems', label: 'Problems', icon: Code2, path: '/problems' },
  { key: 'revisions', label: 'Revisions', icon: RotateCcw, path: '/revisions' },
  { key: 'attempts', label: 'Attempts', icon: History, path: '/attempts' },
  { key: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

export default function AppShell({ children, title = 'Dashboard', crumb = '', openOnboarding = false, setOpenOnboarding }) {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('ic-sidebar-collapsed') === '1');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const sidebarNavRef = useRef(null);

  // Preserve sidebar scroll position across route changes & unmounts
  React.useLayoutEffect(() => {
    const savedScroll = sessionStorage.getItem('ic-sidebar-scroll');
    if (savedScroll && sidebarNavRef.current) {
      sidebarNavRef.current.scrollTop = Number(savedScroll);
    }
  }, [location.pathname]);

  const handleSidebarScroll = (e) => {
    sessionStorage.setItem('ic-sidebar-scroll', String(e.target.scrollTop));
  };

  useEffect(() => {
    localStorage.setItem('ic-sidebar-collapsed', collapsed ? '1' : '0');
  }, [collapsed]);

  useEffect(() => {
    if (user) {
      const isCompleted = Boolean(
        user.isOnboarded === true ||
        user.learningProfile?.onboardingCompleted === true
      );
      if (!isCompleted) {
        setShowOnboarding(true);
      }
    }
  }, [user]);

  useEffect(() => {
    if (openOnboarding) {
      setShowOnboarding(true);
    }
  }, [openOnboarding]);

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    if (setOpenOnboarding) {
      setOpenOnboarding(false);
    }
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/problems?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    showToast('Logged out successfully', 'success');
    logout();
    navigate('/auth/login');
  };

  return (
    <div className={`app-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <AppBackground />
      {/* Sidebar */}
      <aside className="sidebar">
        <button
          className="sidebar-toggle"
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle sidebar"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="sidebar-brand">
          <img
            src="/logo-mark.png"
            alt="Ancora"
            style={{
              width: 34,
              height: 34,
              filter: 'drop-shadow(0 0 14px rgba(99, 102, 241, 0.55))',
              flexShrink: 0,
              objectFit: 'contain'
            }}
          />
          {!collapsed && (
            <div
              className="name"
              style={{
                fontWeight: 800,
                fontSize: 21,
                letterSpacing: '-0.5px',
                background: 'linear-gradient(135deg, #818CF8 0%, #C084FC 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Ancora
            </div>
          )}
        </div>

        <nav className="sidebar-nav" ref={sidebarNavRef} onScroll={handleSidebarScroll}>
          <div className="sidebar-section-label">Prepare</div>
          {NAV_PRIMARY.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.key}
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span className="label">{item.label}</span>
              </NavLink>
            );
          })}

          <div className="sidebar-section-label">Focus</div>
          {NAV_SECONDARY.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.key}
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span className="label">{item.label}</span>
              </NavLink>
            );
          })}

          {user?.role === 'admin' && (
            <>
              <div className="sidebar-section-label">Admin</div>
              {NAV_ADMIN.map(item => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.key}
                    to={item.path}
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={18} />
                    <span className="label">{item.label}</span>
                  </NavLink>
                );
              })}
            </>
          )}

          <div className="sidebar-section-label">Account</div>
          {NAV_FOOT.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.key}
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span className="label">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div
          className="sidebar-user"
          ref={dropdownRef}
          onClick={() => setDropdownOpen(!dropdownOpen)}
          role="button"
          tabIndex={0}
          aria-haspopup="true"
          aria-expanded={dropdownOpen}
        >
          <div className="avatar">{user?.initials || (user?.name ? user.name.slice(0, 2).toUpperCase() : 'MG')}</div>
          <div className="who">
            <div className="name">{user?.name || user?.username || 'Engineer'}</div>
            <div className="role">{user?.role === 'admin' ? 'Administrator' : (user?.targetRole || user?.currentCompany?.role || 'Software Engineer')}</div>
          </div>
          <ChevronsUpDown size={15} className="sidebar-user-chevron" />

          {/* User Popover Menu from Bottom Left */}
          <div
            className={`dropdown sidebar-dropdown ${dropdownOpen ? 'open' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dropdown-head">
              <div className="avatar">{user?.initials || (user?.name ? user.name.slice(0, 2).toUpperCase() : 'MG')}</div>
              <div>
                <div className="name">{user?.name || user?.username || 'Engineer'}</div>
                <div className="role">{user?.role === 'admin' ? 'Administrator' : (user?.targetRole || user?.currentCompany?.role || 'Software Engineer')}</div>
              </div>
            </div>
            <div className="dropdown-divider"></div>
            <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
              <UserIcon size={15} /> Profile
            </Link>
            {user?.role === 'admin' && (
              <Link to="/admin/dashboard" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                <Shield size={15} /> Admin Portal
              </Link>
            )}
            <Link to="/settings" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
              <Settings size={15} /> Settings
            </Link>
            <div
              className="dropdown-item"
              onClick={() => { showToast('Shortcuts: g+d Dashboard · g+p Problems · / Search', 'info'); setDropdownOpen(false); }}
            >
              <Keyboard size={15} /> Keyboard shortcuts
            </div>
            <div className="dropdown-divider"></div>
            <div className="dropdown-item danger" onClick={handleLogout}>
              <LogOut size={15} /> Logout
            </div>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="main-content">
        {/* Top Header */}
        <header className="app-header">
          <div className="header-title">
            {crumb && <div className="header-crumb">{crumb}</div>}
            <div className="header-page">{title}</div>
          </div>

          <div className="header-actions">
            <div className="search-box">
              <Search size={15} />
              <input
                type="text"
                placeholder="Search problems, patterns…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchSubmit}
              />
            </div>

            <div className="theme-toggle" role="group">
              <button
                className={theme === 'light' ? 'active' : ''}
                onClick={() => setTheme('light')}
                title="Light mode"
              >
                <Sun size={14} />
              </button>
              <button
                className={theme === 'dark' ? 'active' : ''}
                onClick={() => setTheme('dark')}
                title="Dark mode"
              >
                <Moon size={14} />
              </button>
              <button
                className={theme === 'system' ? 'active' : ''}
                onClick={() => setTheme('system')}
                title="System mode"
              >
                <Monitor size={14} />
              </button>
            </div>

            <button
              className="icon-btn"
              onClick={() => showToast('No new notifications', 'info')}
              title="Notifications"
            >
              <Bell size={18} />
              <span className="dot"></span>
            </button>
          </div>
        </header>

        {/* Page Body */}
        <main className="page-body">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-nav">
        {MOBILE_ITEMS.map(item => {
          const Icon = item.icon;
          const active = location.pathname.startsWith(item.path);
          return (
            <Link key={item.key} to={item.path} className={active ? 'active' : ''}>
              <Icon size={19} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Global Onboarding Modal for New / Non-Onboarded Users */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={handleCloseOnboarding}
        onComplete={handleCloseOnboarding}
        initialProfile={user?.learningProfile}
      />
    </div>
  );
}
