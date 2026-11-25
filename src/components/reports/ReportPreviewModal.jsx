import React from 'react';
import Modal from '../common/Modal';
import GradeBadge from '../marks/GradeBadge';
import AttendanceStatusBadge from '../attendance/AttendanceStatusBadge';
import AttendanceShortageBadge from '../attendance/AttendanceShortageBadge';
import { exportStudentTranscriptPDF } from '../../utils/pdfGenerator.js';
import { toast } from 'react-toastify';
import {
  Download,
  Printer,
  GraduationCap,
  Award,
  Calendar,
  CheckCircle2,
  AlertCircle,
  BookOpen
} from 'lucide-react';

const ReportPreviewModal = ({
  isOpen,
  onClose,
  reportData
}) => {
  if (!reportData) return null;

  const { student, academic, attendance, institution, referenceId, issueDate, status } = reportData;

  const handleDownloadPDF = () => {
    try {
      exportStudentTranscriptPDF(reportData, true);
      toast.success('Official Academic Transcript PDF downloaded successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to generate transcript PDF.');
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Academic Transcript Preview"
      subtitle={`Official Student Report Dossier • Ref: ${referenceId}`}
      maxWidth="900px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Actions Bar */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
            <span>Status:</span>
            <span
              style={{
                fontWeight: 700,
                color: status.isComplete ? 'var(--color-success)' : 'var(--color-warning)'
              }}
            >
              {status.evaluationStatus}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handlePrint}
            >
              <Printer size={15} /> Print
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleDownloadPDF}
            >
              <Download size={15} /> Download PDF
            </button>
          </div>
        </div>

        {/* Printable Transcript Document Paper Canvas */}
        <div
          className="print-transcript-canvas"
          style={{
            backgroundColor: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          {/* Institutional Branding Header */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid var(--color-primary)', paddingBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '0.5px' }}>
              {institution.name}
            </h2>
            <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              {institution.department}
            </p>
            <p style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
              {institution.accreditation}
            </p>
            <p style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
              {institution.address}
            </p>
          </div>

          {/* Transcript Title & Reference Metadata */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
            <div>
              <span>Reference No: </span>
              <strong style={{ color: 'var(--color-text-primary)' }}>{referenceId}</strong>
            </div>
            <div>
              <span>Date of Issue: </span>
              <strong style={{ color: 'var(--color-text-primary)' }}>{issueDate}</strong>
            </div>
          </div>

          {/* Student Profile Card */}
          <div
            style={{
              padding: '1rem',
              backgroundColor: 'var(--color-bg-main)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '0.75rem',
              fontSize: '0.85rem'
            }}
          >
            <div>
              <span style={{ color: 'var(--color-text-secondary)' }}>Student Name: </span>
              <strong style={{ color: 'var(--color-text-primary)' }}>{student.fullName}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-secondary)' }}>Student ID: </span>
              <strong style={{ color: 'var(--color-primary)' }}>{student.studentId}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-secondary)' }}>Department: </span>
              <strong style={{ color: 'var(--color-text-primary)' }}>{student.department}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-secondary)' }}>Academic Year: </span>
              <strong style={{ color: 'var(--color-text-primary)' }}>{student.academicYear}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-secondary)' }}>Current Semester: </span>
              <strong style={{ color: 'var(--color-text-primary)' }}>Semester {student.semester} (Section {student.section})</strong>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-secondary)' }}>Class Roster: </span>
              <strong style={{ color: 'var(--color-text-primary)' }}>{student.classId}</strong>
            </div>
          </div>

          {/* Academic Overview KPI Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.85rem' }}>
            <div style={{ padding: '0.85rem', backgroundColor: 'var(--color-primary-light)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-primary)' }}>
                Cumulative CGPA
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary-text)', marginTop: '2px' }}>
                {academic.cgpa > 0 ? academic.cgpa.toFixed(2) : 'N/A'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
                10.0 Scale
              </div>
            </div>

            <div style={{ padding: '0.85rem', backgroundColor: 'var(--color-bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>
                Earned Credits
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-primary)', marginTop: '2px' }}>
                {academic.totalCredits}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
                Quality Points: {academic.totalQualityPoints.toFixed(1)}
              </div>
            </div>

            <div style={{ padding: '0.85rem', backgroundColor: 'var(--color-bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>
                Attendance Rate
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: attendance.isShortage ? 'var(--color-danger)' : 'var(--color-success)', marginTop: '2px' }}>
                {attendance.percentage.toFixed(1)}%
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
                {attendance.isShortage ? 'Shortage (<75%)' : 'Eligible'}
              </div>
            </div>

            <div style={{ padding: '0.85rem', backgroundColor: 'var(--color-bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>
                Academic Standing
              </div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--color-primary)', marginTop: '6px' }}>
                {academic.standing}
              </div>
            </div>
          </div>

          {/* Academic Semester Breakdown Tables */}
          <div>
            <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <GraduationCap size={18} color="var(--color-primary)" />
              Semester Grade Transcripts
            </h4>

            {academic.semesters.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--color-text-secondary)', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                No academic marks have been recorded for this student yet. Evaluation is pending.
              </div>
            ) : (
              academic.semesters.map((sem) => (
                <div key={sem.semester} style={{ marginBottom: '1.25rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <div style={{ padding: '0.65rem 1rem', backgroundColor: 'var(--color-bg-main)', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--color-text-primary)' }}>
                      Semester {sem.semester} (Earned Credits: {sem.credits})
                    </span>
                    <span style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--color-primary)' }}>
                      Semester SGPA: {sem.sgpa.toFixed(2)}
                    </span>
                  </div>

                  <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                    <table>
                      <thead>
                        <tr>
                          <th style={{ padding: '0.6rem 0.85rem' }}>Code & Course Title</th>
                          <th style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>Credits</th>
                          <th style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>Breakdown</th>
                          <th style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>Total / 100</th>
                          <th style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>Grade</th>
                          <th style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>GP</th>
                          <th style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sem.marks.map((m) => (
                          <tr key={m.id}>
                            <td style={{ padding: '0.6rem 0.85rem', fontWeight: 600 }}>
                              {m.subjectId} - {m.subjectName}
                            </td>
                            <td style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>{m.credits}</td>
                            <td style={{ padding: '0.6rem 0.5rem', textAlign: 'center', fontSize: '0.76rem', color: 'var(--color-text-secondary)' }}>
                              Int: {m.components?.internal ?? 0} | Ext: {m.components?.external ?? 0} | Asg: {m.components?.assignment ?? 0}
                              {m.components?.lab > 0 && ` | Lab: ${m.components.lab}`}
                            </td>
                            <td style={{ padding: '0.6rem 0.5rem', textAlign: 'center', fontWeight: 700 }}>
                              {m.totalMarks} ({m.percentage}%)
                            </td>
                            <td style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>
                              <GradeBadge grade={m.grade} size="sm" />
                            </td>
                            <td style={{ padding: '0.6rem 0.5rem', textAlign: 'center', fontWeight: 600 }}>
                              {Number(m.gradePoint).toFixed(1)}
                            </td>
                            <td style={{ padding: '0.6rem 0.5rem', textAlign: 'center', fontWeight: 700, color: m.grade !== 'F' ? 'var(--color-success)' : 'var(--color-danger)' }}>
                              {m.grade !== 'F' ? 'PASS' : 'FAIL'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Attendance Standing Table */}
          <div>
            <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} color="var(--color-primary)" />
              Attendance Summary & Regulatory Compliance
            </h4>

            {attendance.subjectBreakdown.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--color-text-secondary)', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                No attendance logs found for this student. Tracking pending.
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th style={{ padding: '0.6rem 0.85rem' }}>Course Code & Name</th>
                      <th style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>Conducted</th>
                      <th style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>Attended</th>
                      <th style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>Absent</th>
                      <th style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>Attendance %</th>
                      <th style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.subjectBreakdown.map(sub => (
                      <tr key={sub.subjectId}>
                        <td style={{ padding: '0.6rem 0.85rem', fontWeight: 600 }}>
                          {sub.subjectId} - {sub.subjectName}
                        </td>
                        <td style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>{sub.totalSessions}</td>
                        <td style={{ padding: '0.6rem 0.5rem', textAlign: 'center', color: 'var(--color-success)', fontWeight: 600 }}>{sub.attendedSessions}</td>
                        <td style={{ padding: '0.6rem 0.5rem', textAlign: 'center', color: sub.absentSessions > 0 ? 'var(--color-danger)' : 'inherit', fontWeight: 600 }}>{sub.absentSessions}</td>
                        <td style={{ padding: '0.6rem 0.5rem', textAlign: 'center', fontWeight: 800 }}>{sub.percentage.toFixed(1)}%</td>
                        <td style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>
                          <AttendanceShortageBadge percentage={sub.percentage} threshold={75} showDetails={false} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Signatures & Verification Seal */}
          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--color-border)',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1rem',
              textAlign: 'center',
              fontSize: '0.78rem'
            }}
          >
            <div>
              <div style={{ height: '35px' }}></div>
              <div style={{ borderTop: '1px solid var(--color-text-secondary)', paddingTop: '4px', fontWeight: 700 }}>
                Dean of Academic Affairs
              </div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem' }}>Dr. Sarah Jenkins</div>
            </div>

            <div>
              <div style={{ height: '20px', fontWeight: 800, color: 'var(--color-primary)', fontSize: '0.75rem' }}>
                [ UNIVERSITY SEAL ]
              </div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem', marginTop: '15px' }}>
                Digitally Authenticated
              </div>
            </div>

            <div>
              <div style={{ height: '35px' }}></div>
              <div style={{ borderTop: '1px solid var(--color-text-secondary)', paddingTop: '4px', fontWeight: 700 }}>
                Controller of Examinations
              </div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem' }}>Apex Institute of Technology</div>
            </div>
          </div>
        </div>

        {/* Modal Close Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close Transcript Preview
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ReportPreviewModal;

