import React, { useMemo } from 'react';
import Modal from '../common/Modal';
import AttendanceStatusBadge from './AttendanceStatusBadge';
import AttendanceShortageBadge from './AttendanceShortageBadge';
import { attendanceService } from '../../services/attendanceService.js';
import { Calendar, CheckCircle2, XCircle, AlertTriangle, BookOpen } from 'lucide-react';

const StudentAttendanceModal = ({
  isOpen,
  onClose,
  student,
  allAttendance = []
}) => {
  if (!student) return null;

  // Filter attendance records strictly for this student
  const studentRecords = useMemo(() => {
    return allAttendance.filter(r => r.studentId === student.studentId);
  }, [allAttendance, student.studentId]);

  // Overall attendance calculations
  const metrics = useMemo(() => {
    return attendanceService.calculateStudentAttendance(studentRecords);
  }, [studentRecords]);

  // Subject-wise attendance breakdown
  const subjectBreakdown = useMemo(() => {
    return attendanceService.getSubjectWiseBreakdown(studentRecords);
  }, [studentRecords]);

  // Sort chronological session logs (newest first)
  const sortedRecords = useMemo(() => {
    return [...studentRecords].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [studentRecords]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Student Attendance Record"
      subtitle={`${student.fullName} (${student.studentId}) • Class: ${student.classId || 'N/A'}`}
      maxWidth="840px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Top Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem' }}>
          {/* Attendance Percentage */}
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: metrics.isShortage ? 'var(--color-danger-bg)' : 'var(--color-primary-light)',
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${metrics.isShortage ? 'rgba(220, 38, 38, 0.25)' : 'rgba(30, 58, 138, 0.18)'}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: metrics.isShortage ? 'var(--color-danger)' : 'var(--color-primary)', letterSpacing: '0.5px' }}>
                Overall Attendance
              </span>
              {metrics.isShortage ? (
                <AlertTriangle size={18} color="var(--color-danger)" />
              ) : (
                <CheckCircle2 size={18} color="var(--color-primary)" />
              )}
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: metrics.isShortage ? 'var(--color-danger-text)' : 'var(--color-primary-text)' }}>
              {metrics.percentage.toFixed(1)}%
            </div>
            <div>
              <AttendanceShortageBadge percentage={metrics.percentage} threshold={metrics.threshold} showDetails={false} />
            </div>
          </div>

          {/* Conducted Sessions */}
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: 'var(--color-bg-main)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem'
            }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', letterSpacing: '0.5px' }}>
              Conducted Sessions
            </span>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
              {metrics.total}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
              Total scheduled sessions
            </div>
          </div>

          {/* Attended Sessions */}
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: 'var(--color-bg-main)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem'
            }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', letterSpacing: '0.5px' }}>
              Attended Sessions
            </span>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-success)' }}>
              {metrics.attended}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
              Present: {metrics.present} | Late: {metrics.late} | OD: {metrics.excused}
            </div>
          </div>

          {/* Absent Sessions */}
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: 'var(--color-bg-main)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem'
            }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', letterSpacing: '0.5px' }}>
              Absent Sessions
            </span>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: metrics.absent > 0 ? 'var(--color-danger)' : 'var(--color-text-primary)' }}>
              {metrics.absent}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
              Unexcused absences
            </div>
          </div>
        </div>

        {/* Shortage Alert Callout (If Applicable) */}
        {metrics.isShortage && (
          <div
            style={{
              padding: '0.85rem 1.15rem',
              backgroundColor: 'var(--color-danger-bg)',
              border: '1px solid rgba(220, 38, 38, 0.3)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            <AlertTriangle size={20} color="var(--color-danger)" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.85rem', color: 'var(--color-danger-text)' }}>
              <strong>Attendance Shortage Warning:</strong> Student attendance ({metrics.percentage.toFixed(1)}%) is below the university mandatory minimum of {metrics.threshold}%. The student risks being debarred from examinations unless attended sessions improve.
            </div>
          </div>
        )}

        {/* Subject-Wise Attendance Breakdown */}
        <div>
          <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={16} color="var(--color-primary)" />
            Subject-Wise Attendance Breakdown
          </h4>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th style={{ padding: '0.65rem 1rem' }}>Subject Code & Name</th>
                  <th style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>Total Sessions</th>
                  <th style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>Attended</th>
                  <th style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>Absent</th>
                  <th style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>Attendance Rate</th>
                  <th style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>Standing</th>
                </tr>
              </thead>
              <tbody>
                {subjectBreakdown.map(sub => (
                  <tr key={sub.subjectId}>
                    <td style={{ padding: '0.65rem 1rem', fontWeight: 600 }}>
                      {sub.subjectId} - {sub.subjectName}
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>{sub.totalSessions}</td>
                    <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center', color: 'var(--color-success)', fontWeight: 600 }}>
                      {sub.attendedSessions}
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center', color: sub.absentSessions > 0 ? 'var(--color-danger)' : 'inherit', fontWeight: 600 }}>
                      {sub.absentSessions}
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center', fontWeight: 700 }}>
                      {sub.percentage.toFixed(1)}%
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>
                      <AttendanceShortageBadge percentage={sub.percentage} threshold={75} showDetails={false} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chronological Session History Logs */}
        <div>
          <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={16} color="var(--color-primary)" />
            Session Attendance History ({sortedRecords.length} Records)
          </h4>

          {sortedRecords.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--color-text-secondary)', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-md)' }}>
              No attendance logs found for this student.
            </div>
          ) : (
            <div className="table-wrapper" style={{ maxHeight: '280px', overflowY: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th style={{ padding: '0.65rem 1rem' }}>Date</th>
                    <th style={{ padding: '0.65rem 1rem' }}>Subject</th>
                    <th style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>Status</th>
                    <th style={{ padding: '0.65rem 1rem' }}>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRecords.map(r => (
                    <tr key={r.id}>
                      <td style={{ padding: '0.65rem 1rem', fontWeight: 600 }}>{r.date}</td>
                      <td style={{ padding: '0.65rem 1rem' }}>{r.subjectId} - {r.subjectName}</td>
                      <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>
                        <AttendanceStatusBadge status={r.status} size="sm" />
                      </td>
                      <td style={{ padding: '0.65rem 1rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontStyle: r.remarks ? 'italic' : 'normal' }}>
                        {r.remarks || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Close Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close Attendance Record
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default StudentAttendanceModal;

