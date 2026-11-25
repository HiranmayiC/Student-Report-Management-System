import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={{ padding: '3rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '3rem', color: 'var(--color-primary)' }}>404</h1>
      <h2>Page Not Found</h2>
      <p style={{ color: 'var(--color-text-secondary)', margin: '1rem 0' }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/"
        style={{
          display: 'inline-block',
          padding: '8px 16px',
          backgroundColor: 'var(--color-primary)',
          color: '#ffffff',
          borderRadius: 'var(--radius-sm)',
          fontWeight: 500
        }}
      >
        Return to Home
      </Link>
    </div>
  );
};

export default NotFound;

