import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../common/Modal';
import GradeBadge from './GradeBadge';
import { marksService } from '../../services/marksService.js';
import { COURSE_CATALOG } from '../../services/storageService.js';
import {
  ASSESSMENT_STRUCTURES,
  validateComponentMarks,
  calculateAssessmentResults
} from '../../utils/calculations.js';
import { toast } from 'react-toastify';
import { Award, BookOpen, User, CheckCircle2, AlertCircle } from 'lucide-react';

const MarksEntryModal = ({
  isOpen,
  onClose,
  onSave,
  initialMark = null,
  currentUser,
  studentList = []
}) => {
  const isEditing = !!initialMark;

  // Available courses authorized for the current user
  const availableCourses = useMemo(() => {
    return marksService.getAvailableCoursesForUser(currentUser);
  }, [currentUser]);

  // Initial form state
  const [formData, setFormData] = useState({
    studentId: '',
    subjectId: '',
    semester: 4,
    components: {
      internal: '',
      external: '',
      assignment: '',
      lab: ''
    },
    facultyRemarks: ''
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Determine current active course and structure
  const selectedCourse = useMemo(() => {
    if (!formData.subjectId) return null;
    return COURSE_CATALOG.find(c => c.subjectId === formData.subjectId) || null;
  }, [formData.subjectId]);

  const structureType = selectedCourse?.structureType || 'THEORY_LAB';
  const structure = ASSESSMENT_STRUCTURES[structureType] || ASSESSMENT_STRUCTURES.THEORY_LAB;

  // Sync form when initialMark or modal visibility changes
  useEffect(() => {
    if (initialMark) {
      setFormData({
        studentId: initialMark.studentId || '',
        subjectId: initialMark.subjectId || '',
        semester: initialMark.semester || 4,
        components: {
          internal: initialMark.components?.internal ?? '',
          external: initialMark.components?.external ?? '',
          assignment: initialMark.components?.assignment ?? '',
          lab: initialMark.components?.lab ?? ''
        },
        facultyRemarks: initialMark.facultyRemarks || ''
      });
    } else {
      const defaultCourse = availableCourses.length > 0 ? availableCourses[0].subjectId : '';
      const defaultStudent = studentList.length > 0 ? studentList[0].studentId : '';
      const courseObj = COURSE_CATALOG.find(c => c.subjectId === defaultCourse);

      setFormData({
        studentId: defaultStudent,
        subjectId: defaultCourse,
        semester: courseObj?.semester || 4,
        components: {
          internal: '',
          external: '',
          assignment: '',
          lab: ''
        },
        facultyRemarks: ''
      });
    }
    setErrors({});
  }, [initialMark, isOpen, availableCourses, studentList]);

  // Handle subject change and adjust default semester
  const handleSubjectChange = (e) => {
    const subjectId = e.target.value;
    const course = COURSE_CATALOG.find(c => c.subjectId === subjectId);
    setFormData(prev => ({
      ...prev,
      subjectId,
      semester: course?.semester || prev.semester,
      components: {
        internal: '',
        external: '',
        assignment: '',
        lab: ''
      }
    }));
    setErrors({});
  };

  // Handle component mark input
  const handleComponentChange = (componentKey, value) => {
    setFormData(prev => ({
      ...prev,
      components: {
        ...prev.components,
        [componentKey]: value
      }
    }));

    if (errors[componentKey]) {
      setErrors(prev => ({ ...prev, [componentKey]: null }));
    }
  };

  // Live calculation of results
  const liveResults = useMemo(() => {
    const internalVal = formData.components.internal !== '' ? Number(formData.components.internal) : null;
    const externalVal = formData.components.external !== '' ? Number(formData.components.external) : null;
    const assignmentVal = formData.components.assignment !== '' ? Number(formData.components.assignment) : null;
    const labVal = (structure.components.lab.max > 0 && formData.components.lab !== '')
      ? Number(formData.components.lab)
      : 0;

    // If all required components are entered and valid
    const hasValues = internalVal !== null || externalVal !== null || assignmentVal !== null;
    if (!hasValues) {
      return null;
    }

    return calculateAssessmentResults(
      {
        internal: internalVal || 0,
        external: externalVal || 0,
        assignment: assignmentVal || 0,
        lab: labVal || 0
      },
      structureType
    );
  }, [formData.components, structure, structureType]);

  // Form submission validation & execution
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    if (!formData.studentId) {
      setErrors(prev => ({ ...prev, studentId: 'Please select a student' }));
      return;
    }

    if (!formData.subjectId) {
      setErrors(prev => ({ ...prev, subjectId: 'Please select a course' }));
      return;
    }

    // Validate component boundaries
    const validation = validateComponentMarks(formData.components, structureType);
    if (!validation.isValid) {
      setErrors(validation.errors);
      toast.error('Please correct the highlighted component boundaries.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        studentId: formData.studentId,
        subjectId: formData.subjectId,
        semester: Number(formData.semester),
        components: {
          internal: Number(formData.components.internal),
          external: Number(formData.components.external),
          assignment: Number(formData.components.assignment),
          lab: structure.components.lab.max > 0 ? Number(formData.components.lab) : 0
        },
        facultyRemarks: formData.facultyRemarks
      };

      const saved = marksService.saveMark(currentUser, payload);
      toast.success(isEditing ? 'Marks updated successfully!' : 'Marks entered and recorded successfully!');
      if (onSave) onSave(saved);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save marks record.');
      setErrors(prev => ({ ...prev, form: err.message }));
    } finally {
      setSubmitting(false);
    }
  };

  // Find target student details
  const currentStudent = studentList.find(s => s.studentId === formData.studentId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Update Academic Marks' : 'Enter Academic Marks'}
      subtitle={
        isEditing
          ? `Editing evaluation record for ${formData.studentId} - ${formData.subjectId}`
          : 'Record component assessments and compute automated grade points'
      }
      maxWidth="720px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Student & Course Selectors */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {/* Student Field */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.4rem' }}>
              Student <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            {isEditing ? (
              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  backgroundColor: 'var(--color-bg-main)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <User size={16} color="var(--color-primary)" />
                <span>{currentStudent?.fullName || formData.studentId} ({formData.studentId})</span>
              </div>
            ) : (
              <select
                value={formData.studentId}
                onChange={(e) => setFormData(prev => ({ ...prev, studentId: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  backgroundColor: 'var(--color-bg-card)',
                  border: `1px solid ${errors.studentId ? 'var(--color-danger)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.88rem'
                }}
              >
                {studentList.map(s => (
                  <option key={s.studentId} value={s.studentId}>
                    {s.studentId} - {s.fullName} ({s.department}, Sem {s.semester}-{s.section})
                  </option>
                ))}
              </select>
            )}
            {errors.studentId && (
              <span style={{ fontSize: '0.75rem', color: 'var(--color-danger)', marginTop: '3px', display: 'block' }}>
                {errors.studentId}
              </span>
            )}
          </div>

          {/* Course / Subject Field */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.4rem' }}>
              Course / Subject <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            {isEditing ? (
              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  backgroundColor: 'var(--color-bg-main)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <BookOpen size={16} color="var(--color-primary)" />
                <span>{selectedCourse?.subjectName || formData.subjectId} ({formData.subjectId})</span>
              </div>
            ) : (
              <select
                value={formData.subjectId}
                onChange={handleSubjectChange}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  backgroundColor: 'var(--color-bg-card)',
                  border: `1px solid ${errors.subjectId ? 'var(--color-danger)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.88rem'
                }}
              >
                {availableCourses.map(c => (
                  <option key={c.subjectId} value={c.subjectId}>
                    {c.subjectId} - {c.subjectName} ({c.credits} Credits | Sem {c.semester})
                  </option>
                ))}
              </select>
            )}
            {errors.subjectId && (
              <span style={{ fontSize: '0.75rem', color: 'var(--color-danger)', marginTop: '3px', display: 'block' }}>
                {errors.subjectId}
              </span>
            )}
          </div>
        </div>

        {/* Course Assessment Structure Metadata Card */}
        {selectedCourse && (
          <div
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: 'var(--color-primary-light)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(30, 58, 138, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={18} color="var(--color-primary)" />
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-primary-text)' }}>
                  {structure.label}
                </span>
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                {selectedCourse.credits} Credits • Total Max: {structure.totalMax} Marks
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              <span>• Internal: <strong>Max {structure.components.internal.max}</strong></span>
              <span>• External Exam: <strong>Max {structure.components.external.max}</strong></span>
              <span>• Assignment: <strong>Max {structure.components.assignment.max}</strong></span>
              {structure.components.lab.max > 0 && (
                <span>• Lab Practical: <strong>Max {structure.components.lab.max}</strong></span>
              )}
            </div>
          </div>
        )}

        {/* Component Input Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
          {/* Internal Assessment */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.4rem' }}>
              {structure.components.internal.label}
              <span style={{ color: 'var(--color-primary)', marginLeft: '4px' }}>(Max {structure.components.internal.max})</span>
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              max={structure.components.internal.max}
              value={formData.components.internal}
              onChange={(e) => handleComponentChange('internal', e.target.value)}
              placeholder={`0 - ${structure.components.internal.max}`}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                backgroundColor: 'var(--color-bg-card)',
                border: `1px solid ${errors.internal ? 'var(--color-danger)' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text-primary)',
                fontSize: '0.88rem'
              }}
            />
            {errors.internal && (
              <span style={{ fontSize: '0.72rem', color: 'var(--color-danger)', marginTop: '2px', display: 'block' }}>
                {errors.internal}
              </span>
            )}
          </div>

          {/* External Examination */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.4rem' }}>
              {structure.components.external.label}
              <span style={{ color: 'var(--color-primary)', marginLeft: '4px' }}>(Max {structure.components.external.max})</span>
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              max={structure.components.external.max}
              value={formData.components.external}
              onChange={(e) => handleComponentChange('external', e.target.value)}
              placeholder={`0 - ${structure.components.external.max}`}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                backgroundColor: 'var(--color-bg-card)',
                border: `1px solid ${errors.external ? 'var(--color-danger)' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text-primary)',
                fontSize: '0.88rem'
              }}
            />
            {errors.external && (
              <span style={{ fontSize: '0.72rem', color: 'var(--color-danger)', marginTop: '2px', display: 'block' }}>
                {errors.external}
              </span>
            )}
          </div>

          {/* Assignment / Record */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.4rem' }}>
              {structure.components.assignment.label}
              <span style={{ color: 'var(--color-primary)', marginLeft: '4px' }}>(Max {structure.components.assignment.max})</span>
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              max={structure.components.assignment.max}
              value={formData.components.assignment}
              onChange={(e) => handleComponentChange('assignment', e.target.value)}
              placeholder={`0 - ${structure.components.assignment.max}`}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                backgroundColor: 'var(--color-bg-card)',
                border: `1px solid ${errors.assignment ? 'var(--color-danger)' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text-primary)',
                fontSize: '0.88rem'
              }}
            />
            {errors.assignment && (
              <span style={{ fontSize: '0.72rem', color: 'var(--color-danger)', marginTop: '2px', display: 'block' }}>
                {errors.assignment}
              </span>
            )}
          </div>

          {/* Laboratory / Practical (if applicable) */}
          {structure.components.lab.max > 0 && (
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.4rem' }}>
                {structure.components.lab.label}
                <span style={{ color: 'var(--color-primary)', marginLeft: '4px' }}>(Max {structure.components.lab.max})</span>
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max={structure.components.lab.max}
                value={formData.components.lab}
                onChange={(e) => handleComponentChange('lab', e.target.value)}
                placeholder={`0 - ${structure.components.lab.max}`}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  backgroundColor: 'var(--color-bg-card)',
                  border: `1px solid ${errors.lab ? 'var(--color-danger)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.88rem'
                }}
              />
              {errors.lab && (
                <span style={{ fontSize: '0.72rem', color: 'var(--color-danger)', marginTop: '2px', display: 'block' }}>
                  {errors.lab}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Live Calculation Preview Banner */}
        {liveResults && (
          <div
            style={{
              padding: '1rem',
              backgroundColor: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', letterSpacing: '0.5px' }}>
                Live Computed Score
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '2px' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                  {liveResults.totalMarks} / {liveResults.maxMarks}
                </span>
                <span style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  ({liveResults.percentage.toFixed(1)}%)
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <GradeBadge grade={liveResults.grade} gradePoint={liveResults.gradePoint} showPoint={true} size="md" />
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: liveResults.isPassed ? 'var(--color-success)' : 'var(--color-danger)'
                }}
              >
                {liveResults.isPassed ? (
                  <>
                    <CheckCircle2 size={16} /> Passed
                  </>
                ) : (
                  <>
                    <AlertCircle size={16} /> Failed
                  </>
                )}
              </span>
            </div>
          </div>
        )}

        {/* Faculty Remarks Field */}
        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.4rem' }}>
            Faculty Evaluation Remarks (Optional)
          </label>
          <textarea
            rows="2"
            value={formData.facultyRemarks}
            onChange={(e) => setFormData(prev => ({ ...prev, facultyRemarks: e.target.value }))}
            placeholder="e.g. Excellent laboratory skills, thorough conceptual comprehension..."
            style={{
              width: '100%',
              padding: '0.65rem 0.85rem',
              backgroundColor: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-text-primary)',
              fontSize: '0.88rem',
              resize: 'vertical'
            }}
          />
        </div>

        {/* Modal Action Buttons */}
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
            disabled={submitting}
          >
            {submitting ? 'Saving...' : isEditing ? 'Update Marks' : 'Save Marks'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default MarksEntryModal;

