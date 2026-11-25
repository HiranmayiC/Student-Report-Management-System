import React from 'react';
import { FolderOpen } from 'lucide-react';

const EmptyState = ({
  icon: IconComponent = FolderOpen,
  title = 'No Records Found',
  description = 'There is currently no data available for this section.',
  actionLabel,
  onAction
}) => {
  return (
    <div style={{
      padding: '3rem 1.5rem',
      textAlign: 'center',
      backgroundColor: 'var(--color-bg-card)',
      border: '1px dashed var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      margin: '1rem 0'
    }}>
      <div style={{
        width: '54px',
        height: '54px',
        borderRadius: 'var(--radius-full)',
        backgroundColor: 'var(--color-primary-light)',
        color: 'var(--color-primary)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1rem'
      }}>
        <IconComponent size={28} />
      </div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
        {title}
      </h3>
      <p style={{
        fontSize: '0.88rem',
        color: 'var(--color-text-secondary)',
        maxWidth: '420px',
        margin: '0.5rem auto 1.25rem'
      }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <button className="btn btn-primary btn-sm" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;

