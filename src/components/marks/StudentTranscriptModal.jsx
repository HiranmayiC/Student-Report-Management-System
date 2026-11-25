import React, { useMemo } from 'react';
import Modal from '../common/Modal';
import GradeBadge from './GradeBadge';
import { marksService } from '../../services/marksService.js';
import { Award, GraduationCap, CheckCircle2, AlertCircle } from 'lucide-react';

const StudentTranscriptModal = ({
  isOpen,
  onClose,
  student,
  allMarks = []
}) => {
  if (!student) return null;

  // Filter marks belonging to this student
  const studentMarks = useMemo(() => {
    return allMarks.filter(m => m.studentId === student.studentId);
  }, [allMarks, student.studentId]);

  // Compute multi-semester GPA breakdown
  const gpaSummary = useMemo(() => {
    return marksService.getStudentGpaSummary(studentMarks);
  }, [studentMarks]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Official Academic Transcript"
      subtitle={`${student.fullName} (${student.studentId}) • ${student.department} • Class: ${student.classId || `${student.department}-Sem${student.semester}-${student.section}`}`}
      maxWidth="840px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Top Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          {/* CGPA */}
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: 'var(--color-primary-light)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(30, 58, 138, 0.18)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-primary)', letterSpacing: '0.5px' }}>
                Cumulative CGPA
              </span>
              <GraduationCap size={18} color="var(--color-primary)" />
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-primary-text)' }}>
              {gpaSummary.cgpa > 0 ? gpaSummary.cgpa.toFixed(2) : 'N/A'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
              Across {gpaSummary.semesters.length} Semesters • 10.0 Scale
            </div>
          </div>

          {/* Total Credits */}
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
              Total Earned Credits
            </span>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
              {gpaSummary.totalCredits}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
              Total Quality Points: {gpaSummary.totalQualityPoints.toFixed(1)}
            </div>
          </div>

          {/* Subjects Completed */}
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
              Subjects Evaluated
            </span>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
              {studentMarks.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
              Passed: {studentMarks.filter(m => m.grade !== 'F').length} • Failed: {studentMarks.filter(m => m.grade === 'F').length}
            </div>
          </div>
        </div>

        {/* Semester-by-Semester Breakdown */}
        {gpaSummary.semesters.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>
            No academic marks have been recorded for this student yet.
          </div>
        ) : (
          gpaSummary.semesters.map((sem) => (
            <div
              key={sem.semester}
              style={{
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                backgroundColor: 'var(--color-bg-card)'
              }}
            >
              {/* Semester Header */}
              <div
                style={{
                  padding: '0.85rem 1.25rem',
                  backgroundColor: 'var(--color-bg-main)',
                  borderBottom: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <Award size={18} color="var(--color-primary)" />
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    Semester {sem.semester}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                    ({sem.credits} Total Credits)
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                    Semester SGPA:
                  </span>
                  <span
                    style={{
                      padding: '3px 10px',
                      backgroundColor: 'var(--color-primary)',
                      color: '#ffffff',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 800,
                      fontSize: '0.88rem'
                    }}
                  >
                    {sem.sgpa.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Semester Subject Table */}
              <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                <table>
                  <thead>
                    <tr>
                      <th style={{ padding: '0.65rem 1rem' }}>Course Code & Name</th>
                      <th style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>Credits</th>
                      <th style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>Breakdown</th>
                      <th style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>Total / 100</th>
                      <th style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>Grade</th>
                      <th style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sem.marks.map((mark) => (
                      <tr key={mark.id || `${mark.studentId}-${mark.subjectId}`}>
                        <td style={{ padding: '0.65rem 1rem' }}>
                          <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '0.88rem' }}>
                            {mark.subjectId} - {mark.subjectName}
                          </div>
                          {mark.facultyRemarks && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontStyle: 'italic', marginTop: '2px' }}>
                              "{mark.facultyRemarks}"
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center', fontWeight: 600 }}>
                          {mark.credits}
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center', fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                          Int: {mark.components?.internal ?? 0} | Ext: {mark.components?.external ?? 0} | Asg: {mark.components?.assignment ?? 0}
                          {mark.components?.lab > 0 && ` | Lab: ${mark.components.lab}`}
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center', fontWeight: 700 }}>
                          {mark.totalMarks} <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 400 }}>({mark.percentage}%)</span>
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>
                          <GradeBadge grade={mark.grade} gradePoint={mark.gradePoint} showPoint={true} size="sm" />
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              color: mark.grade !== 'F' ? 'var(--color-success)' : 'var(--color-danger)'
                            }}
                          >
                            {mark.grade !== 'F' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                            {mark.grade !== 'F' ? 'Pass' : 'Fail'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}

        {/* Modal Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close Transcript
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default StudentTranscriptModal;

