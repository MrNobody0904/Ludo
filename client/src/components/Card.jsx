import React from 'react';

/**
 * Planetono Space Card
 * - Flat, same red as the background
 * - 1px border, 16px padding, 8px radius
 * - No shadows, no gradients
 */
export default function Card({
  children,
  className = '',
  style = {},
  onClick,
  highlight = false
}) {
  const cardStyle = {
    backgroundColor: 'var(--color-primary)',
    border: `1px solid ${highlight ? 'var(--color-tertiary)' : 'var(--color-neutral)'}`,
    borderRadius: 'var(--radius-md)',
    padding: '16px',
    color: 'var(--color-secondary)',
    transition: 'border-color 0.2s ease, transform 0.2s ease',
    ...(onClick ? { cursor: 'pointer' } : {}),
    ...style
  };

  return (
    <div
      className={`card ${className}`}
      style={cardStyle}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
