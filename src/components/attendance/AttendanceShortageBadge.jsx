import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

const AttendanceShortageBadge = ({ percentage = 100, threshold = 75, showDetails = true }) => {
  const isShortage = Number(percentage) < Number(threshold);

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontWeight: 700,
        borderRadius: 'var(--radius-full)',
        padding: '3px 10px',
        fontSize: '0.78rem',
        backgroundColor: isShortage ? 'var(--color-danger-bg)' : 'var(--color-success-bg)',
        color: isShortage ? 'var(--color-danger-text)' : 'var(--color-success-text)',
        border: `1px solid ${isShortage ? 'rgba(220, 38, 38, 0.3)' : 'rgba(22, 163, 74, 0.3)'}`
      }}
    >
      {isShortage ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
      <span>
        {isShortage ? 'Shortage Alert' : 'Eligible'}
        {showDetails && ` (${Number(percentage).toFixed(1)}% / Min ${threshold}%)`}
      </span>
    </span>
  );
};

export default AttendanceShortageBadge;

