import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  UserCheck,
  Award,
  CalendarCheck,
  FileSpreadsheet,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  ShieldCheck,
  User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isCollapsed, toggleCollapse, isMobileOpen, closeMobile }) => {
  const { user } = useAuth();

  // Role-specific navigation items
  const getNavItems = () => {
    if (!user) {
      return [{ path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }];
    }

    if (user.role === 'admin') {
      return [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/students', label: 'Students', icon: Users },
        { path: '/faculty', label: 'Faculty', icon: UserCheck },
        { path: '/marks', label: 'Marks & Grades', icon: Award },
        { path: '/attendance', label: 'Attendance', icon: CalendarCheck },
        { path: '/reports', label: 'Reports & PDF', icon: FileSpreadsheet },
        { path: '/analytics', label: 'Analytics', icon: BarChart3 },
        { path: '/settings', label: 'Settings', icon: Settings },
      ];
    }

    if (user.role === 'faculty') {
      return [
        { path: '/dashboard', label: 'Faculty Dashboard', icon: LayoutDashboard },
        { path: '/students', label: 'Assigned Students', icon: Users },
        { path: '/marks', label: 'Marks Entry', icon: Award },
        { path: '/attendance', label: 'Take Attendance', icon: CalendarCheck },
        { path: '/reports', label: 'Class Reports', icon: FileSpreadsheet },
      ];
    }

    if (user.role === 'student') {
      const studentProfilePath = user.studentId ? `/students/${user.studentId}` : '/students';
      return [
        { path: '/dashboard', label: 'Student Portal', icon: LayoutDashboard },
        { path: studentProfilePath, label: 'My Academic Profile', icon: User },
        { path: '/marks', label: 'My Marks & Grades', icon: Award },
        { path: '/attendance', label: 'My Attendance', icon: CalendarCheck },
        { path: '/reports', label: 'My Transcripts', icon: FileSpreadsheet },
      ];
    }

    return [{ path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }];
  };

  const navItems = getNavItems();

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
      {/* Sidebar Header & University Branding */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="brand-icon-box">
            <GraduationCap size={24} />
          </div>
          {!isCollapsed && (
            <div className="brand-text">
              <span className="brand-title">Apex University</span>
              <span className="brand-subtitle">SRMS Portal</span>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          className="sidebar-collapse-btn"
          onClick={toggleCollapse}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        {/* Mobile Close Button */}
        {isMobileOpen && (
          <button
            className="mobile-close-btn"
            onClick={closeMobile}
            style={{
              color: '#ffffff',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px'
            }}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        {!isCollapsed && (
          <div className="nav-section-label">
            {user?.role ? `${user.role.toUpperCase()} WORKSPACE` : 'NAVIGATION'}
          </div>
        )}
        {navItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMobile}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title={isCollapsed ? item.label : undefined}
            >
              <IconComponent className="nav-icon" />
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        {!isCollapsed ? (
          <>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} color="#16a34a" /> System Active
            </span>
            <span style={{ textTransform: 'capitalize', fontWeight: 600, color: 'var(--color-primary-text)' }}>
              {user?.role || 'Guest'}
            </span>
          </>
        ) : (
          <span style={{ margin: '0 auto' }}>
            <ShieldCheck size={16} color="#16a34a" />
          </span>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
