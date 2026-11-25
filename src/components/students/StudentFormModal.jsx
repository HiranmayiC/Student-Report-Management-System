import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { toast } from 'react-toastify';

const departmentsList = [
  'Computer Science',
  'Information Technology',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering'
];

const academicYears = ['2024-2025', '2023-2024', '2022-2023'];
const semesters = [1, 2, 3, 4, 5, 6, 7, 8];
const sections = ['A', 'B', 'C'];

const StudentFormModal = ({ isOpen, onClose, onSave, student = null }) => {
  const isEditing = !!student;

  const initialForm = {
    studentId: '',
    fullName: '',
    email: '',
    phone: '',
    department: 'Computer Science',
    academicYear: '2024-2025',
    semester: 4,
    section: 'A',
    dateOfBirth: '',
    admissionDate: new Date().toISOString().split('T')[0],
    address: '',
    guardianName: '',
    guardianContact: ''
  };

  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (student) {
      setFormData({
        studentId: student.studentId || '',
        fullName: student.fullName || '',
        email: student.email || '',
        phone: student.phone || '',
        department: student.department || 'Computer Science',
        academicYear: student.academicYear || '2024-2025',
        semester: student.semester || 4,
        section: student.section || 'A',
        dateOfBirth: student.dateOfBirth || '',
        admissionDate: student.admissionDate || '',
        address: student.address || '',
        guardianName: student.guardianName || '',
        guardianContact: student.guardianContact || ''
      });
    } else {
      setFormData(initialForm);
    }
    setErrors({});
  }, [student, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.studentId.trim()) errs.studentId = 'Student ID is required';
    if (!formData.fullName.trim()) errs.fullName = 'Full Name is required';
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please provide a valid email format';
    }
    if (!formData.phone.trim()) errs.phone = 'Phone number is required';
    if (!formData.guardianName.trim()) errs.guardianName = 'Guardian name is required';
    if (!formData.guardianContact.trim()) errs.guardianContact = 'Guardian contact is required';

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
      toast.error(err.message || 'Error saving student record.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Student: ${student.studentId}` : 'Enroll New Student'}
      subtitle={isEditing ? 'Update student demographic and academic records' : 'Register a new student in the university portal'}
      maxWidth="720px"
    >
      <form onSubmit={handleSubmit}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem',
          marginBottom: '1.25rem'
        }}>
          {/* Student ID */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>
              Student ID *
            </label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              disabled={isEditing}
              placeholder="e.g. STU-2024-009"
              style={{ width: '100%', backgroundColor: isEditing ? 'var(--color-bg-main)' : undefined }}
            />
            {errors.studentId && <span className="text-danger" style={{ fontSize: '0.74rem' }}>{errors.studentId}</span>}
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
              placeholder="e.g. Grace Brewster Hopper"
              style={{ width: '100%' }}
            />
            {errors.fullName && <span className="text-danger" style={{ fontSize: '0.74rem' }}>{errors.fullName}</span>}
          </div>

          {/* Email */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>
              Official Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. ghopper@apex.edu"
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
              Academic Department *
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

          {/* Academic Year */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>
              Academic Year *
            </label>
            <select
              name="academicYear"
              value={formData.academicYear}
              onChange={handleChange}
              style={{ width: '100%' }}
            >
              {academicYears.map(yr => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
          </div>

          {/* Semester & Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>
                Semester *
              </label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                style={{ width: '100%' }}
              >
                {semesters.map(s => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>
                Section *
              </label>
              <select
                name="section"
                value={formData.section}
                onChange={handleChange}
                style={{ width: '100%' }}
              >
                {sections.map(sec => (
                  <option key={sec} value={sec}>Section {sec}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date of Birth */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>
              Date of Birth
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              style={{ width: '100%' }}
            />
          </div>

          {/* Guardian Name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>
              Guardian Name *
            </label>
            <input
              type="text"
              name="guardianName"
              value={formData.guardianName}
              onChange={handleChange}
              placeholder="e.g. Walter Hopper"
              style={{ width: '100%' }}
            />
            {errors.guardianName && <span className="text-danger" style={{ fontSize: '0.74rem' }}>{errors.guardianName}</span>}
          </div>

          {/* Guardian Contact */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>
              Guardian Contact *
            </label>
            <input
              type="text"
              name="guardianContact"
              value={formData.guardianContact}
              onChange={handleChange}
              placeholder="+1 (555) 999-8888"
              style={{ width: '100%' }}
            />
            {errors.guardianContact && <span className="text-danger" style={{ fontSize: '0.74rem' }}>{errors.guardianContact}</span>}
          </div>
        </div>

        {/* Address */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>
            Residential Address
          </label>
          <textarea
            name="address"
            rows={2}
            value={formData.address}
            onChange={handleChange}
            placeholder="Street address, City, State, Zip Code"
            style={{ width: '100%' }}
          />
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
            {submitting ? 'Saving...' : (isEditing ? 'Update Student Record' : 'Enroll Student')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default StudentFormModal;

