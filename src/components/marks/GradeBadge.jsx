import React from 'react';

/**
 * GradeBadge Component
 * Renders a standardized, semantic grade badge according to the university grading scale:
 * O (10 GP) - Outstanding
 * A+ (9 GP) - Excellent
 * A (8 GP) - Very Good
 * B+ (7 GP) - Good
 * B (6 GP) - Above Average
 * C (5 GP) - Pass
 * F (0 GP) - Fail
 */
const GradeBadge = ({ grade = 'F', gradePoint = null, showPoint = false, size = 'md' }) => {
  const getBadgeStyle = (g) => {
    switch (g?.toUpperCase()) {
      case 'O':
        return {
          backgroundColor: '#ede9fe',
          color: '#5b21b6',
          border: '1px solid #c4b5fd'
        };
      case 'A+':
        return {
          backgroundColor: '#dcfce7',
          color: '#14532d',
          border: '1px solid #86efac'
        };
      case 'A':
        return {
          backgroundColor: '#d1fae5',
          color: '#065f46',
          border: '1px solid #a7f3d0'
        };
      case 'B+':
        return {
          backgroundColor: '#dbeafe',
          color: '#1e40af',
          border: '1px solid #93c5fd'
        };
      case 'B':
        return {
          backgroundColor: '#e0e7ff',
          color: '#3730a3',
          border: '1px solid #c7d2fe'
        };
      case 'C':
        return {
          backgroundColor: '#fef3c7',
          color: '#92400e',
          border: '1px solid #fde68a'
        };
      case 'F':
      default:
        return {
          backgroundColor: '#fee2e2',
          color: '#991b1b',
          border: '1px solid #fca5a5'
        };
    }
  };

  const styleConfig = getBadgeStyle(grade);

  const paddingMap = {
    sm: '2px 6px',
    md: '3px 10px',
    lg: '5px 14px'
  };

  const fontSizeMap = {
    sm: '0.72rem',
    md: '0.82rem',
    lg: '0.92rem'
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontWeight: 700,
        borderRadius: 'var(--radius-full)',
        lineHeight: 1.2,
        padding: paddingMap[size] || paddingMap.md,
        fontSize: fontSizeMap[size] || fontSizeMap.md,
        ...styleConfig
      }}
    >
      <span>Grade {grade}</span>
      {showPoint && gradePoint !== null && (
        <span
          style={{
            opacity: 0.85,
            fontSize: '0.85em',
            paddingLeft: '3px',
            borderLeft: `1px solid ${styleConfig.color}`
          }}
        >
          {Number(gradePoint).toFixed(1)} GP
        </span>
      )}
    </span>
  );
};

export default GradeBadge;

