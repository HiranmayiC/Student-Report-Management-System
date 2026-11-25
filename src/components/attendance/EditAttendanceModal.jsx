import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { attendanceService, ATTENDANCE_STATUSES } from '../../services/attendanceService.js';
import { toast } from 'react-toastify';

const EditAttendanceModal = ({
  isOpen,
  onClose,
  record,
  currentUser,
  onSave
}) => {
  if (!record) return null;

  const [status, setStatus] = useState(record.status || ATTENDANCE_STATUSES.PRESENT);
  const [remarks, setRemarks] = useState(record.remarks || '');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (record) {
      setStatus(record.status || ATTENDANCE_STATUSES.PRESENT);
      setRemarks(record.remarks || '');
    }
  }, [record]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      attendanceService.updateSingleRecord(currentUser, record.id, {
        status,
        remarks
      });
      toast.success('Attendance record updated successfully!');
      if (onSave) onSave();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to update attendance record.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Correct Attendance Record"
      subtitle={`${record.studentName} (${record.studentId}) • ${record.subjectId} • ${record.date}`}
      maxWidth="480px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.4rem' }}>
            Attendance Status <span style={{ color: 'var(--color-danger)' }}>*</span>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
            {Object.values(ATTENDANCE_STATUSES).map((statusVal) => {
              const isSelected = status === statusVal;
              return (
                <button
                  key={statusVal}
                  type="button"
                  onClick={() => setStatus(statusVal)}
                  style={{
                    padding: '0.65rem',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    backgroundColor: isSelected ? 'var(--color-primary-light)' : 'var(--color-bg-card)',
                    color: isSelected ? 'var(--color-primary-text)' : 'var(--color-text-primary)',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    transition: 'all var(--transition-speed)'
                  }}
                >
                  {statusVal}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.4rem' }}>
            Correction Remarks / Reason (Optional)
          </label>
          <textarea
            rows="3"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="e.g. Verified medical certificate from college health center..."
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
            {submitting ? 'Updating...' : 'Update Record'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditAttendanceModal;

