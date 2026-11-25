import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../common/Modal';
import { attendanceService, ATTENDANCE_STATUSES } from '../../services/attendanceService.js';
import { storageService } from '../../services/storageService.js';
import { toast } from 'react-toastify';
import { Calendar, Users, BookOpen, CheckCheck, XCircle, Clock, AlertCircle } from 'lucide-react';

const MarkAttendanceModal = ({
  isOpen,
  onClose,
  onSave,
  currentUser
}) => {
  const availableClasses = useMemo(() => {
    return attendanceService.getAvailableClassesForUser(currentUser);
  }, [currentUser]);

  const availableSubjects = useMemo(() => {
    return attendanceService.getAvailableSubjectsForUser(currentUser);
  }, [currentUser]);

  const todayStr = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(todayStr);
  const [selectedClass, setSelectedClass] = useState(availableClasses[0] || '');
  const [selectedSubject, setSelectedSubject] = useState(availableSubjects[0]?.subjectId || '');
  const [roster, setRoster] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Sync default class/subject if props or available lists change
  useEffect(() => {
    if (!selectedClass && availableClasses.length > 0) {
      setSelectedClass(availableClasses[0]);
    }
  }, [availableClasses, selectedClass]);

  useEffect(() => {
    if (!selectedSubject && availableSubjects.length > 0) {
      setSelectedSubject(availableSubjects[0].subjectId);
    }
  }, [availableSubjects, selectedSubject]);

  // Load students belonging to the selected class and merge with existing attendance for this date
  useEffect(() => {
    if (!selectedClass || !selectedSubject || !date) {
      setRoster([]);
      return;
    }

    const allStudents = storageService.getStudents();
    const classStudents = allStudents.filter(s => {
      const studentClassId = s.classId || `${s.department}-Sem${s.semester}-Sec${s.section}`;
      const shortClassId = `${s.semester}-${s.section}`;
      return selectedClass === studentClassId || selectedClass === shortClassId;
    });

    // Check existing attendance on this date for this class & subject
    const existingRecords = storageService.getAttendance().filter(
      r => r.date === date && r.classId === selectedClass && r.subjectId === selectedSubject
    );

    const initialRoster = classStudents.map(student => {
      const existing = existingRecords.find(r => r.studentId === student.studentId);
      return {
        studentId: student.studentId,
        studentName: student.fullName,
        status: existing ? existing.status : ATTENDANCE_STATUSES.PRESENT,
        remarks: existing ? existing.remarks || '' : '',
        isExisting: !!existing
      };
    });

    setRoster(initialRoster);
  }, [date, selectedClass, selectedSubject]);

  // Bulk status update
  const handleSetAllStatus = (newStatus) => {
    setRoster(prev => prev.map(item => ({ ...item, status: newStatus })));
  };

  // Single student status update
  const handleStatusChange = (studentId, status) => {
    setRoster(prev => prev.map(item => item.studentId === studentId ? { ...item, status } : item));
  };

  // Single student remarks update
  const handleRemarksChange = (studentId, remarks) => {
    setRoster(prev => prev.map(item => item.studentId === studentId ? { ...item, remarks } : item));
  };

  // Submission handler
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!date) {
      toast.error('Please select an attendance date.');
      return;
    }
    if (!selectedClass) {
      toast.error('Please select a class roster.');
      return;
    }
    if (!selectedSubject) {
      toast.error('Please select a course/subject.');
      return;
    }
    if (roster.length === 0) {
      toast.error('No students found enrolled in the selected class.');
      return;
    }

    setSubmitting(true);
    try {
      attendanceService.recordClassAttendance(currentUser, {
        date,
        classId: selectedClass,
        subjectId: selectedSubject,
        records: roster.map(r => ({
          studentId: r.studentId,
          studentName: r.studentName,
          status: r.status,
          remarks: r.remarks
        }))
      });

      toast.success(`Attendance successfully recorded for ${roster.length} students on ${date}!`);
      if (onSave) onSave();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to record attendance.');
    } finally {
      setSubmitting(false);
    }
  };

  // Counts for summary indicator
  const presentCount = roster.filter(r => r.status === ATTENDANCE_STATUSES.PRESENT).length;
  const absentCount = roster.filter(r => r.status === ATTENDANCE_STATUSES.ABSENT).length;
  const lateCount = roster.filter(r => r.status === ATTENDANCE_STATUSES.LATE).length;
  const excusedCount = roster.filter(r => r.status === ATTENDANCE_STATUSES.EXCUSED).length;
  const hasExistingEntries = roster.some(r => r.isExisting);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Daily Attendance"
      subtitle="Mark or update session attendance with duplicate prevention and automatic percentage tracking"
      maxWidth="850px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Session Selection Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {/* Date Picker */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.4rem' }}>
              <Calendar size={14} color="var(--color-primary)" />
              Session Date <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                backgroundColor: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text-primary)',
                fontSize: '0.88rem'
              }}
              required
            />
          </div>

          {/* Class / Section Dropdown */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.4rem' }}>
              <Users size={14} color="var(--color-primary)" />
              Class Section <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                backgroundColor: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text-primary)',
                fontSize: '0.88rem'
              }}
              required
            >
              {availableClasses.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          {/* Subject / Course Dropdown */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.4rem' }}>
              <BookOpen size={14} color="var(--color-primary)" />
              Course / Subject <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                backgroundColor: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text-primary)',
                fontSize: '0.88rem'
              }}
              required
            >
              {availableSubjects.map(sub => (
                <option key={sub.subjectId} value={sub.subjectId}>
                  {sub.subjectId} - {sub.subjectName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Existing Record Indicator Notification */}
        {hasExistingEntries && (
          <div
            style={{
              padding: '0.65rem 1rem',
              backgroundColor: 'var(--color-info-bg)',
              color: 'var(--color-info-text)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.82rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <AlertCircle size={16} />
            <span>Attendance for this date and session was previously recorded. Modifying will update the existing session entries.</span>
          </div>
        )}

        {/* Quick Batch Controls & Counts */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--color-bg-main)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)'
          }}
        >
          {/* Quick Mark Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              Quick Action:
            </span>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleSetAllStatus(ATTENDANCE_STATUSES.PRESENT)}
              style={{ color: 'var(--color-success)', borderColor: 'rgba(22, 163, 74, 0.4)' }}
            >
              <CheckCheck size={14} /> Mark All Present
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleSetAllStatus(ATTENDANCE_STATUSES.ABSENT)}
              style={{ color: 'var(--color-danger)', borderColor: 'rgba(220, 38, 38, 0.4)' }}
            >
              <XCircle size={14} /> Mark All Absent
            </button>
          </div>

          {/* Roster Counts */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', fontWeight: 700 }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Total: {roster.length}</span>
            <span style={{ color: 'var(--color-success)' }}>• Present: {presentCount}</span>
            <span style={{ color: 'var(--color-danger)' }}>• Absent: {absentCount}</span>
            {lateCount > 0 && <span style={{ color: 'var(--color-warning)' }}>• Late: {lateCount}</span>}
            {excusedCount > 0 && <span style={{ color: 'var(--color-info)' }}>• Excused: {excusedCount}</span>}
          </div>
        </div>

        {/* Student Roster Table */}
        {roster.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-md)' }}>
            No students found in class section "{selectedClass}".
          </div>
        ) : (
          <div className="table-wrapper" style={{ maxHeight: '380px', overflowY: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th style={{ padding: '0.75rem 1rem' }}>Student ID & Name</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Attendance Status</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Remarks (Optional)</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((item) => (
                  <tr key={item.studentId}>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--color-text-primary)', fontSize: '0.88rem' }}>
                        {item.studentName}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--color-text-secondary)' }}>
                        {item.studentId}
                      </div>
                    </td>

                    {/* Status Pill Buttons */}
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '4px', backgroundColor: 'var(--color-bg-main)', padding: '2px', borderRadius: 'var(--radius-md)' }}>
                        {Object.values(ATTENDANCE_STATUSES).map((statusVal) => {
                          const isSelected = item.status === statusVal;
                          return (
                            <button
                              key={statusVal}
                              type="button"
                              onClick={() => handleStatusChange(item.studentId, statusVal)}
                              style={{
                                border: 'none',
                                borderRadius: 'var(--radius-sm)',
                                padding: '4px 8px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                backgroundColor: isSelected
                                  ? statusVal === ATTENDANCE_STATUSES.PRESENT
                                    ? 'var(--color-success)'
                                    : statusVal === ATTENDANCE_STATUSES.ABSENT
                                    ? 'var(--color-danger)'
                                    : statusVal === ATTENDANCE_STATUSES.LATE
                                    ? 'var(--color-warning)'
                                    : 'var(--color-info)'
                                  : 'transparent',
                                color: isSelected ? '#ffffff' : 'var(--color-text-secondary)'
                              }}
                            >
                              {statusVal}
                            </button>
                          );
                        })}
                      </div>
                    </td>

                    {/* Optional Remarks */}
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <input
                        type="text"
                        placeholder="e.g. Lab experiment delay, sick leave..."
                        value={item.remarks}
                        onChange={(e) => handleRemarksChange(item.studentId, e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.45rem 0.65rem',
                          backgroundColor: 'var(--color-bg-card)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.82rem',
                          color: 'var(--color-text-primary)'
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting || roster.length === 0}
          >
            {submitting ? 'Saving Attendance...' : 'Save Attendance Session'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default MarkAttendanceModal;

