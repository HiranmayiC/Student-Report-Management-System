import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Building2,
  BookOpen,
  Award,
  CalendarCheck,
  TrendingUp,
  AlertTriangle,
  UserPlus,
  FileCheck,
  FileSpreadsheet,
  User
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import { useAuth } from '../context/AuthContext';

// Institutional Overview Metrics
const sampleStats = [
  {
    title: 'Total Students',
    value: '1,248',
    icon: Users,
    trend: '+5.2%',
    trendType: 'up',
    subtitle: 'vs last semester',
    iconBg: '#eff6ff',
    iconColor: '#1e3a8a'
  },
  {
    title: 'Total Faculty',
    value: '84',
    icon: UserCheck,
    trend: '+2.1%',
    trendType: 'up',
    subtitle: 'across 6 depts',
    iconBg: '#f0fdf4',
    iconColor: '#16a34a'
  },
  {
    title: 'Departments',
    value: '6',
    icon: Building2,
    subtitle: 'Engineering & Sciences',
    iconBg: '#fef3c7',
    iconColor: '#d97706'
  },
  {
    title: 'Active Courses',
    value: '42',
    icon: BookOpen,
    subtitle: 'Current academic cycle',
    iconBg: '#e0f2fe',
    iconColor: '#0284c7'
  },
  {
    title: 'Average Performance',
    value: '78.4%',
    icon: Award,
    trend: '+3.1%',
    trendType: 'up',
    subtitle: 'Institutional SGPA ~ 7.9',
    iconBg: '#eff6ff',
    iconColor: '#2563eb'
  },
  {
    title: 'Overall Attendance',
    value: '86.2%',
    icon: CalendarCheck,
    trend: '-0.8%',
    trendType: 'down',
    subtitle: 'Min requirement: 75%',
    iconBg: '#f0fdf4',
    iconColor: '#15803d'
  },
  {
    title: 'Outstanding Students',
    value: '142',
    icon: TrendingUp,
    trend: '+12.0%',
    trendType: 'up',
    subtitle: 'CGPA >= 9.0 (Grade O)',
    iconBg: '#ecfdf5',
    iconColor: '#059669'
  },
  {
    title: 'Requiring Attention',
    value: '38',
    icon: AlertTriangle,
    trend: 'Alert',
    trendType: 'down',
    subtitle: 'Attendance < 75% or GPA < 5.0',
    iconBg: '#fee2e2',
    iconColor: '#dc2626'
  }
];

const sampleActivities = [
  {
    id: 1,
    title: 'Semester 4 Mid-Term Marks published for CS401 (Algorithms)',
    time: '25 minutes ago',
    badge: 'Marks',
    badgeType: 'badge-info'
  },
  {
    id: 2,
    title: 'Daily Attendance recorded for Section 4-A by Prof. Alan Turing',
    time: '1 hour ago',
    badge: 'Attendance',
    badgeType: 'badge-success'
  },
  {
    id: 3,
    title: 'Attendance Shortage Alert generated for 3 students in CS402',
    time: '3 hours ago',
    badge: 'Warning',
    badgeType: 'badge-warning'
  },
  {
    id: 4,
    title: 'New Student Enrollment: STU-2024-118 (Grace Hopper) admitted',
    time: '5 hours ago',
    badge: 'Admission',
    badgeType: 'badge-info'
  }
];

const sampleTopStudents = [
  { id: 'STU-2024-001', name: 'Ada Lovelace', dept: 'CSE', cgpa: '9.85', attendance: '96%' },
  { id: 'STU-2024-002', name: 'Charles Babbage', dept: 'CSE', cgpa: '9.60', attendance: '92%' },
  { id: 'STU-2024-003', name: 'Margaret Hamilton', dept: 'IT', cgpa: '9.45', attendance: '94%' },
  { id: 'STU-2024-004', name: 'Claude Shannon', dept: 'ECE', cgpa: '9.30', attendance: '91%' }
];

