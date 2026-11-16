import React from 'react';
import Token from './Token';

const CELL_SIZE = 40;

// Main 52-cell track coordinates [col, row]
const TRACK_COORDS = [
  /* 0..4 */   [1, 6], [2, 6], [3, 6], [4, 6], [5, 6],
  /* 5..10 */  [6, 5], [6, 4], [6, 3], [6, 2], [6, 1], [6, 0],
  /* 11..12 */ [7, 0], [8, 0],
  /* 13..17 */ [8, 1], [8, 2], [8, 3], [8, 4], [8, 5],
  /* 18..23 */ [9, 6], [10, 6], [11, 6], [12, 6], [13, 6], [14, 6],
  /* 24..25 */ [14, 7], [14, 8],
  /* 26..30 */ [13, 8], [12, 8], [11, 8], [10, 8], [9, 8],
  /* 31..36 */ [8, 9], [8, 10], [8, 11], [8, 12], [8, 13], [8, 14],
  /* 37..38 */ [7, 14], [6, 14],
  /* 39..43 */ [6, 13], [6, 12], [6, 11], [6, 10], [6, 9],
  /* 44..49 */ [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8],
  /* 50..51 */ [0, 7], [0, 6]
];

// Home corridors (5 cells each) [col, row]
const HOME_CORRIDORS = {
  0: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7]],             // Red
  1: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5]],             // Green
  2: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7]],         // Yellow
  3: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9]]          // Blue
};

// Base yard token positions (4 per player) [cx, cy]
const BASE_TOKEN_POSITIONS = {
  0: [[70, 70], [170, 70], [70, 170], [170, 170]],         // Red
  1: [[430, 70], [530, 70], [430, 170], [530, 170]],       // Green
  2: [[430, 430], [530, 430], [430, 530], [530, 530]],     // Yellow
  3: [[70, 430], [170, 430], [70, 530], [170, 530]]        // Blue
};

// Finish center points [cx, cy]
const FINISH_POSITIONS = {
  0: [265, 300],
  1: [300, 265],
  2: [335, 300],
  3: [300, 335]
};

const SAFE_INDICES = [0, 8, 13, 21, 26, 34, 39, 47];

