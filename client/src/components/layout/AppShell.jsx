import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../common/Toast';
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
  SunMoon,
  Keyboard
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
  { key: 'interview', label: 'Interview Mode', icon: Target, path: '/interview-mode' },
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

export default function AppShell({ children, title = 'Dashboard', crumb = '' }) {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('ic-sidebar-collapsed') === '1');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('ic-sidebar-collapsed', collapsed ? '1' : '0');
  }, [collapsed]);

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
          <div className="mark">IC</div>
          <div className="name">DSA Tracker</div>
        </div>

        <nav className="sidebar-nav">
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

        <div className="sidebar-user">
          <div className="avatar">{user?.initials || 'MG'}</div>
          <div className="who">
            <div className="name">{user?.first || 'Mohit'}</div>
            <div className="role">{user?.role || 'Software Engineer'}</div>
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

            <div className="header-user" ref={dropdownRef}>
              <div
                className="avatar"
                onClick={(e) => { e.stopPropagation(); setDropdownOpen(!dropdownOpen); }}
              >
                {user?.initials || 'MG'}
              </div>

              <div className={`dropdown ${dropdownOpen ? 'open' : ''}`}>
                <div className="dropdown-head">
                  <div className="avatar">{user?.initials || 'MG'}</div>
                  <div>
                    <div className="name">{user?.name || 'Mohit Gupta'}</div>
                    <div className="role">{user?.role || 'Software Engineer'}</div>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                  <UserIcon size={15} /> Profile
                </Link>
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
    </div>
  );
}
