import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { reportService } from '../services/reportService.js';
import { exportStudentTranscriptPDF } from '../utils/pdfGenerator.js';
import StatCard from '../components/common/StatCard';
import EmptyState from '../components/common/EmptyState';
import GradeBadge from '../components/marks/GradeBadge';
import AttendanceShortageBadge from '../components/attendance/AttendanceShortageBadge';
import ReportPreviewModal from '../components/reports/ReportPreviewModal';
import { toast } from 'react-toastify';
import {
  FileText,
  Download,
  Printer,
  Search,
  RotateCcw,
  GraduationCap,
  Award,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Eye,
  Percent,
  Users
} from 'lucide-react';

const Reports = () => {
  const { user } = useAuth();

  const [reportSummaries, setReportSummaries] = useState([]);
  const [personalReport, setPersonalReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters & Search (for Admin/Faculty)
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [semesterFilter, setSemesterFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Active Preview Modal
  const [previewReportData, setPreviewReportData] = useState(null);

  // Load report data
  const loadReports = () => {
    try {
      setLoading(true);
      if (user?.role === 'student') {
        const studentData = reportService.generateStudentReportData(user, user.studentId);
        setPersonalReport(studentData);
      } else if (user) {
        const summaries = reportService.getAllStudentsReportSummaries(user);
        setReportSummaries(summaries);
      }
    } catch (err) {
      toast.error(err.message || 'Error compiling academic reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [user]);

  // Overall statistics for Admin & Faculty
  const stats = useMemo(() => {
    if (!reportSummaries || reportSummaries.length === 0) {
      return { totalStudents: 0, evaluatedCount: 0, averageCGPA: 0, attendanceEligibleRate: 0 };
    }

    const totalStudents = reportSummaries.length;
    const evaluated = reportSummaries.filter(r => r.hasMarks);
    const evaluatedCount = evaluated.length;

    const totalCGPA = evaluated.reduce((sum, r) => sum + (Number(r.cgpa) || 0), 0);
    const averageCGPA = evaluatedCount > 0
      ? Math.round((totalCGPA / evaluatedCount) * 100) / 100
      : 0;

    const eligibleAttendanceCount = reportSummaries.filter(r => !r.isAttendanceShortage).length;
    const attendanceEligibleRate = Math.round(((eligibleAttendanceCount / totalStudents) * 100) * 10) / 10;

    return {
      totalStudents,
      evaluatedCount,
      averageCGPA,
      attendanceEligibleRate
    };
  }, [reportSummaries]);

  // Unique departments for filter
  const departments = useMemo(() => {
    return Array.from(new Set(reportSummaries.map(r => r.department))).filter(Boolean);
  }, [reportSummaries]);

  // Filtered reports for Admin/Faculty
  const filteredSummaries = useMemo(() => {
    return reportSummaries.filter(r => {
      const query = searchTerm.toLowerCase().trim();
      const matchesSearch = !query ||
        r.studentId.toLowerCase().includes(query) ||
        r.fullName.toLowerCase().includes(query) ||
        r.department.toLowerCase().includes(query) ||
        r.classId.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      if (departmentFilter !== 'ALL' && r.department !== departmentFilter) {
        return false;
      }

      if (semesterFilter !== 'ALL' && r.semester !== Number(semesterFilter)) {
        return false;
      }

      if (statusFilter !== 'ALL' && r.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [reportSummaries, searchTerm, departmentFilter, semesterFilter, statusFilter]);

  // Paginated records
  const totalPages = Math.ceil(filteredSummaries.length / pageSize) || 1;
  const paginatedSummaries = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSummaries.slice(start, start + pageSize);
  }, [filteredSummaries, currentPage, pageSize]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, departmentFilter, semesterFilter, statusFilter]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setDepartmentFilter('ALL');
    setSemesterFilter('ALL');
    setStatusFilter('ALL');
  };

  // Open Preview Modal for a student
  const handleOpenPreview = (studentId) => {
    try {
      const fullReport = reportService.generateStudentReportData(user, studentId);
      setPreviewReportData(fullReport);
    } catch (err) {
      toast.error(err.message || 'Failed to load transcript report.');
    }
  };

  // Direct PDF Download for a student
  const handleDirectDownload = (studentId) => {
    try {
      const fullReport = reportService.generateStudentReportData(user, studentId);
      exportStudentTranscriptPDF(fullReport, true);
      toast.success(`Transcript PDF for ${fullReport.student.fullName} downloaded successfully!`);
    } catch (err) {
      toast.error(err.message || 'Failed to export PDF.');
    }
  };

  // Direct Print
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  // =====================================================================
  // STUDENT VIEW (Personal Academic Transcript Dossier)
  // =====================================================================
  if (user?.role === 'student') {
    if (!personalReport) {
      return (
        <EmptyState
          icon={FileText}
          title="No Academic Transcript Available"
          description="Your official academic dossier is being processed by the Office of the Controller of Examinations."
        />
      );
    }

    const { student, academic, attendance, institution, referenceId, issueDate, status } = personalReport;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {/* Header & Main Export Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
              Official Academic Transcript
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '2px' }}>
              Comprehensive university academic report dossier, semester grade breakdown, and attendance standing.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handlePrint}
            >
              <Printer size={16} /> Print Transcript
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                exportStudentTranscriptPDF(personalReport, true);
                toast.success('Transcript PDF downloaded successfully!');
              }}
            >
              <Download size={16} /> Download Official PDF
            </button>
          </div>
        </div>

        {/* Embedded Transcript Document Canvas */}
        <div
          className="card"
          style={{
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          {/* Institutional Branding Header */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid var(--color-primary)', paddingBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '0.5px' }}>
              {institution.name}
            </h2>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              {institution.department}
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              {institution.accreditation} • {institution.address}
            </p>
          </div>

          {/* Transcript Reference and Issue Date */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.85rem' }}>
            <div>
              <span style={{ color: 'var(--color-text-secondary)' }}>Document Reference: </span>
              <strong style={{ color: 'var(--color-text-primary)' }}>{referenceId}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-secondary)' }}>Date of Issue: </span>
              <strong style={{ color: 'var(--color-text-primary)' }}>{issueDate}</strong>
            </div>
          </div>

          {/* Student Profile Card */}
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: 'var(--color-bg-main)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '0.85rem',
              fontSize: '0.88rem'
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
              <span style={{ color: 'var(--color-text-secondary)' }}>Class Identifier: </span>
              <strong style={{ color: 'var(--color-text-primary)' }}>{student.classId}</strong>
            </div>
          </div>

          {/* Summary KPI Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: 'var(--color-primary-light)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-primary)' }}>
                Cumulative CGPA
              </span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary-text)', marginTop: '2px' }}>
                {academic.cgpa > 0 ? academic.cgpa.toFixed(2) : 'N/A'}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                10.0 Scale
              </span>
            </div>

            <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>
                Total Earned Credits
              </span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-primary)', marginTop: '2px' }}>
                {academic.totalCredits}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                Quality Points: {academic.totalQualityPoints.toFixed(1)}
              </span>
            </div>

            <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>
                Attendance Rate
              </span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: attendance.isShortage ? 'var(--color-danger)' : 'var(--color-success)', marginTop: '2px' }}>
                {attendance.percentage.toFixed(1)}%
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                {attendance.isShortage ? 'Shortage (<75%)' : 'Eligible'}
              </span>
            </div>

            <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>
                Academic Standing
              </span>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-primary)', marginTop: '6px' }}>
                {academic.standing}
              </div>
            </div>
          </div>

          {/* Semester-by-Semester Subject Grade Breakdown */}
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <GraduationCap size={20} color="var(--color-primary)" />
              Semester Grade Transcripts
            </h3>

            {academic.semesters.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                Academic evaluation is currently in progress. Your semester marks will appear here once finalized.
              </div>
            ) : (
              academic.semesters.map((sem) => (
                <div key={sem.semester} style={{ marginBottom: '1.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <div style={{ padding: '0.85rem 1.25rem', backgroundColor: 'var(--color-bg-main)', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>
                      Semester {sem.semester} ({sem.credits} Total Credits)
                    </span>
                    <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-primary)' }}>
                      Semester SGPA: {sem.sgpa.toFixed(2)}
                    </span>
                  </div>

                  <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                    <table>
                      <thead>
                        <tr>
                          <th style={{ padding: '0.75rem 1rem' }}>Code & Course Title</th>
                          <th style={{ padding: '0.75rem 0.65rem', textAlign: 'center' }}>Credits</th>
                          <th style={{ padding: '0.75rem 0.65rem', textAlign: 'center' }}>Breakdown</th>
                          <th style={{ padding: '0.75rem 0.65rem', textAlign: 'center' }}>Total / 100</th>
                          <th style={{ padding: '0.75rem 0.65rem', textAlign: 'center' }}>Grade</th>
                          <th style={{ padding: '0.75rem 0.65rem', textAlign: 'center' }}>GP</th>
                          <th style={{ padding: '0.75rem 0.65rem', textAlign: 'center' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sem.marks.map((m) => (
                          <tr key={m.id}>
                            <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>
                              {m.subjectId} - {m.subjectName}
                            </td>
                            <td style={{ padding: '0.75rem 0.65rem', textAlign: 'center' }}>{m.credits}</td>
                            <td style={{ padding: '0.75rem 0.65rem', textAlign: 'center', fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                              Int: {m.components?.internal ?? 0} | Ext: {m.components?.external ?? 0} | Asg: {m.components?.assignment ?? 0}
                              {m.components?.lab > 0 && ` | Lab: ${m.components.lab}`}
                            </td>
                            <td style={{ padding: '0.75rem 0.65rem', textAlign: 'center', fontWeight: 700 }}>
                              {m.totalMarks} ({m.percentage}%)
                            </td>
                            <td style={{ padding: '0.75rem 0.65rem', textAlign: 'center' }}>
                              <GradeBadge grade={m.grade} size="sm" />
                            </td>
                            <td style={{ padding: '0.75rem 0.65rem', textAlign: 'center', fontWeight: 600 }}>
                              {Number(m.gradePoint).toFixed(1)}
                            </td>
                            <td style={{ padding: '0.75rem 0.65rem', textAlign: 'center', fontWeight: 700, color: m.grade !== 'F' ? 'var(--color-success)' : 'var(--color-danger)' }}>
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
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={20} color="var(--color-primary)" />
              Attendance Summary & Regulatory Compliance
            </h3>

            {attendance.subjectBreakdown.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                No attendance logs found for this student. Tracking pending.
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th style={{ padding: '0.75rem 1rem' }}>Course Code & Name</th>
                      <th style={{ padding: '0.75rem 0.65rem', textAlign: 'center' }}>Total Classes</th>
                      <th style={{ padding: '0.75rem 0.65rem', textAlign: 'center' }}>Attended</th>
                      <th style={{ padding: '0.75rem 0.65rem', textAlign: 'center' }}>Absent</th>
                      <th style={{ padding: '0.75rem 0.65rem', textAlign: 'center' }}>Attendance Rate</th>
                      <th style={{ padding: '0.75rem 0.65rem', textAlign: 'center' }}>Standing</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.subjectBreakdown.map(sub => (
                      <tr key={sub.subjectId}>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>
                          {sub.subjectId} - {sub.subjectName}
                        </td>
                        <td style={{ padding: '0.75rem 0.65rem', textAlign: 'center' }}>{sub.totalSessions}</td>
                        <td style={{ padding: '0.75rem 0.65rem', textAlign: 'center', color: 'var(--color-success)', fontWeight: 600 }}>{sub.attendedSessions}</td>
                        <td style={{ padding: '0.75rem 0.65rem', textAlign: 'center', color: sub.absentSessions > 0 ? 'var(--color-danger)' : 'inherit', fontWeight: 600 }}>{sub.absentSessions}</td>
                        <td style={{ padding: '0.75rem 0.65rem', textAlign: 'center', fontWeight: 800 }}>{sub.percentage.toFixed(1)}%</td>
                        <td style={{ padding: '0.75rem 0.65rem', textAlign: 'center' }}>
                          <AttendanceShortageBadge percentage={sub.percentage} threshold={75} showDetails={false} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Official Signatures */}
          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--color-border)',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1rem',
              textAlign: 'center',
              fontSize: '0.85rem'
            }}
          >
            <div>
              <div style={{ height: '35px' }}></div>
              <div style={{ borderTop: '1px solid var(--color-text-secondary)', paddingTop: '4px', fontWeight: 700 }}>
                Dean of Academic Affairs
              </div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>Dr. Sarah Jenkins</div>
            </div>

            <div>
              <div style={{ height: '20px', fontWeight: 800, color: 'var(--color-primary)', fontSize: '0.82rem' }}>
                [ UNIVERSITY SEAL ]
              </div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginTop: '15px' }}>
                Digitally Authenticated
              </div>
            </div>

            <div>
              <div style={{ height: '35px' }}></div>
              <div style={{ borderTop: '1px solid var(--color-text-secondary)', paddingTop: '4px', fontWeight: 700 }}>
                Controller of Examinations
              </div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>Apex Institute of Technology</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================================
  // ADMINISTRATOR & FACULTY VIEW (Institutional Reports Directory)
  // =====================================================================
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
          Academic Reports & Transcripts
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '2px' }}>
          {user?.role === 'admin'
            ? 'Institutional official report generation, transcript dossiers, and printable PDF exports.'
            : 'Academic report and transcript center for assigned student rosters.'}
        </p>
      </div>

      {/* KPI Stat Cards */}
      <div className="stat-card-grid">
        <StatCard
          title="Total Student Records"
          value={stats.totalStudents}
          subtitle="Enrolled student candidates"
          icon={Users}
          iconBg="var(--color-primary-light)"
          iconColor="var(--color-primary)"
        />
        <StatCard
          title="Transcripts Available"
          value={stats.evaluatedCount}
          subtitle="Evaluated academic dossiers"
          icon={FileText}
          iconBg="rgba(2, 132, 199, 0.12)"
          iconColor="var(--color-info)"
        />
        <StatCard
          title="Average Institutional CGPA"
          value={stats.averageCGPA > 0 ? stats.averageCGPA.toFixed(2) : 'N/A'}
          subtitle="10.0 Scale Mean Performance"
          icon={GraduationCap}
          iconBg="rgba(22, 163, 74, 0.12)"
          iconColor="var(--color-success)"
        />
        <StatCard
          title="Attendance Eligibility"
          value={`${stats.attendanceEligibleRate}%`}
          subtitle="Students meeting >=75% cutoff"
          icon={Percent}
          iconBg="rgba(217, 119, 6, 0.12)"
          iconColor="var(--color-warning)"
        />
      </div>

      {/* Search & Filters */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
          {/* Search Input */}
          <div style={{ position: 'relative' }}>
            <Search
              size={18}
              color="var(--color-text-muted)"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Search student name, ID, class..."
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

          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            style={{
              padding: '0.65rem 0.85rem',
              backgroundColor: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-text-primary)',
              fontSize: '0.88rem'
            }}
          >
            <option value="ALL">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          {/* Semester Filter */}
          <select
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value)}
            style={{
              padding: '0.65rem 0.85rem',
              backgroundColor: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-text-primary)',
              fontSize: '0.88rem'
            }}
          >
            <option value="ALL">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
              <option key={s} value={s}>Semester {s}</option>
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
            <option value="Complete">Complete (Marks & Attd)</option>
            <option value="Pending">Pending Evaluation</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        {(searchTerm || departmentFilter !== 'ALL' || semesterFilter !== 'ALL' || statusFilter !== 'ALL') && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleResetFilters}
            >
              <RotateCcw size={14} /> Clear Active Filters
            </button>
          </div>
        )}
      </div>

      {/* Reports Directory Table */}
      {filteredSummaries.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Student Reports Found"
          description={
            searchTerm || departmentFilter !== 'ALL' || semesterFilter !== 'ALL' || statusFilter !== 'ALL'
              ? 'No student reports match your search and filter parameters.'
              : 'No students are available in the registry for report generation.'
          }
        />
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th style={{ padding: '0.85rem 1.25rem' }}>Student Profile</th>
                <th style={{ padding: '0.85rem 1rem' }}>Department & Class</th>
                <th style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>Completed Sem</th>
                <th style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>Cumulative CGPA</th>
                <th style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>Attendance Standing</th>
                <th style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Transcript Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSummaries.map((item) => (
                <tr key={item.studentId}>
                  {/* Student Details */}
                  <td style={{ padding: '0.85rem 1.25rem' }}>
                    <div style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      {item.fullName}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                      {item.studentId}
                    </div>
                  </td>

                  {/* Department & Class */}
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {item.department}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                      Sem {item.semester} • {item.classId}
                    </div>
                  </td>

                  {/* Completed Semesters */}
                  <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center', fontWeight: 600 }}>
                    {item.completedSemesters > 0 ? `${item.completedSemesters} Sem (${item.totalCredits} Cr)` : '0 Sem'}
                  </td>

                  {/* Cumulative CGPA */}
                  <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                    {item.cgpa > 0 ? (
                      <span style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '0.95rem' }}>
                        {item.cgpa.toFixed(2)}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>Pending</span>
                    )}
                  </td>

                  {/* Attendance Standing */}
                  <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                    {item.hasAttendance ? (
                      <AttendanceShortageBadge percentage={item.attendancePercentage} threshold={75} showDetails={true} />
                    ) : (
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>No Attendance</span>
                    )}
                  </td>

                  {/* Status */}
                  <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: item.status === 'Complete' ? 'var(--color-success-bg)' : 'var(--color-warning-bg)',
                        color: item.status === 'Complete' ? 'var(--color-success-text)' : 'var(--color-warning-text)'
                      }}
                    >
                      {item.status === 'Complete' ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                      {item.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        title="View Full Transcript Dossier"
                        onClick={() => handleOpenPreview(item.studentId)}
                      >
                        <Eye size={14} /> View
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        title="Download Vector PDF Transcript"
                        onClick={() => handleDirectDownload(item.studentId)}
                      >
                        <Download size={14} /> PDF
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            Showing page {currentPage} of {totalPages} ({filteredSummaries.length} records)
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

      {/* In-App Report Preview Modal */}
      {previewReportData && (
        <ReportPreviewModal
          isOpen={!!previewReportData}
          onClose={() => setPreviewReportData(null)}
          reportData={previewReportData}
        />
      )}
    </div>
  );
};

export default Reports;
