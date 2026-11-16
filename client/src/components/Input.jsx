import React, { useState } from 'react';

/**
 * Planetono Space Input
 * - 1px border, 4px radius
 * - Focus shown by yellow border (no glow)
 * - Flat, clean, accessible
 */
export default function Input({
  label,
  value,
  onChange,
  placeholder = '',
  type = 'text',
  maxLength,
  disabled = false,
  error = '',
  className = '',
  style = {},
  id
}) {
  const [isFocused, setIsFocused] = useState(false);
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    width: '100%',
    ...style
  };

  const inputStyle = {
    height: '42px',
    padding: '8px 12px',
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-secondary)',
    fontFamily: 'var(--font-main)',
    fontSize: '15px',
    border: `1px solid ${error ? 'var(--color-tertiary)' : isFocused ? 'var(--color-tertiary)' : 'var(--color-neutral)'}`,
    borderRadius: 'var(--radius-sm)',
    outline: 'none',
    transition: 'border-color 0.15s ease',
    width: '100%'
  };

  return (
    <div style={containerStyle} className={className}>
      {label && (
        <label
          htmlFor={inputId}
          className="label-sm"
          style={{ color: 'var(--color-secondary)', opacity: 0.85 }}
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={inputStyle}
      />
      {error && (
        <span style={{ color: 'var(--color-tertiary)', fontSize: '12px', fontWeight: 600 }}>
          {error}
        </span>
      )}
    </div>
  );
}
