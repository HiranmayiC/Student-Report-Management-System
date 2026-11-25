import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { marksService } from '../services/marksService.js';
import { studentService } from '../services/studentService.js';
import { canAccessStudentRecord, canEnterSubjectMarks } from '../utils/rbacRules.js';
import StatCard from '../components/common/StatCard';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import GradeBadge from '../components/marks/GradeBadge';
import MarksEntryModal from '../components/marks/MarksEntryModal';
import StudentTranscriptModal from '../components/marks/StudentTranscriptModal';
import { toast } from 'react-toastify';
import {
  Award,
  GraduationCap,
  BookOpen,
  Plus,
  Search,
  RotateCcw,
  Edit2,
  Trash2,
  FileText,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Percent
} from 'lucide-react';

const Marks = () => {
  const { user } = useAuth();

  const [marks, setMarks] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('ALL');
  const [courseFilter, setCourseFilter] = useState('ALL');
  const [gradeFilter, setGradeFilter] = useState('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modals
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [editingMark, setEditingMark] = useState(null);
  const [transcriptStudent, setTranscriptStudent] = useState(null);
  const [deleteConfirmMark, setDeleteConfirmMark] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Load marks and student records
  const loadData = () => {
    try {
      setLoading(true);
      if (user) {
        const studentData = studentService.getAll(user);
        const marksData = marksService.getAll(user);
        setStudents(studentData);
        setMarks(marksData);
      }
    } catch (err) {
      toast.error(err.message || 'Error loading academic data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Available courses for the current user
  const availableCourses = useMemo(() => {
    return marksService.getAvailableCoursesForUser(user);
  }, [user]);

  // Overall Statistics for Admin/Faculty
  const stats = useMemo(() => {
    return marksService.getStats(user);
  }, [user, marks]);

  // Filtered marks records for Admin/Faculty
  const filteredMarks = useMemo(() => {
    return marks.filter(mark => {
      // Find associated student name for search
      const student = students.find(s => s.studentId === mark.studentId);
      const studentName = student?.fullName || '';

      // Search match
      const query = searchTerm.toLowerCase().trim();
      const matchesSearch = !query ||
        mark.studentId.toLowerCase().includes(query) ||
        studentName.toLowerCase().includes(query) ||
        mark.subjectId.toLowerCase().includes(query) ||
        (mark.subjectName && mark.subjectName.toLowerCase().includes(query));

      if (!matchesSearch) return false;

      // Semester filter
      if (semesterFilter !== 'ALL' && mark.semester !== Number(semesterFilter)) {
        return false;
      }

      // Course filter
      if (courseFilter !== 'ALL' && mark.subjectId !== courseFilter) {
        return false;
      }

      // Grade filter
      if (gradeFilter !== 'ALL' && mark.grade !== gradeFilter) {
        return false;
      }

      return true;
    });
  }, [marks, students, searchTerm, semesterFilter, courseFilter, gradeFilter]);

  // Paginated marks
  const totalPages = Math.ceil(filteredMarks.length / pageSize) || 1;
  const paginatedMarks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMarks.slice(start, start + pageSize);
  }, [filteredMarks, currentPage, pageSize]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, semesterFilter, courseFilter, gradeFilter]);

  // Reset filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setSemesterFilter('ALL');
    setCourseFilter('ALL');
    setGradeFilter('ALL');
  };

  // Open Add Marks Modal
  const handleOpenAddModal = () => {
    setEditingMark(null);
    setIsEntryModalOpen(true);
  };

  // Open Edit Marks Modal
  const handleOpenEditModal = (mark) => {
    setEditingMark(mark);
    setIsEntryModalOpen(true);
  };

  // Handle Mark Deletion (Admin only)
  const handleDeleteConfirm = () => {
    if (!deleteConfirmMark) return;
    try {
      setDeleting(true);
      marksService.deleteMark(user, deleteConfirmMark.id);
      toast.success('Academic marks record deleted successfully.');
      setDeleteConfirmMark(null);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete marks record.');
    } finally {
      setDeleting(false);
    }
  };

  // Check if current user has edit permission for a mark record
  const canEditMark = (mark) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.role === 'faculty') {
      const isSubjectAllowed = canEnterSubjectMarks(user, mark.subjectId);
      const isStudentAllowed = canAccessStudentRecord(user, mark.studentId, students);
      return isSubjectAllowed && isStudentAllowed;
    }
    return false;
  };

  // =====================================================================
  // STUDENT VIEW (Personal Academic Transcript & Multi-Semester CGPA)
  // =====================================================================
  if (user?.role === 'student') {
    const studentMarks = marks;
    const gpaSummary = marksService.getStudentGpaSummary(studentMarks);
    const currentSem = gpaSummary.semesters[gpaSummary.semesters.length - 1];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            My Academic Transcript & Performance
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            Comprehensive semester breakdown, credit-weighted SGPA, and cumulative CGPA.
          </p>
        </div>

        {/* Top Summary Cards */}
        <div className="stat-card-grid">
          <StatCard
            title="Cumulative GPA (CGPA)"
            value={gpaSummary.cgpa > 0 ? gpaSummary.cgpa.toFixed(2) : 'N/A'}
            subtitle={`10.0 Scale • ${gpaSummary.semesters.length} Semesters Completed`}
            icon={GraduationCap}
            iconBg="var(--color-primary-light)"
            iconColor="var(--color-primary)"
          />
          <StatCard
            title="Total Earned Credits"
            value={gpaSummary.totalCredits}
            subtitle={`Total Quality Points: ${gpaSummary.totalQualityPoints.toFixed(1)}`}
            icon={Award}
            iconBg="rgba(22, 163, 74, 0.12)"
            iconColor="var(--color-success)"
          />
          <StatCard
            title="Latest Semester SGPA"
            value={currentSem ? currentSem.sgpa.toFixed(2) : 'N/A'}
            subtitle={currentSem ? `Semester ${currentSem.semester} (${currentSem.credits} Credits)` : 'No active records'}
            icon={TrendingUp}
            iconBg="rgba(2, 132, 199, 0.12)"
            iconColor="var(--color-info)"
          />
          <StatCard
            title="Courses Evaluated"
            value={studentMarks.length}
            subtitle={`${studentMarks.filter(m => m.grade !== 'F').length} Passed • ${studentMarks.filter(m => m.grade === 'F').length} Backlogs`}
            icon={BookOpen}
            iconBg="rgba(217, 119, 6, 0.12)"
            iconColor="var(--color-warning)"
          />
        </div>

        {/* Semester-by-Semester Records */}
        {gpaSummary.semesters.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No Marks Records Available"
            description="Your academic performance and evaluation results will appear here once published by your instructors."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {gpaSummary.semesters.map((sem) => (
              <div
                key={sem.semester}
                className="card"
                style={{ padding: '0', overflow: 'hidden' }}
              >
                {/* Semester Header */}
                <div
                  style={{
                    padding: '1.1rem 1.5rem',
                    backgroundColor: 'var(--color-bg-main)',
                    borderBottom: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-primary-light)',
                        color: 'var(--color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800
                      }}
                    >
                      S{sem.semester}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        Semester {sem.semester} Evaluation
                      </h3>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                        {sem.credits} Total Semester Credits • Quality Points: {sem.qualityPoints.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                      Semester SGPA:
                    </span>
                    <span
                      style={{
                        padding: '4px 12px',
                        backgroundColor: 'var(--color-primary)',
                        color: '#ffffff',
                        borderRadius: 'var(--radius-full)',
                        fontWeight: 800,
                        fontSize: '0.95rem'
                      }}
                    >
                      {sem.sgpa.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Subject Grade Table */}
                <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                  <table>
                    <thead>
                      <tr>
                        <th style={{ padding: '0.85rem 1.25rem' }}>Course Code & Name</th>
                        <th style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>Credits</th>
                        <th style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>Assessment Breakdown</th>
                        <th style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>Total / 100</th>
                        <th style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>Grade</th>
                        <th style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sem.marks.map((mark) => (
                        <tr key={mark.id}>
                          <td style={{ padding: '0.85rem 1.25rem' }}>
                            <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '0.92rem' }}>
                              {mark.subjectId} - {mark.subjectName}
                            </div>
                            {mark.facultyRemarks && (
                              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', fontStyle: 'italic', marginTop: '3px' }}>
                                Remarks: "{mark.facultyRemarks}"
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center', fontWeight: 600 }}>
                            {mark.credits}
                          </td>
                          <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center', fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                            Internal: {mark.components?.internal ?? 0} | External: {mark.components?.external ?? 0} | Asg: {mark.components?.assignment ?? 0}
                            {mark.components?.lab > 0 && ` | Lab: ${mark.components.lab}`}
                          </td>
                          <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center', fontWeight: 700 }}>
                            {mark.totalMarks} <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', fontWeight: 400 }}>({mark.percentage}%)</span>
                          </td>
                          <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                            <GradeBadge grade={mark.grade} gradePoint={mark.gradePoint} showPoint={true} size="md" />
                          </td>
                          <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                color: mark.grade !== 'F' ? 'var(--color-success)' : 'var(--color-danger)'
                              }}
                            >
                              {mark.grade !== 'F' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                              {mark.grade !== 'F' ? 'Pass' : 'Fail'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // =====================================================================
  // ADMINISTRATOR & FACULTY VIEW (Management Grid & Evaluation Console)
  // =====================================================================
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header & Main Action */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            Marks & Academic Performance
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '2px' }}>
            {user?.role === 'admin'
              ? 'Institutional academic performance management and evaluation engine.'
              : `Evaluation portal for assigned subjects: ${(user?.assignedSubjects || []).join(', ')}.`}
          </p>
        </div>

        {availableCourses.length > 0 && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleOpenAddModal}
          >
            <Plus size={18} /> Enter Marks
          </button>
        )}
      </div>

      {/* KPI Stat Cards */}
      <div className="stat-card-grid">
        <StatCard
          title="Total Marks Recorded"
          value={stats.totalEntries}
          subtitle="Evaluated subject records"
          icon={BookOpen}
          iconBg="var(--color-primary-light)"
          iconColor="var(--color-primary)"
        />
        <StatCard
          title="Class Average Score"
          value={`${stats.averagePercentage.toFixed(1)}%`}
          subtitle="Mean performance percentage"
          icon={Percent}
          iconBg="rgba(2, 132, 199, 0.12)"
          iconColor="var(--color-info)"
        />
        <StatCard
          title="Overall Pass Rate"
          value={`${stats.passRate.toFixed(1)}%`}
          subtitle={`${stats.passedCount} Passed • ${stats.failedCount} Failed`}
          icon={CheckCircle2}
          iconBg="rgba(22, 163, 74, 0.12)"
          iconColor="var(--color-success)"
        />
        <StatCard
          title="Outstanding (Grade O)"
          value={stats.outstandingCount}
          subtitle="Scores >= 90% (10.0 GP)"
          icon={Award}
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search
              size={18}
              color="var(--color-text-muted)"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Search student name, ID, or course..."
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

          {/* Course Filter */}
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
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
            {availableCourses.map(c => (
              <option key={c.subjectId} value={c.subjectId}>
                {c.subjectId} - {c.subjectName}
              </option>
            ))}
          </select>

          {/* Grade Filter */}
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            style={{
              padding: '0.65rem 0.85rem',
              backgroundColor: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-text-primary)',
              fontSize: '0.88rem'
            }}
          >
            <option value="ALL">All Grades</option>
            <option value="O">Grade O (90-100%)</option>
            <option value="A+">Grade A+ (80-89.9%)</option>
            <option value="A">Grade A (70-79.9%)</option>
            <option value="B+">Grade B+ (60-69.9%)</option>
            <option value="B">Grade B (50-59.9%)</option>
            <option value="C">Grade C (40-49.9%)</option>
            <option value="F">Grade F (&lt;40%)</option>
          </select>
        </div>

        {/* Reset Filter Button */}
        {(searchTerm || semesterFilter !== 'ALL' || courseFilter !== 'ALL' || gradeFilter !== 'ALL') && (
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

      {/* Marks Records Table */}
      {filteredMarks.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No Academic Marks Found"
          description={
            searchTerm || semesterFilter !== 'ALL' || courseFilter !== 'ALL' || gradeFilter !== 'ALL'
              ? 'No marks records match your search and filter criteria.'
              : 'No student marks records have been recorded yet.'
          }
          actionLabel={availableCourses.length > 0 ? 'Enter First Marks' : null}
          onAction={availableCourses.length > 0 ? handleOpenAddModal : null}
        />
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th style={{ padding: '0.85rem 1.25rem' }}>Student Details</th>
                <th style={{ padding: '0.85rem 1rem' }}>Course / Subject</th>
                <th style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>Sem</th>
                <th style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>Breakdown</th>
                <th style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>Total / 100</th>
                <th style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>Grade</th>
                <th style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMarks.map((mark) => {
                const student = students.find(s => s.studentId === mark.studentId);
                const hasEditPermission = canEditMark(mark);

                return (
                  <tr key={mark.id || `${mark.studentId}-${mark.subjectId}`}>
                    {/* Student */}
                    <td style={{ padding: '0.85rem 1.25rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        {student?.fullName || mark.studentId}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', display: 'flex', gap: '6px', alignItems: 'center', marginTop: '2px' }}>
                        <span>{mark.studentId}</span>
                        {student?.classId && <span>• {student.classId}</span>}
                      </div>
                    </td>

                    {/* Subject */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {mark.subjectId} - {mark.subjectName}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                        {mark.credits} Credits • {mark.structureType?.replace('_', ' ')}
                      </div>
                    </td>

                    {/* Semester */}
                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center', fontWeight: 600 }}>
                      S{mark.semester}
                    </td>

                    {/* Breakdown */}
                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center', fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                      Int: {mark.components?.internal ?? 0} | Ext: {mark.components?.external ?? 0} | Asg: {mark.components?.assignment ?? 0}
                      {mark.components?.lab > 0 && ` | Lab: ${mark.components.lab}`}
                    </td>

                    {/* Total / 100 */}
                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center', fontWeight: 700 }}>
                      {mark.totalMarks} <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', fontWeight: 400 }}>({mark.percentage}%)</span>
                    </td>

                    {/* Grade */}
                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                      <GradeBadge grade={mark.grade} gradePoint={mark.gradePoint} showPoint={true} size="md" />
                    </td>

                    {/* Status */}
                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
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
                        {mark.grade !== 'F' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                        {mark.grade !== 'F' ? 'Pass' : 'Fail'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        {/* View Student Transcript Button */}
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          title="View Student Transcript & CGPA"
                          onClick={() => setTranscriptStudent(student || { studentId: mark.studentId, fullName: mark.studentId, department: mark.department, semester: mark.semester })}
                        >
                          <FileText size={14} />
                        </button>

                        {/* Edit Button */}
                        {hasEditPermission && (
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            title="Edit Marks"
                            onClick={() => handleOpenEditModal(mark)}
                          >
                            <Edit2 size={14} />
                          </button>
                        )}

                        {/* Delete Button (Strictly Admin) */}
                        {user?.role === 'admin' && (
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            title="Delete Marks Record"
                            style={{ color: 'var(--color-danger)' }}
                            onClick={() => setDeleteConfirmMark(mark)}
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
            Showing page {currentPage} of {totalPages} ({filteredMarks.length} records)
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

      {/* Marks Entry / Edit Modal */}
      {isEntryModalOpen && (
        <MarksEntryModal
          isOpen={isEntryModalOpen}
          onClose={() => setIsEntryModalOpen(false)}
          onSave={() => loadData()}
          initialMark={editingMark}
          currentUser={user}
          studentList={students}
        />
      )}

      {/* Student Transcript Modal */}
      {transcriptStudent && (
        <StudentTranscriptModal
          isOpen={!!transcriptStudent}
          onClose={() => setTranscriptStudent(null)}
          student={transcriptStudent}
          allMarks={marks}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmMark && (
        <ConfirmDialog
          isOpen={!!deleteConfirmMark}
          onClose={() => setDeleteConfirmMark(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Marks Record"
          message={`Are you sure you want to delete the evaluation record for student "${deleteConfirmMark.studentId}" in course "${deleteConfirmMark.subjectId}"? This action cannot be undone.`}
          confirmText="Delete Record"
          loading={deleting}
        />
      )}
    </div>
  );
};

export default Marks;
