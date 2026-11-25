import React from 'react';
import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

const AttendanceStatusBadge = ({ status = 'Present', size = 'md' }) => {
  const getBadgeConfig = (s) => {
    switch (s?.toLowerCase()) {
      case 'present':
        return {
          bg: 'var(--color-success-bg)',
          text: 'var(--color-success-text)',
          border: 'rgba(22, 163, 74, 0.3)',
          icon: CheckCircle2,
          label: 'Present'
        };
      case 'absent':
        return {
          bg: 'var(--color-danger-bg)',
          text: 'var(--color-danger-text)',
          border: 'rgba(220, 38, 38, 0.3)',
          icon: XCircle,
          label: 'Absent'
        };
      case 'late':
        return {
          bg: 'var(--color-warning-bg)',
          text: 'var(--color-warning-text)',
          border: 'rgba(217, 119, 6, 0.3)',
          icon: Clock,
          label: 'Late'
        };
      case 'excused':
        return {
          bg: 'var(--color-info-bg)',
          text: 'var(--color-info-text)',
          border: 'rgba(2, 132, 199, 0.3)',
          icon: AlertCircle,
          label: 'Excused / On-Duty'
        };
      default:
        return {
          bg: 'var(--color-bg-main)',
          text: 'var(--color-text-secondary)',
          border: 'var(--color-border)',
          icon: CheckCircle2,
          label: s
        };
    }
  };

  const config = getBadgeConfig(status);
  const IconComponent = config.icon;

  const sizeStyles = {
    sm: { padding: '2px 8px', fontSize: '0.72rem', iconSize: 12 },
    md: { padding: '3px 10px', fontSize: '0.78rem', iconSize: 14 },
    lg: { padding: '5px 14px', fontSize: '0.88rem', iconSize: 16 }
  };

  const currentSize = sizeStyles[size] || sizeStyles.md;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontWeight: 700,
        borderRadius: 'var(--radius-full)',
        backgroundColor: config.bg,
        color: config.text,
        border: `1px solid ${config.border}`,
        padding: currentSize.padding,
        fontSize: currentSize.fontSize,
        lineHeight: 1.2
      }}
    >
      <IconComponent size={currentSize.iconSize} />
      <span>{config.label}</span>
    </span>
  );
};

export default AttendanceStatusBadge;

