import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { attendanceService, ATTENDANCE_STATUSES } from '../services/attendanceService.js';
import { studentService } from '../services/studentService.js';
import { canRecordAttendance, canAccessStudentRecord } from '../utils/rbacRules.js';
import StatCard from '../components/common/StatCard';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import AttendanceStatusBadge from '../components/attendance/AttendanceStatusBadge';
import AttendanceShortageBadge from '../components/attendance/AttendanceShortageBadge';
import MarkAttendanceModal from '../components/attendance/MarkAttendanceModal';
import EditAttendanceModal from '../components/attendance/EditAttendanceModal';
import StudentAttendanceModal from '../components/attendance/StudentAttendanceModal';
import { toast } from 'react-toastify';
import {
  Calendar,
  Users,
  BookOpen,
  Plus,
  Search,
  RotateCcw,
  Edit2,
  Trash2,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Percent,
  Clock
} from 'lucide-react';

const Attendance = () => {
  const { user } = useAuth();

  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('ALL');
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [shortageOnly, setShortageOnly] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modals
  const [isMarkModalOpen, setIsMarkModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedStudentForModal, setSelectedStudentForModal] = useState(null);
  const [deleteRecordTarget, setDeleteRecordTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Load attendance data
  const loadData = () => {
    try {
      setLoading(true);
      if (user) {
        const studentData = studentService.getAll(user);
        const attendanceData = attendanceService.getAll(user);
        setStudents(studentData);
        setAttendance(attendanceData);
      }
    } catch (err) {
      toast.error(err.message || 'Error loading attendance records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Authorized classes and subjects
  const availableClasses = useMemo(() => {
    return attendanceService.getAvailableClassesForUser(user);
  }, [user]);

  const availableSubjects = useMemo(() => {
    return attendanceService.getAvailableSubjectsForUser(user);
  }, [user]);

  // Overall Statistics for Admin/Faculty
  const stats = useMemo(() => {
    return attendanceService.getOverallStats(user);
  }, [user, attendance]);

  // Map of student metrics for shortage filter
  const studentMetricsMap = useMemo(() => {
    const map = {};
    for (const s of students) {
      const recordsForStudent = attendance.filter(r => r.studentId === s.studentId);
      map[s.studentId] = attendanceService.calculateStudentAttendance(recordsForStudent);
    }
    return map;
  }, [students, attendance]);

  // Filtered attendance records for Admin/Faculty
  const filteredAttendance = useMemo(() => {
    return attendance.filter(record => {
      // Find associated student name for search
      const student = students.find(s => s.studentId === record.studentId);
      const studentName = student?.fullName || record.studentName || '';

      // Search match
      const query = searchTerm.toLowerCase().trim();
      const matchesSearch = !query ||
        record.studentId.toLowerCase().includes(query) ||
        studentName.toLowerCase().includes(query) ||
        record.subjectId.toLowerCase().includes(query) ||
        (record.subjectName && record.subjectName.toLowerCase().includes(query)) ||
        record.classId.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      // Class filter
      if (classFilter !== 'ALL' && record.classId !== classFilter) {
        return false;
      }

      // Subject filter
      if (subjectFilter !== 'ALL' && record.subjectId !== subjectFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'ALL' && record.status !== statusFilter) {
        return false;
      }

      // Date filter
      if (dateFilter && record.date !== dateFilter) {
        return false;
      }

      // Shortage only toggle
      if (shortageOnly) {
        const studentStats = studentMetricsMap[record.studentId];
        if (!studentStats || !studentStats.isShortage) {
          return false;
        }
      }

      return true;
    });
  }, [attendance, students, searchTerm, classFilter, subjectFilter, statusFilter, dateFilter, shortageOnly, studentMetricsMap]);

  // Paginated records
  const totalPages = Math.ceil(filteredAttendance.length / pageSize) || 1;
  const paginatedAttendance = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAttendance.slice(start, start + pageSize);
  }, [filteredAttendance, currentPage, pageSize]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, classFilter, subjectFilter, statusFilter, dateFilter, shortageOnly]);

  // Clear filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setClassFilter('ALL');
    setSubjectFilter('ALL');
    setStatusFilter('ALL');
    setDateFilter('');
    setShortageOnly(false);
  };

  // Check if current user can edit this record
  const canEditRecord = (record) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.role === 'faculty') {
      return canRecordAttendance(user, record.classId, record.subjectId);
    }
    return false;
  };

  // Delete handler (Admin only)
  const handleDeleteConfirm = () => {
    if (!deleteRecordTarget) return;
    try {
      setDeleting(true);
      attendanceService.deleteRecord(user, deleteRecordTarget.id);
      toast.success('Attendance record deleted successfully.');
      setDeleteRecordTarget(null);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete attendance record.');
    } finally {
      setDeleting(false);
    }
  };

  // =====================================================================
  // STUDENT VIEW (Personal Attendance Profile & Shortage Status)
  // =====================================================================
  if (user?.role === 'student') {
    const studentRecords = attendance;
    const studentMetrics = attendanceService.calculateStudentAttendance(studentRecords);
    const subjectBreakdown = attendanceService.getSubjectWiseBreakdown(studentRecords);
    const sortedRecords = [...studentRecords].sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            My Attendance Record & Standing
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            Course attendance percentages, session breakdown, and institutional eligibility tracking.
          </p>
        </div>

        {/* Top Summary Cards */}
        <div className="stat-card-grid">
          <StatCard
            title="Overall Attendance Rate"
            value={`${studentMetrics.percentage.toFixed(1)}%`}
            subtitle={studentMetrics.isShortage ? 'Shortage Alert (<75%)' : 'Eligible for Exams (>=75%)'}
            icon={Percent}
            iconBg={studentMetrics.isShortage ? 'var(--color-danger-bg)' : 'var(--color-primary-light)'}
            iconColor={studentMetrics.isShortage ? 'var(--color-danger)' : 'var(--color-primary)'}
          />
          <StatCard
            title="Total Sessions Conducted"
            value={studentMetrics.total}
            subtitle="Scheduled class hours"
            icon={Calendar}
            iconBg="rgba(2, 132, 199, 0.12)"
            iconColor="var(--color-info)"
          />
          <StatCard
            title="Attended Sessions"
            value={studentMetrics.attended}
            subtitle={`Present: ${studentMetrics.present} • Late: ${studentMetrics.late} • OD: ${studentMetrics.excused}`}
            icon={CheckCircle2}
            iconBg="rgba(22, 163, 74, 0.12)"
            iconColor="var(--color-success)"
          />
          <StatCard
            title="Absences"
            value={studentMetrics.absent}
            subtitle={studentMetrics.absent === 0 ? 'Zero unexcused absences' : 'Unexcused missed sessions'}
            icon={Clock}
            iconBg={studentMetrics.absent > 0 ? 'rgba(220, 38, 38, 0.12)' : 'var(--color-primary-light)'}
            iconColor={studentMetrics.absent > 0 ? 'var(--color-danger)' : 'var(--color-primary)'}
          />
        </div>

        {/* Attendance Shortage Alert Callout */}
        {studentMetrics.isShortage && (
          <div
            style={{
              padding: '1rem 1.25rem',
              backgroundColor: 'var(--color-danger-bg)',
              border: '1px solid rgba(220, 38, 38, 0.3)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem'
            }}
          >
            <AlertTriangle size={24} color="var(--color-danger)" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-danger-text)' }}>
                Warning: Attendance Shortage Detected ({studentMetrics.percentage.toFixed(1)}% / Minimum {studentMetrics.threshold}%)
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--color-danger-text)', marginTop: '2px' }}>
                Your aggregate attendance is below the mandatory 75% regulatory requirement. Please attend all upcoming sessions or contact your academic advisor.
              </div>
            </div>
          </div>
        )}

        {/* Subject-Wise Breakdown Table */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div
            style={{
              padding: '1.1rem 1.5rem',
              backgroundColor: 'var(--color-bg-main)',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={18} color="var(--color-primary)" />
              Subject-Wise Attendance Breakdown
            </h3>
          </div>

          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Course Code & Name</th>
                  <th style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>Total Classes</th>
                  <th style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>Attended</th>
                  <th style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>Absent</th>
                  <th style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>Attendance Rate</th>
                  <th style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {subjectBreakdown.map(sub => (
                  <tr key={sub.subjectId}>
                    <td style={{ padding: '0.85rem 1.25rem', fontWeight: 600 }}>
                      {sub.subjectId} - {sub.subjectName}
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center', fontWeight: 600 }}>
                      {sub.totalSessions}
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center', color: 'var(--color-success)', fontWeight: 700 }}>
                      {sub.attendedSessions}
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center', color: sub.absentSessions > 0 ? 'var(--color-danger)' : 'inherit', fontWeight: 700 }}>
                      {sub.absentSessions}
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center', fontWeight: 800 }}>
                      {sub.percentage.toFixed(1)}%
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                      <AttendanceShortageBadge percentage={sub.percentage} threshold={75} showDetails={false} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Session Logs */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div
            style={{
              padding: '1.1rem 1.5rem',
              backgroundColor: 'var(--color-bg-main)',
              borderBottom: '1px solid var(--color-border)'
            }}
          >
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} color="var(--color-primary)" />
              Daily Session Attendance History ({sortedRecords.length} Records)
            </h3>
          </div>

          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0, maxHeight: '350px', overflowY: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Date</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Course / Subject</th>
                  <th style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {sortedRecords.map(r => (
                  <tr key={r.id}>
                    <td style={{ padding: '0.85rem 1.25rem', fontWeight: 600 }}>{r.date}</td>
                    <td style={{ padding: '0.85rem 1rem' }}>{r.subjectId} - {r.subjectName}</td>
                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                      <AttendanceStatusBadge status={r.status} size="md" />
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', color: 'var(--color-text-secondary)', fontStyle: r.remarks ? 'italic' : 'normal' }}>
                      {r.remarks || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================================
  // ADMINISTRATOR & FACULTY VIEW (Roster Attendance Management)
  // =====================================================================
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header & Main Action */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            Attendance Management
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '2px' }}>
            {user?.role === 'admin'
              ? 'Institutional daily session roll marking, attendance history, and shortage monitoring.'
              : `Attendance manager for assigned classes: ${(user?.assignedClasses || []).join(', ')}.`}
          </p>
        </div>

        {availableClasses.length > 0 && availableSubjects.length > 0 && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsMarkModalOpen(true)}
          >
            <Plus size={18} /> Record Attendance
          </button>
        )}
      </div>

      {/* KPI Stat Cards */}
      <div className="stat-card-grid">
        <StatCard
          title="Total Recorded Entries"
          value={stats.totalRecords}
          subtitle={`${stats.totalSessions} class sessions conducted`}
          icon={Calendar}
          iconBg="var(--color-primary-light)"
          iconColor="var(--color-primary)"
        />
        <StatCard
          title="Average Attendance Rate"
          value={`${stats.averagePercentage.toFixed(1)}%`}
          subtitle={`Present Rate: ${stats.presentRate.toFixed(1)}%`}
          icon={Percent}
          iconBg="rgba(2, 132, 199, 0.12)"
          iconColor="var(--color-info)"
        />
        <StatCard
          title="Shortage Alerts (<75%)"
          value={stats.shortageCount}
          subtitle="Students below 75% threshold"
          icon={AlertTriangle}
          iconBg={stats.shortageCount > 0 ? 'rgba(220, 38, 38, 0.12)' : 'rgba(22, 163, 74, 0.12)'}
          iconColor={stats.shortageCount > 0 ? 'var(--color-danger)' : 'var(--color-success)'}
        />
        <StatCard
          title="Monitored Students"
          value={students.length}
          subtitle="Enrolled active roster"
          icon={Users}
          iconBg="rgba(217, 119, 6, 0.12)"
          iconColor="var(--color-warning)"
        />
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search
              size={18}
              color="var(--color-text-muted)"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Search student or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                backgroundColor: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text-primary)',
                fontSize: '0.88rem'
              }}
            />
          </div>

          {/* Class Filter */}
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            style={{
              padding: '0.65rem 0.85rem',
              backgroundColor: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-text-primary)',
              fontSize: '0.88rem'
            }}
          >
            <option value="ALL">All Authorized Classes</option>
            {availableClasses.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>

          {/* Subject Filter */}
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            style={{
              padding: '0.65rem 0.85rem',
              backgroundColor: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-text-primary)',
              fontSize: '0.88rem'
            }}
          >
            <option value="ALL">All Authorized Courses</option>
            {availableSubjects.map(sub => (
              <option key={sub.subjectId} value={sub.subjectId}>
                {sub.subjectId} - {sub.subjectName}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '0.65rem 0.85rem',
              backgroundColor: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-text-primary)',
              fontSize: '0.88rem'
            }}
          >
            <option value="ALL">All Statuses</option>
            {Object.values(ATTENDANCE_STATUSES).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Date Filter */}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{
              padding: '0.65rem 0.85rem',
              backgroundColor: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-text-primary)',
              fontSize: '0.88rem'
            }}
          />
        </div>

        {/* Shortage Toggle & Reset */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: shortageOnly ? 'var(--color-danger)' : 'var(--color-text-secondary)' }}>
            <input
              type="checkbox"
              checked={shortageOnly}
              onChange={(e) => setShortageOnly(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: 'var(--color-danger)' }}
            />
            <span>Filter Students with Attendance Shortage (&lt;75%)</span>
          </label>

          {(searchTerm || classFilter !== 'ALL' || subjectFilter !== 'ALL' || statusFilter !== 'ALL' || dateFilter || shortageOnly) && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleResetFilters}
            >
              <RotateCcw size={14} /> Clear Active Filters
            </button>
          )}
        </div>
      </div>

      {/* Attendance Records Table */}
      {filteredAttendance.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No Attendance Records Found"
          description={
            searchTerm || classFilter !== 'ALL' || subjectFilter !== 'ALL' || statusFilter !== 'ALL' || dateFilter || shortageOnly
              ? 'No records match your active search and filter parameters.'
              : 'No session attendance has been recorded yet.'
          }
          actionLabel={availableClasses.length > 0 ? 'Record First Session' : null}
          onAction={availableClasses.length > 0 ? () => setIsMarkModalOpen(true) : null}
        />
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th style={{ padding: '0.85rem 1.25rem' }}>Session Date</th>
                <th style={{ padding: '0.85rem 1rem' }}>Student Details</th>
                <th style={{ padding: '0.85rem 1rem' }}>Course / Subject</th>
                <th style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>Class</th>
                <th style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '0.85rem 1rem' }}>Remarks</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAttendance.map((record) => {
                const student = students.find(s => s.studentId === record.studentId);
                const isEditable = canEditRecord(record);
                const studentMetrics = studentMetricsMap[record.studentId];

                return (
                  <tr key={record.id}>
                    {/* Date */}
                    <td style={{ padding: '0.85rem 1.25rem', fontWeight: 600 }}>
                      {record.date}
                    </td>

                    {/* Student */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        {student?.fullName || record.studentName || record.studentId}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <span>{record.studentId}</span>
                        {studentMetrics && (
                          <span style={{ color: studentMetrics.isShortage ? 'var(--color-danger)' : 'var(--color-success)', fontWeight: 700 }}>
                            • {studentMetrics.percentage.toFixed(1)}% Attd
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Course */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {record.subjectId} - {record.subjectName}
                      </div>
                    </td>

                    {/* Class */}
                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center', fontWeight: 600 }}>
                      {record.classId}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                      <AttendanceStatusBadge status={record.status} size="md" />
                    </td>

                    {/* Remarks */}
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontStyle: record.remarks ? 'italic' : 'normal' }}>
                      {record.remarks || '—'}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        {/* View Student Attendance Profile */}
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          title="View Complete Attendance Profile"
                          onClick={() => setSelectedStudentForModal(student || { studentId: record.studentId, fullName: record.studentName, classId: record.classId })}
                        >
                          <FileText size={14} />
                        </button>

                        {/* Edit Record */}
                        {isEditable && (
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            title="Correct Attendance Status"
                            onClick={() => setEditingRecord(record)}
                          >
                            <Edit2 size={14} />
                          </button>
                        )}

                        {/* Delete Record (Admin Only) */}
                        {user?.role === 'admin' && (
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            title="Delete Attendance Record"
                            style={{ color: 'var(--color-danger)' }}
                            onClick={() => setDeleteRecordTarget(record)}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            Showing page {currentPage} of {totalPages} ({filteredAttendance.length} records)
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            >
              Previous
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Record Attendance Modal */}
      {isMarkModalOpen && (
        <MarkAttendanceModal
          isOpen={isMarkModalOpen}
          onClose={() => setIsMarkModalOpen(false)}
          onSave={() => loadData()}
          currentUser={user}
        />
      )}

      {/* Edit Single Record Modal */}
      {editingRecord && (
        <EditAttendanceModal
          isOpen={!!editingRecord}
          onClose={() => setEditingRecord(null)}
          record={editingRecord}
          currentUser={user}
          onSave={() => loadData()}
        />
      )}

      {/* Student Attendance Breakdown Modal */}
      {selectedStudentForModal && (
        <StudentAttendanceModal
          isOpen={!!selectedStudentForModal}
          onClose={() => setSelectedStudentForModal(null)}
          student={selectedStudentForModal}
          allAttendance={attendance}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteRecordTarget && (
        <ConfirmDialog
          isOpen={!!deleteRecordTarget}
          onClose={() => setDeleteRecordTarget(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Attendance Record"
          message={`Are you sure you want to permanently delete the attendance record for student "${deleteRecordTarget.studentId}" on ${deleteRecordTarget.date}? This action cannot be undone.`}
          confirmText="Delete Record"
          loading={deleting}
        />
      )}
    </div>
  );
};

export default Attendance;
