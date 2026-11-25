import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { COURSE_CATALOG, AVAILABLE_CLASSES } from '../../services/storageService.js';
import { toast } from 'react-toastify';

const departmentsList = [
  'Computer Science',
  'Information Technology',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering'
];

const designationsList = [
  'Professor & Chair',
  'Professor',
  'Associate Professor',
  'Assistant Professor',
  'Senior Lecturer',
  'Lecturer'
];

const FacultyFormModal = ({ isOpen, onClose, onSave, faculty = null }) => {
  const isEditing = !!faculty;

  const initialForm = {
    facultyId: '',
    fullName: '',
    email: '',
    phone: '',
    department: 'Computer Science',
    designation: 'Associate Professor',
    assignedSubjects: [],
    assignedClasses: [],
    joiningDate: new Date().toISOString().split('T')[0]
  };

  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (faculty) {
      setFormData({
        facultyId: faculty.facultyId || '',
        fullName: faculty.fullName || '',
        email: faculty.email || '',
        phone: faculty.phone || '',
        department: faculty.department || 'Computer Science',
        designation: faculty.designation || 'Associate Professor',
        assignedSubjects: Array.isArray(faculty.assignedSubjects) ? faculty.assignedSubjects : [],
        assignedClasses: Array.isArray(faculty.assignedClasses) ? faculty.assignedClasses : [],
        joiningDate: faculty.joiningDate || new Date().toISOString().split('T')[0]
      });
    } else {
      setFormData(initialForm);
    }
    setErrors({});
  }, [faculty, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const toggleSubject = (subjectId) => {
    setFormData(prev => {
      const exists = prev.assignedSubjects.includes(subjectId);
      const updated = exists
        ? prev.assignedSubjects.filter(id => id !== subjectId)
        : [...prev.assignedSubjects, subjectId];
      return { ...prev, assignedSubjects: updated };
    });
  };

  const toggleClass = (classId) => {
    setFormData(prev => {
      const exists = prev.assignedClasses.includes(classId);
      const updated = exists
        ? prev.assignedClasses.filter(id => id !== classId)
        : [...prev.assignedClasses, classId];
      return { ...prev, assignedClasses: updated };
    });
  };

  const validate = () => {
    const errs = {};
    if (!formData.facultyId.trim()) errs.facultyId = 'Faculty ID is required';
    if (!formData.fullName.trim()) errs.fullName = 'Full Name is required';
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please provide a valid institutional email';
    }
    if (!formData.phone.trim()) errs.phone = 'Phone number is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Error saving faculty record.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Faculty: ${faculty.facultyId}` : 'Appoint New Faculty Member'}
      subtitle={isEditing ? 'Update faculty assignments, department allocations & permissions' : 'Register a faculty profile in the university portal'}
      maxWidth="760px"
    >
      <form onSubmit={handleSubmit}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem',
          marginBottom: '1.25rem'
        }}>
          {/* Faculty ID */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>
              Faculty ID *
            </label>
            <input
              type="text"
              name="facultyId"
              value={formData.facultyId}
              onChange={handleChange}
              disabled={isEditing}
              placeholder="e.g. FAC-105"
              style={{ width: '100%', backgroundColor: isEditing ? 'var(--color-bg-main)' : undefined }}
            />
            {errors.facultyId && <span className="text-danger" style={{ fontSize: '0.74rem' }}>{errors.facultyId}</span>}
          </div>

          {/* Full Name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>
              Full Name *
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="e.g. Prof. Claude Shannon"
              style={{ width: '100%' }}
            />
            {errors.fullName && <span className="text-danger" style={{ fontSize: '0.74rem' }}>{errors.fullName}</span>}
          </div>

          {/* Email */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>
              Institutional Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. cshannon@apex.edu"
              style={{ width: '100%' }}
            />
            {errors.email && <span className="text-danger" style={{ fontSize: '0.74rem' }}>{errors.email}</span>}
          </div>

          {/* Phone */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>
              Phone Number *
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
              style={{ width: '100%' }}
            />
            {errors.phone && <span className="text-danger" style={{ fontSize: '0.74rem' }}>{errors.phone}</span>}
          </div>

          {/* Department */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>
              Department Allocation *
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              style={{ width: '100%' }}
            >
              {departmentsList.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Designation */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>
              Academic Designation *
            </label>
            <select
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              style={{ width: '100%' }}
            >
              {designationsList.map(des => (
                <option key={des} value={des}>{des}</option>
              ))}
            </select>
          </div>

          {/* Joining Date */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>
              Appointment / Joining Date
            </label>
            <input
              type="date"
              name="joiningDate"
              value={formData.joiningDate}
              onChange={handleChange}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* Course / Subject Allocation Multi-Select */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--color-text-primary)' }}>
            Assigned Subjects (Marks & Evaluation Permission)
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '0.5rem',
            maxHeight: '150px',
            overflowY: 'auto',
            padding: '0.75rem',
            backgroundColor: 'var(--color-bg-main)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)'
          }}>
            {COURSE_CATALOG.map(course => {
              const isChecked = formData.assignedSubjects.includes(course.subjectId);
              return (
                <label
                  key={course.subjectId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleSubject(course.subjectId)}
                  />
                  <span>
                    <strong>{course.subjectId}</strong>: {course.subjectName}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Class & Section Allocation Multi-Select */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--color-text-primary)' }}>
            Assigned Classes & Sections (Attendance & Student Roster Access)
          </label>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            padding: '0.75rem',
            backgroundColor: 'var(--color-bg-main)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)'
          }}>
            {AVAILABLE_CLASSES.map(cls => {
              const isChecked = formData.assignedClasses.includes(cls);
              return (
                <button
                  key={cls}
                  type="button"
                  onClick={() => toggleClass(cls)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem',
                    fontWeight: isChecked ? 700 : 500,
                    backgroundColor: isChecked ? 'var(--color-primary)' : 'var(--color-bg-card)',
                    color: isChecked ? '#ffffff' : 'var(--color-text-primary)',
                    border: `1px solid ${isChecked ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    cursor: 'pointer',
                    transition: 'all var(--transition-speed)'
                  }}
                >
                  {isChecked ? '✓ ' : '+ '}{cls}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
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
            disabled={submitting}
          >
            {submitting ? 'Saving...' : (isEditing ? 'Save Assignments & Update' : 'Appoint Faculty')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default FacultyFormModal;

