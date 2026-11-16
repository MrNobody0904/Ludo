import React from 'react';

const COLOR_MAP = {
  red: '#eb3322',
  green: '#10b981',
  yellow: '#f59e0b',
  blue: '#3b82f6'
};

export default function Token({
  color = 'red',
  tokenIndex,
  isMovable = false,
  onClick,
  cx = 0,
  cy = 0,
  radius = 14
}) {
  const fillColor = COLOR_MAP[color] || '#eb3322';

  return (
    <g
      onClick={isMovable ? onClick : undefined}
      style={{
        cursor: isMovable ? 'pointer' : 'default',
        transformOrigin: `${cx}px ${cy}px`,
        transition: 'transform 0.15s ease'
      }}
      className={isMovable ? 'token-movable' : ''}
    >
      {/* Movable glowing pulse ring */}
      {isMovable && (
        <circle
          cx={cx}
          cy={cy}
          r={radius + 5}
          fill="none"
          stroke="#ffc737"
          strokeWidth="3"
          strokeDasharray="4 3"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from={`0 ${cx} ${cy}`}
            to={`360 ${cx} ${cy}`}
            dur="4s"
            repeatCount="indefinite"
          />
        </circle>
      )}

      {/* Drop shadow / base circle */}
      <circle
        cx={cx}
        cy={cy + 1.5}
        r={radius}
        fill="#374151"
        opacity="0.35"
      />

      {/* Main token body */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill={fillColor}
        stroke="#f7f2e5"
        strokeWidth="2.5"
      />

      {/* Inner accent ring */}
      <circle
        cx={cx}
        cy={cy}
        r={radius * 0.55}
        fill="none"
        stroke="#f7f2e5"
        strokeWidth="1.5"
      />

      {/* Center pip */}
      <circle
        cx={cx}
        cy={cy}
        r={radius * 0.22}
        fill="#f7f2e5"
      />
    </g>
  );
}
