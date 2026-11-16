import React from 'react';

/**
 * Planetono Space Button
 * - Primary: off-white background, red text. Hover: yellow background.
 * - Secondary: transparent, off-white text, 1px off-white border. Hover: primary-strong.
 * - Flat, 40px height, 4px radius, no shadow.
 */
export default function Button({
  children,
  variant = 'primary',
  onClick,
  disabled = false,
  type = 'button',
  ariaLabel,
  className = '',
  style = {}
}) {
  const baseStyle = {
    height: '40px',
    minWidth: '120px',
    padding: '8px 18px',
    borderRadius: 'var(--radius-sm)',
    fontFamily: 'var(--font-main)',
    fontSize: '14px',
    fontWeight: '700',
    letterSpacing: '0.03em',
    textTransform: 'uppercase',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1,
    border: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    textDecoration: 'none',
    transition: 'background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease, transform 0.1s ease',
    userSelect: 'none'
  };

  const variantStyles = {
    primary: {
      backgroundColor: 'var(--color-secondary)',
      color: 'var(--color-primary)',
      border: '1px solid var(--color-secondary)'
    },
    secondary: {
      backgroundColor: 'transparent',
      color: 'var(--color-secondary)',
      border: '1px solid var(--color-secondary)'
    },
    tertiary: {
      backgroundColor: 'var(--color-tertiary)',
      color: '#1a1a1a',
      border: '1px solid var(--color-tertiary)'
    },
    danger: {
      backgroundColor: 'var(--color-primary-strong)',
      color: 'var(--color-secondary)',
      border: '1px solid var(--color-secondary)'
    }
  };

  const handleMouseEnter = (e) => {
    if (disabled) return;
    if (variant === 'primary') {
      e.currentTarget.style.backgroundColor = 'var(--color-tertiary)';
      e.currentTarget.style.borderColor = 'var(--color-tertiary)';
      e.currentTarget.style.color = '#1a1a1a';
    } else if (variant === 'secondary') {
      e.currentTarget.style.backgroundColor = 'var(--color-primary-strong)';
    } else if (variant === 'tertiary') {
      e.currentTarget.style.backgroundColor = 'var(--color-accent-strong)';
    }
    e.currentTarget.style.transform = 'translateY(-1px)';
  };

  const handleMouseLeave = (e) => {
    if (disabled) return;
    const v = variantStyles[variant] || variantStyles.primary;
    e.currentTarget.style.backgroundColor = v.backgroundColor;
    e.currentTarget.style.borderColor = v.border.split(' ')[2];
    e.currentTarget.style.color = v.color;
    e.currentTarget.style.transform = 'translateY(0)';
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`btn btn-${variant} ${className}`}
      style={{
        ...baseStyle,
        ...(variantStyles[variant] || variantStyles.primary),
        ...style
      }}
    >
      {children}
    </button>
  );
}
