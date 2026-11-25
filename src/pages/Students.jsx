import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  XCircle,
  Eye,
  Edit,
  Trash2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { studentService } from '../services/studentService';
import StudentFormModal from '../components/students/StudentFormModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import { toast } from 'react-toastify';

const departmentsList = [
  'All Departments',
  'Computer Science',
  'Information Technology',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering'
];

const academicYearsList = ['All Years', '2024-2025', '2023-2024', '2022-2023'];
const semestersList = ['All Semesters', '1', '2', '3', '4', '5', '6', '7', '8'];
const sectionsList = ['All Sections', 'A', 'B', 'C'];

const PAGE_SIZE = 5;

const Students = () => {
  const { user, isAdmin, isFaculty } = useAuth();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedYear, setSelectedYear] = useState('All Years');
  const [selectedSem, setSelectedSem] = useState('All Semesters');
  const [selectedSection, setSelectedSection] = useState('All Sections');

  // Sorting State
  const [sortField, setSortField] = useState('fullName');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Load students from studentService
  const loadStudents = () => {
    try {
      setLoading(true);
      const data = studentService.getAll(user);
      setStudents(data);
    } catch (err) {
      toast.error(err.message || 'Error loading student directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();

    // Listen to storage changes for reactive state sync
    const handleStorageChange = () => loadStudents();
    window.addEventListener('srms-storage-change', handleStorageChange);
    return () => window.removeEventListener('srms-storage-change', handleStorageChange);
  }, [user]);

  // Handle Search and Filter logic
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      // Search by Name or Student ID
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query ||
        student.fullName.toLowerCase().includes(query) ||
        student.studentId.toLowerCase().includes(query);

      // Department Filter
      const matchesDept = selectedDept === 'All Departments' || student.department === selectedDept;

      // Academic Year Filter
      const matchesYear = selectedYear === 'All Years' || student.academicYear === selectedYear;

      // Semester Filter
      const matchesSem = selectedSem === 'All Semesters' || String(student.semester) === selectedSem;

      // Section Filter
      const matchesSection = selectedSection === 'All Sections' || student.section === selectedSection;

      return matchesSearch && matchesDept && matchesYear && matchesSem && matchesSection;
    });
  }, [students, searchQuery, selectedDept, selectedYear, selectedSem, selectedSection]);

  // Handle Sorting logic
  const sortedStudents = useMemo(() => {
    const list = [...filteredStudents];
    list.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = (bVal || '').toLowerCase();
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [filteredStudents, sortField, sortOrder]);

  // Handle Pagination
  const totalPages = Math.ceil(sortedStudents.length / PAGE_SIZE) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedStudents.slice(start, start + PAGE_SIZE);
  }, [sortedStudents, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedDept, selectedYear, selectedSem, selectedSection]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedDept('All Departments');
    setSelectedYear('All Years');
    setSelectedSem('All Semesters');
    setSelectedSection('All Sections');
  };

  const hasActiveFilters = searchQuery ||
    selectedDept !== 'All Departments' ||
    selectedYear !== 'All Years' ||
    selectedSem !== 'All Semesters' ||
    selectedSection !== 'All Sections';

  // CRUD Actions
  const handleOpenCreateModal = () => {
    setEditingStudent(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (student) => {
    setEditingStudent(student);
    setIsFormModalOpen(true);
  };

  const handleSaveStudent = async (studentData) => {
    try {
      if (editingStudent) {
        studentService.update(user, editingStudent.studentId, studentData);
        toast.success(`Student ${editingStudent.studentId} updated successfully.`);
      } else {
        const created = studentService.create(user, studentData);
        toast.success(`Student ${created.studentId} enrolled successfully.`);
      }
      loadStudents();
    } catch (err) {
      toast.error(err.message || 'Operation failed.');
      throw err;
    }
  };

  const handleOpenDeleteDialog = (student) => {
    setDeletingStudent(student);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingStudent) return;
    setActionLoading(true);
    try {
      studentService.delete(user, deletingStudent.studentId);
      toast.success(`Student ${deletingStudent.studentId} deleted successfully.`);
      setIsDeleteDialogOpen(false);
      setDeletingStudent(null);
      loadStudents();
    } catch (err) {
      toast.error(err.message || 'Failed to delete student.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      {/* Page Header */}
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
            {isFaculty ? 'Assigned Student Roster' : 'Student Management Directory'}
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '2px' }}>
            {isFaculty
              ? `Displaying enrolled students in your assigned classes (${(user?.assignedClasses || []).join(', ')})`
              : 'Institutional database of all enrolled undergraduate & graduate students'}
          </p>
        </div>

        {isAdmin && (
          <button className="btn btn-primary" onClick={handleOpenCreateModal}>
            <UserPlus size={18} /> Enroll New Student
          </button>
        )}
      </div>

      {/* Faculty Read-Only Notice */}
      {isFaculty && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.75rem 1rem',
          backgroundColor: 'var(--color-primary-light)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-primary-text)',
          fontSize: '0.84rem',
          marginBottom: '1.25rem'
        }}>
          <GraduationCap size={20} style={{ flexShrink: 0 }} />
          <span>
            <strong>Faculty Scope Active:</strong> You are granted read access to view profiles of students in your assigned classes. Enrollment, record modification, and deletion are restricted to Academic Administrators.
          </span>
        </div>
      )}

      {/* Search & Multi-Parameter Filter Card */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.85rem',
          alignItems: 'center'
        }}>
          {/* Search Box */}
          <div style={{ position: 'relative', gridColumn: 'span 2' }}>
            <Search size={16} className="search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name or student ID..."
              style={{ width: '100%', paddingLeft: '36px', height: '38px' }}
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              style={{ width: '100%', height: '38px' }}
            >
              {departmentsList.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Semester Filter */}
          <div>
            <select
              value={selectedSem}
              onChange={(e) => setSelectedSem(e.target.value)}
              style={{ width: '100%', height: '38px' }}
            >
              {semestersList.map(sem => (
                <option key={sem} value={sem}>
                  {sem === 'All Semesters' ? 'All Semesters' : `Semester ${sem}`}
                </option>
              ))}
            </select>
          </div>

          {/* Section Filter */}
          <div>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              style={{ width: '100%', height: '38px' }}
            >
              {sectionsList.map(sec => (
                <option key={sec} value={sec}>
                  {sec === 'All Sections' ? 'All Sections' : `Section ${sec}`}
                </option>
              ))}
            </select>
          </div>

          {/* Academic Year Filter */}
          <div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              style={{ width: '100%', height: '38px' }}
            >
              {academicYearsList.map(yr => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Summary & Clear Action */}
        {hasActiveFilters && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '1rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--color-border)',
            fontSize: '0.82rem',
            color: 'var(--color-text-secondary)'
          }}>
            <span>
              Found <strong>{filteredStudents.length}</strong> matching records
            </span>
            <button
              onClick={handleClearFilters}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: 'var(--color-accent)',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <XCircle size={14} /> Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Student Directory Table Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th onClick={() => toggleSort('studentId')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Student ID <ArrowUpDown size={14} />
                  </div>
                </th>
                <th onClick={() => toggleSort('fullName')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Student Name <ArrowUpDown size={14} />
                  </div>
                </th>
                <th onClick={() => toggleSort('department')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Department <ArrowUpDown size={14} />
                  </div>
                </th>
                <th onClick={() => toggleSort('semester')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Sem & Section <ArrowUpDown size={14} />
                  </div>
                </th>
                <th>Class ID</th>
                <th>Contact</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedStudents.length > 0 ? (
                paginatedStudents.map(student => (
                  <tr key={student.studentId}>
                    {/* Student ID */}
                    <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                      {student.studentId}
                    </td>

                    {/* Avatar & Name */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={student.avatar}
                          alt={student.fullName}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: 'var(--color-primary-light)'
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                            {student.fullName}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            {student.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td>
                      <span className="badge badge-info">{student.department}</span>
                    </td>

                    {/* Semester & Section */}
                    <td style={{ fontWeight: 500 }}>
                      Sem {student.semester} - Sec {student.section}
                    </td>

                    {/* Class ID */}
                    <td>
                      <span style={{
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: 'var(--color-text-secondary)',
                        backgroundColor: 'var(--color-bg-main)',
                        padding: '2px 6px',
                        borderRadius: 'var(--radius-sm)'
                      }}>
                        {student.classId || `${student.department}-Sem${student.semester}`}
                      </span>
                    </td>

                    {/* Phone */}
                    <td style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                      {student.phone}
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        {/* View Profile Action */}
                        <Link
                          to={`/students/${student.studentId}`}
                          className="btn btn-secondary btn-sm"
                          title="View Profile Details"
                        >
                          <Eye size={14} /> View
                        </Link>

                        {/* Admin Only Actions: Edit & Delete */}
                        {isAdmin && (
                          <>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleOpenEditModal(student)}
                              title="Edit Student Record"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleOpenDeleteDialog(student)}
                              style={{ color: 'var(--color-danger)' }}
                              title="Delete Student Record"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ padding: 0 }}>
                    <EmptyState
                      icon={Users}
                      title="No Students Found"
                      description={
                        hasActiveFilters
                          ? 'No student records match your current search and filter criteria. Try clearing filters.'
                          : 'No student records are currently enrolled in this department roster.'
                      }
                      actionLabel={hasActiveFilters ? 'Clear Filters' : (isAdmin ? 'Enroll First Student' : undefined)}
                      onAction={hasActiveFilters ? handleClearFilters : (isAdmin ? handleOpenCreateModal : undefined)}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {sortedStudents.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--color-border)',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.85rem',
            color: 'var(--color-text-secondary)'
          }}>
            <div>
              Showing <strong>{((currentPage - 1) * PAGE_SIZE) + 1}</strong> to{' '}
              <strong>{Math.min(currentPage * PAGE_SIZE, sortedStudents.length)}</strong> of{' '}
              <strong>{sortedStudents.length}</strong> students
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} /> Previous
              </button>

              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(pageNum => (
                <button
                  key={pageNum}
                  className={`btn btn-sm ${currentPage === pageNum ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setCurrentPage(pageNum)}
                  style={{ minWidth: '32px' }}
                >
                  {pageNum}
                </button>
              ))}

              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Student Modal */}
      {isFormModalOpen && (
        <StudentFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSave={handleSaveStudent}
          student={editingStudent}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && deletingStudent && (
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Student Record"
          message={`Are you sure you want to permanently delete student "${deletingStudent.fullName}" (${deletingStudent.studentId})? All associated academic marks and attendance logs will be lost.`}
          confirmText="Yes, Delete Record"
          loading={actionLoading}
        />
      )}
    </div>
  );
};

export default Students;