const Dashboard = () => {
  const { user } = useAuth();

  const getDashboardHeading = () => {
    if (user?.role === 'student') return `Welcome, ${user.name}`;
    if (user?.role === 'faculty') return `Faculty Dashboard • ${user.name}`;
    return 'Institutional Overview';
  };

  const getDashboardSubtitle = () => {
    if (user?.role === 'student') {
      return `Student ID: ${user.studentId} • Department of ${user.department || 'Computer Science'}`;
    }
    if (user?.role === 'faculty') {
      return `Faculty ID: ${user.facultyId} • Department of ${user.department || 'Computer Science'}`;
    }
    return 'Academic Year 2024–2025 • Spring Term Analytics & Operations';
  };

  const studentProfileUrl = user?.studentId ? `/students/${user.studentId}` : '/students';

  return (
    <div>
      {/* Page Title & Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            {getDashboardHeading()}
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '2px' }}>
            {getDashboardSubtitle()}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/reports" className="btn btn-secondary btn-sm">
            <FileSpreadsheet size={16} /> Export Summary
          </Link>
          {user?.role === 'admin' && (
            <Link to="/students" className="btn btn-primary btn-sm">
              <UserPlus size={16} /> New Enrollment
            </Link>
          )}
        </div>
      </div>

      {/* 8 Metric Statistics Cards */}
      <div className="stat-card-grid">
        {sampleStats.map((stat, idx) => (
          <StatCard
            key={idx}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
            trendType={stat.trendType}
            subtitle={stat.subtitle}
            iconBg={stat.iconBg}
            iconColor={stat.iconColor}
          />
        ))}
      </div>

      {/* Quick Action Navigation Buttons */}
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.85rem', color: 'var(--color-text-primary)' }}>
        Quick Management Workflows
      </h2>
      <div className="quick-actions-bar">
        {user?.role === 'student' ? (
          <>
            <Link to={studentProfileUrl} className="quick-action-card">
              <div className="quick-action-icon">
                <User size={20} />
              </div>
              <div>
                <div className="quick-action-title">My Profile</div>
                <div className="quick-action-desc">Academic demographics</div>
              </div>
            </Link>
            <Link to="/marks" className="quick-action-card">
              <div className="quick-action-icon" style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
                <Award size={20} />
              </div>
              <div>
                <div className="quick-action-title">My Marks</div>
                <div className="quick-action-desc">SGPA, CGPA & grades</div>
              </div>
            </Link>
            <Link to="/attendance" className="quick-action-card">
              <div className="quick-action-icon" style={{ backgroundColor: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>
                <CalendarCheck size={20} />
              </div>
              <div>
                <div className="quick-action-title">My Attendance</div>
                <div className="quick-action-desc">Subject percentage</div>
              </div>
            </Link>
            <Link to="/reports" className="quick-action-card">
              <div className="quick-action-icon" style={{ backgroundColor: 'var(--color-info-bg)', color: 'var(--color-info)' }}>
                <FileSpreadsheet size={20} />
              </div>
              <div>
                <div className="quick-action-title">My Transcripts</div>
                <div className="quick-action-desc">PDF grade cards</div>
              </div>
            </Link>
          </>
        ) : (
          <>
            <Link to="/students" className="quick-action-card">
              <div className="quick-action-icon">
                <UserPlus size={20} />
              </div>
              <div>
                <div className="quick-action-title">
                  {user?.role === 'faculty' ? 'Assigned Students' : 'Manage Students'}
                </div>
                <div className="quick-action-desc">Enrollment & profiles</div>
              </div>
            </Link>

            <Link to="/marks" className="quick-action-card">
              <div className="quick-action-icon" style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
                <FileCheck size={20} />
              </div>
              <div>
                <div className="quick-action-title">Enter Marks</div>
                <div className="quick-action-desc">Internal & exam scores</div>
              </div>
            </Link>

            <Link to="/attendance" className="quick-action-card">
              <div className="quick-action-icon" style={{ backgroundColor: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>
                <CalendarCheck size={20} />
              </div>
              <div>
                <div className="quick-action-title">Take Attendance</div>
                <div className="quick-action-desc">Subject daily roll</div>
              </div>
            </Link>

            <Link to="/reports" className="quick-action-card">
              <div className="quick-action-icon" style={{ backgroundColor: 'var(--color-info-bg)', color: 'var(--color-info)' }}>
                <FileSpreadsheet size={20} />
              </div>
              <div>
                <div className="quick-action-title">Generate Reports</div>
                <div className="quick-action-desc">Official PDF transcripts</div>
              </div>
            </Link>
          </>
        )}
      </div>

      {/* Two Column Layout: Top Students & Recent Activities */}
      <div
        className="dashboard-grid-two-col"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '1.5rem',
          marginTop: '1rem'
        }}
      >
        {/* Top Performing Students */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <Award size={20} color="var(--color-primary)" />
                Top Academic Performers
              </div>
              <div className="card-subtitle">Highest CGPA records across departments</div>
            </div>
            {user?.role !== 'student' && (
              <Link to="/students" className="btn btn-secondary btn-sm">
                View All
              </Link>
            )}
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Full Name</th>
                  <th>Dept</th>
                  <th>CGPA</th>
                  <th>Attendance</th>
                </tr>
              </thead>
              <tbody>
                {sampleTopStudents.map(student => (
                  <tr key={student.id}>
                    <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                      {student.id}
                    </td>
                    <td>{student.name}</td>
                    <td>
                      <span className="badge badge-info">{student.dept}</span>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--color-success)' }}>
                      {student.cgpa}
                    </td>
                    <td>
                      <span className="badge badge-success">{student.attendance}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Institutional Activities */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <TrendingUp size={20} color="var(--color-primary)" />
                Recent Institutional Activity
              </div>
              <div className="card-subtitle">Audit events logged across the university</div>
            </div>
            <span className="badge badge-info">Realtime Feed</span>
          </div>

          <div className="activity-feed-list">
            {sampleActivities.map(activity => (
              <div key={activity.id} className="activity-item">
                <div
                  className="activity-dot"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                />
                <div className="activity-content">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <span className="activity-title">{activity.title}</span>
                    <span className={`badge ${activity.badgeType}`}>{activity.badge}</span>
                  </div>
                  <div className="activity-time">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
