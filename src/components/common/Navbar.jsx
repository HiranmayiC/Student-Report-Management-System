import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Menu, Search, Sun, Moon, Bell, LogOut, ChevronDown } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const routeTitleMap = {
  '/dashboard': 'Dashboard Overview',
  '/students': 'Student Directory',
  '/faculty': 'Faculty Management',
  '/marks': 'Marks & Grading Engine',
  '/attendance': 'Attendance Records',
  '/reports': 'Transcripts & Reports',
  '/analytics': 'Academic Analytics',
  '/settings': 'System Settings',
  '/unauthorized': 'Access Denied'
};

const Navbar = ({ toggleMobileSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toggleTheme, isDark } = useTheme();
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Determine active title based on path
  const currentTitle = routeTitleMap[location.pathname] || 'Student Report Management';

  const handleLogout = () => {
    logout();
    toast.info('You have been signed out successfully.');
    navigate('/login', { replace: true });
  };

  return (
    <header className="top-navbar">
      {/* Left: Mobile Toggle & Breadcrumb */}
      <div className="navbar-left">
        <button
          className="mobile-menu-toggle"
          onClick={toggleMobileSidebar}
          aria-label="Toggle mobile menu"
        >
          <Menu size={20} />
        </button>

        <div className="breadcrumb-box">
          <span className="breadcrumb-root">Portal</span>
          <span>/</span>
          <span className="breadcrumb-current">{currentTitle}</span>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="navbar-center">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="navbar-search-input"
            placeholder="Search records, students, subjects..."
            aria-label="Global search input"
          />
        </div>
      </div>

      {/* Right: Theme Toggle, Notifications, User Chip & Logout */}
      <div className="navbar-right" style={{ position: 'relative' }}>
        {/* Light / Dark Mode Toggle */}
        <button
          className="icon-action-btn"
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          aria-label={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {isDark ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#1e3a8a" />}
        </button>

        {/* Notifications Button */}
        <button
          className="icon-action-btn"
          title="System Notifications"
          aria-label="System Notifications"
        >
          <Bell size={18} />
          <span className="notification-dot" />
        </button>

        {/* User Profile Chip with Dropdown */}
        {user ? (
          <div style={{ position: 'relative' }}>
            <div
              className="user-profile-chip"
              onClick={() => setShowProfileMenu(prev => !prev)}
              title="User Account Menu"
              role="button"
              tabIndex={0}
            >
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                alt={user.name}
                className="user-avatar-img"
              />
              <div className="user-meta-text">
                <span className="user-name">{user.name}</span>
                <span className="user-role-badge">{user.role}</span>
              </div>
              <ChevronDown size={14} color="var(--color-text-muted)" />
            </div>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '115%',
                  width: '210px',
                  backgroundColor: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '0.5rem',
                  zIndex: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                    {user.email || user.username}
                  </div>
                </div>

                {user.role === 'admin' && (
                  <Link
                    to="/settings"
                    onClick={() => setShowProfileMenu(false)}
                    style={{
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.85rem',
                      color: 'var(--color-text-primary)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    System Settings
                  </Link>
                )}

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    handleLogout();
                  }}
                  style={{
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.85rem',
                    color: 'var(--color-danger)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="btn btn-primary btn-sm">
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;
