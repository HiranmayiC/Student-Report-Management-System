import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  UserCheck,
  UserPlus,
  Search,
  BookOpen,
  CalendarCheck,
  Edit,
  Trash2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  XCircle,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { facultyService } from '../services/facultyService';
import FacultyFormModal from '../components/faculty/FacultyFormModal';
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

const PAGE_SIZE = 5;

const Faculty = () => {
  const { user, isAdmin } = useAuth();

  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');

  // Sorting State
  const [sortField, setSortField] = useState('fullName');
  const [sortOrder, setSortOrder] = useState('asc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingFaculty, setDeletingFaculty] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Load faculty from facultyService
  const loadFaculty = () => {
    try {
      setLoading(true);
      const data = facultyService.getAll(user);
      setFacultyList(data);
    } catch (err) {
      toast.error(err.message || 'Error loading faculty directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFaculty();

    const handleStorageChange = () => loadFaculty();
    window.addEventListener('srms-storage-change', handleStorageChange);
    return () => window.removeEventListener('srms-storage-change', handleStorageChange);
  }, [user]);

  // Filter & Search logic
  const filteredFaculty = useMemo(() => {
    return facultyList.filter(f => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query ||
        f.fullName.toLowerCase().includes(query) ||
        f.facultyId.toLowerCase().includes(query) ||
        f.email.toLowerCase().includes(query);

      const matchesDept = selectedDept === 'All Departments' || f.department === selectedDept;

      return matchesSearch && matchesDept;
    });
  }, [facultyList, searchQuery, selectedDept]);

  // Sort logic
  const sortedFaculty = useMemo(() => {
    const list = [...filteredFaculty];
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
  }, [filteredFaculty, sortField, sortOrder]);

  // Pagination logic
  const totalPages = Math.ceil(sortedFaculty.length / PAGE_SIZE) || 1;
  const paginatedFaculty = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedFaculty.slice(start, start + PAGE_SIZE);
  }, [sortedFaculty, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedDept]);

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
  };

  const hasActiveFilters = searchQuery || selectedDept !== 'All Departments';

  // CRUD Actions
  const handleOpenCreateModal = () => {
    setEditingFaculty(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (facultyMember) => {
    setEditingFaculty(facultyMember);
    setIsFormModalOpen(true);
  };

  const handleSaveFaculty = async (facultyData) => {
    try {
      if (editingFaculty) {
        facultyService.update(user, editingFaculty.facultyId, facultyData);
        toast.success(`Faculty ${editingFaculty.facultyId} updated successfully.`);
      } else {
        const created = facultyService.create(user, facultyData);
        toast.success(`Faculty ${created.facultyId} appointed successfully.`);
      }
      loadFaculty();
    } catch (err) {
      toast.error(err.message || 'Operation failed.');
      throw err;
    }
  };

  const handleOpenDeleteDialog = (facultyMember) => {
    setDeletingFaculty(facultyMember);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingFaculty) return;
    setActionLoading(true);
    try {
      facultyService.delete(user, deletingFaculty.facultyId);
      toast.success(`Faculty ${deletingFaculty.facultyId} removed from roster.`);
      setIsDeleteDialogOpen(false);
      setDeletingFaculty(null);
      loadFaculty();
    } catch (err) {
      toast.error(err.message || 'Failed to remove faculty member.');
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
            Faculty & Department Leadership
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '2px' }}>
            Academic faculty directory, department allocations, and teaching course assignments
          </p>
        </div>

        {isAdmin && (
          <button className="btn btn-primary" onClick={handleOpenCreateModal}>
            <UserPlus size={18} /> Appoint Faculty
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
          alignItems: 'center'
        }}>
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search size={16} className="search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search faculty name, ID, or email..."
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
        </div>

        {/* Filter Summary */}
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
            <span>Found <strong>{filteredFaculty.length}</strong> matching faculty members</span>
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
              <XCircle size={14} /> Clear Filter
            </button>
          </div>
        )}
      </div>

      {/* Faculty Directory Table Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th onClick={() => toggleSort('facultyId')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Faculty ID <ArrowUpDown size={14} />
                  </div>
                </th>
                <th onClick={() => toggleSort('fullName')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Faculty Member <ArrowUpDown size={14} />
                  </div>
                </th>
                <th onClick={() => toggleSort('department')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Department <ArrowUpDown size={14} />
                  </div>
                </th>
                <th>Designation</th>
                <th>Assigned Subjects</th>
                <th>Assigned Classes</th>
                {isAdmin && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {paginatedFaculty.length > 0 ? (
                paginatedFaculty.map(member => (
                  <tr key={member.facultyId}>
                    {/* Faculty ID */}
                    <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                      {member.facultyId}
                    </td>

                    {/* Avatar & Name */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={member.avatar}
                          alt={member.fullName}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: 'var(--color-primary-light)'
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                            {member.fullName}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            {member.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td>
                      <span className="badge badge-info">{member.department}</span>
                    </td>

                    {/* Designation */}
                    <td style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                      {member.designation}
                    </td>

                    {/* Assigned Subjects */}
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '180px' }}>
                        {member.assignedSubjects && member.assignedSubjects.length > 0 ? (
                          member.assignedSubjects.map(sub => (
                            <span key={sub} className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                              {sub}
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>None</span>
                        )}
                      </div>
                    </td>

                    {/* Assigned Classes */}
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '220px' }}>
                        {member.assignedClasses && member.assignedClasses.length > 0 ? (
                          member.assignedClasses.map(cls => (
                            <span
                              key={cls}
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                padding: '2px 6px',
                                backgroundColor: 'var(--color-bg-main)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-sm)',
                                color: 'var(--color-text-secondary)'
                              }}
                            >
                              {cls}
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>None</span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    {isAdmin && (
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleOpenEditModal(member)}
                            title="Edit Faculty & Assignments"
                          >
                            <Edit size={14} /> Edit
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleOpenDeleteDialog(member)}
                            style={{ color: 'var(--color-danger)' }}
                            title="Remove Faculty Member"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} style={{ padding: 0 }}>
                    <EmptyState
                      icon={UserCheck}
                      title="No Faculty Found"
                      description={
                        hasActiveFilters
                          ? 'No faculty members match your active search and department filter.'
                          : 'No faculty members are currently registered in this department.'
                      }
                      actionLabel={hasActiveFilters ? 'Clear Filter' : (isAdmin ? 'Appoint First Faculty' : undefined)}
                      onAction={hasActiveFilters ? handleClearFilters : (isAdmin ? handleOpenCreateModal : undefined)}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {sortedFaculty.length > 0 && (
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
              <strong>{Math.min(currentPage * PAGE_SIZE, sortedFaculty.length)}</strong> of{' '}
              <strong>{sortedFaculty.length}</strong> faculty members
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

      {/* Add / Edit Faculty Modal */}
      {isFormModalOpen && (
        <FacultyFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSave={handleSaveFaculty}
          faculty={editingFaculty}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && deletingFaculty && (
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Remove Faculty Member"
          message={`Are you sure you want to remove "${deletingFaculty.fullName}" (${deletingFaculty.facultyId}) from the academic faculty? Their assigned subject and class allocations will be unlinked.`}
          confirmText="Yes, Remove Faculty"
          loading={actionLoading}
        />
      )}
    </div>
  );
};

export default Faculty;