export default function Board({
  engineState,
  validMoves = [],
  onTokenClick,
  playerColors = ['red', 'green', 'yellow', 'blue']
}) {
  // Convert token state to (cx, cy) on SVG board
  const getTokenCoords = (playerIdx, tokenIdx, step) => {
    if (step === -1) {
      return BASE_TOKEN_POSITIONS[playerIdx][tokenIdx];
    }
    if (step === 56) {
      const baseFinish = FINISH_POSITIONS[playerIdx];
      // Offset slightly per token so they don't completely overlap
      const offsets = [[-6, -6], [6, -6], [-6, 6], [6, 6]];
      return [baseFinish[0] + offsets[tokenIdx][0], baseFinish[1] + offsets[tokenIdx][1]];
    }
    if (step >= 51 && step <= 55) {
      const corridorStep = step - 51;
      const [col, row] = HOME_CORRIDORS[playerIdx][corridorStep];
      return [col * CELL_SIZE + CELL_SIZE / 2, row * CELL_SIZE + CELL_SIZE / 2];
    }
    // Main track 0..50
    const startCell = [0, 13, 26, 39][playerIdx];
    const trackIndex = (startCell + step) % 52;
    const [col, row] = TRACK_COORDS[trackIndex];
    return [col * CELL_SIZE + CELL_SIZE / 2, row * CELL_SIZE + CELL_SIZE / 2];
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '560px',
        aspectRatio: '1 / 1',
        margin: '0 auto',
        backgroundColor: 'var(--board-bg)',
        border: '3px solid var(--color-neutral)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        boxShadow: 'none'
      }}
    >
      <svg
        viewBox="0 0 600 600"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        {/* Background */}
        <rect width="600" height="600" fill="#f7f2e5" />

        {/* 1. Red Base (Top-Left) */}
        <rect x="0" y="0" width="240" height="240" fill="#eb3322" />
        <rect x="35" y="35" width="170" height="170" rx="12" fill="#f7f2e5" stroke="#374151" strokeWidth="2" />
        {BASE_TOKEN_POSITIONS[0].map(([cx, cy], i) => (
          <circle key={`red-base-spot-${i}`} cx={cx} cy={cy} r="18" fill="#eb3322" opacity="0.25" stroke="#374151" strokeWidth="1.5" />
        ))}

        {/* 2. Green Base (Top-Right) */}
        <rect x="360" y="0" width="240" height="240" fill="#10b981" />
        <rect x="395" y="35" width="170" height="170" rx="12" fill="#f7f2e5" stroke="#374151" strokeWidth="2" />
        {BASE_TOKEN_POSITIONS[1].map(([cx, cy], i) => (
          <circle key={`green-base-spot-${i}`} cx={cx} cy={cy} r="18" fill="#10b981" opacity="0.25" stroke="#374151" strokeWidth="1.5" />
        ))}

        {/* 3. Yellow Base (Bottom-Right) */}
        <rect x="360" y="360" width="240" height="240" fill="#f59e0b" />
        <rect x="395" y="395" width="170" height="170" rx="12" fill="#f7f2e5" stroke="#374151" strokeWidth="2" />
        {BASE_TOKEN_POSITIONS[2].map(([cx, cy], i) => (
          <circle key={`yellow-base-spot-${i}`} cx={cx} cy={cy} r="18" fill="#f59e0b" opacity="0.25" stroke="#374151" strokeWidth="1.5" />
        ))}

        {/* 4. Blue Base (Bottom-Left) */}
        <rect x="0" y="360" width="240" height="240" fill="#3b82f6" />
        <rect x="35" y="395" width="170" height="170" rx="12" fill="#f7f2e5" stroke="#374151" strokeWidth="2" />
        {BASE_TOKEN_POSITIONS[3].map(([cx, cy], i) => (
          <circle key={`blue-base-spot-${i}`} cx={cx} cy={cy} r="18" fill="#3b82f6" opacity="0.25" stroke="#374151" strokeWidth="1.5" />
        ))}

        {/* 5. Center Home Triangles */}
        <polygon points="240,240 300,300 240,360" fill="#eb3322" stroke="#374151" strokeWidth="1.5" />
        <polygon points="240,240 360,240 300,300" fill="#10b981" stroke="#374151" strokeWidth="1.5" />
        <polygon points="360,240 360,360 300,300" fill="#f59e0b" stroke="#374151" strokeWidth="1.5" />
        <polygon points="240,360 360,360 300,300" fill="#3b82f6" stroke="#374151" strokeWidth="1.5" />

        {/* 6. Main Track Grid Cells */}
        {TRACK_COORDS.map(([col, row], idx) => {
          const isSafe = SAFE_INDICES.includes(idx);
          let cellFill = '#f7f2e5';
          if (idx === 0) cellFill = '#fecaca'; // Red start
          else if (idx === 13) cellFill = '#a7f3d0'; // Green start
          else if (idx === 26) cellFill = '#fde68a'; // Yellow start
          else if (idx === 39) cellFill = '#bfdbfe'; // Blue start

          return (
            <g key={`track-cell-${idx}`}>
              <rect
                x={col * CELL_SIZE}
                y={row * CELL_SIZE}
                width={CELL_SIZE}
                height={CELL_SIZE}
                fill={cellFill}
                stroke="#374151"
                strokeWidth="1.2"
              />
              {isSafe && (
                <text
                  x={col * CELL_SIZE + CELL_SIZE / 2}
                  y={row * CELL_SIZE + CELL_SIZE / 2 + 5}
                  textAnchor="middle"
                  fontSize="16"
                  fill="#374151"
                  pointerEvents="none"
                  fontWeight="bold"
                >
                  ★
                </text>
              )}
            </g>
          );
        })}

        {/* 7. Home Corridors */}
        {/* Red Home Corridor */}
        {HOME_CORRIDORS[0].map(([col, row], i) => (
          <rect key={`red-corridor-${i}`} x={col * CELL_SIZE} y={row * CELL_SIZE} width={CELL_SIZE} height={CELL_SIZE} fill="#eb3322" stroke="#374151" strokeWidth="1.2" />
        ))}
        {/* Green Home Corridor */}
        {HOME_CORRIDORS[1].map(([col, row], i) => (
          <rect key={`green-corridor-${i}`} x={col * CELL_SIZE} y={row * CELL_SIZE} width={CELL_SIZE} height={CELL_SIZE} fill="#10b981" stroke="#374151" strokeWidth="1.2" />
        ))}
        {/* Yellow Home Corridor */}
        {HOME_CORRIDORS[2].map(([col, row], i) => (
          <rect key={`yellow-corridor-${i}`} x={col * CELL_SIZE} y={row * CELL_SIZE} width={CELL_SIZE} height={CELL_SIZE} fill="#f59e0b" stroke="#374151" strokeWidth="1.2" />
        ))}
        {/* Blue Home Corridor */}
        {HOME_CORRIDORS[3].map(([col, row], i) => (
          <rect key={`blue-corridor-${i}`} x={col * CELL_SIZE} y={row * CELL_SIZE} width={CELL_SIZE} height={CELL_SIZE} fill="#3b82f6" stroke="#374151" strokeWidth="1.2" />
        ))}

        {/* 8. Render Tokens on top */}
        {engineState && engineState.players && engineState.players.map((player, pIdx) => {
          if (!player.is_active && !player.isActive) return null;
          const tokens = player.tokens || [];
          const isCurrentTurn = engineState.current_player === pIdx;

          return tokens.map((token, tIdx) => {
            const step = token.step;
            const [cx, cy] = getTokenCoords(pIdx, tIdx, step);
            const isMovable = isCurrentTurn && validMoves.includes(tIdx);

            return (
              <Token
                key={`p${pIdx}-t${tIdx}`}
                color={playerColors[pIdx] || 'red'}
                tokenIndex={tIdx}
                isMovable={isMovable}
                cx={cx}
                cy={cy}
                radius={13}
                onClick={() => onTokenClick && onTokenClick(tIdx)}
              />
            );
          });
        })}
      </svg>
    </div>
  );
}
