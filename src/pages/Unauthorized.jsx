import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Unauthorized = () => {
  const { user } = useAuth();
  const location = useLocation();
  const customReason = location.state?.reason;

  return (
    <div style={{
      maxWidth: '560px',
      margin: '4rem auto',
      padding: '2.5rem',
      backgroundColor: 'var(--color-bg-card)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-md)',
      textAlign: 'center'
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: 'var(--radius-full)',
        backgroundColor: 'var(--color-danger-bg)',
        color: 'var(--color-danger)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.25rem'
      }}>
        <ShieldAlert size={34} />
      </div>

      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
        Access Restricted
      </h1>

      <p style={{
        color: 'var(--color-text-secondary)',
        fontSize: '0.95rem',
        margin: '1rem 0 1.75rem',
        lineHeight: 1.6
      }}>
        {customReason || (
          <>
            You do not have the required permissions to view this module with your current role of{' '}
            <strong style={{ color: 'var(--color-primary)', textTransform: 'capitalize' }}>
              {user?.role || 'Guest'}
            </strong>.
          </>
        )}
      </p>

      <div style={{
        padding: '0.85rem 1rem',
        backgroundColor: 'var(--color-bg-main)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
        fontSize: '0.82rem',
        color: 'var(--color-text-muted)',
        marginBottom: '1.75rem',
        textAlign: 'left'
      }}>
        <div><strong>Logged in as:</strong> {user?.name || 'Anonymous'}</div>
        <div><strong>Assigned Role:</strong> <span style={{ textTransform: 'capitalize' }}>{user?.role}</span></div>
        {user?.studentId && <div><strong>Student ID:</strong> {user.studentId}</div>}
        {user?.facultyId && <div><strong>Faculty ID:</strong> {user.facultyId}</div>}
      </div>

      <Link
        to="/dashboard"
        className="btn btn-primary"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
      >
        <ArrowLeft size={16} /> Return to Dashboard
      </Link>
    </div>
  );
};

export default Unauthorized;

