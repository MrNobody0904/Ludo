import React, { useState, useEffect } from 'react';
import Board from '../components/Board';
import Dice3D from '../three/Dice3D';
import WinnerScene from '../three/WinnerScene';
import Chat from '../components/Chat';
import Button from '../components/Button';
import Card from '../components/Card';
import useSound from '../hooks/useSound';

const COLOR_MAP = {
  red: '#eb3322',
  green: '#10b981',
  yellow: '#f59e0b',
  blue: '#3b82f6'
};

export default function Game({
  roomState,
  currentPlayerId,
  onRollDice,
  onMoveToken,
  onSendMessage,
  onRematch,
  onLeaveGame,
  animationsEnabled = true,
  theme,
  onToggleTheme
}) {
  const [isRolling, setIsRolling] = useState(false);
  const { muted, toggleMute, playDiceRoll, playTokenHop, playCapture, playWin } = useSound();

  const engineState = roomState?.engineState;
  const players = roomState?.players || [];
  const currentSeat = engineState?.current_player ?? 0;
  const activePlayer = players[currentSeat];
  const isMyTurn = activePlayer?.id === currentPlayerId;
  const currentDice = engineState?.current_dice || 0;
  const phase = engineState?.phase ?? 0; // 0 = WAITING_FOR_ROLL, 1 = WAITING_FOR_MOVE, 2 = GAME_OVER
  const isGameOver = phase === 2 || engineState?.winner !== -1;
  const winnerSeat = engineState?.winner;
  const winnerPlayer = winnerSeat !== -1 && winnerSeat !== undefined ? players[winnerSeat] : null;

  // Compute valid moves for active player
  const validMoves = (isMyTurn && phase === 1)
    ? (roomState?.validMoves || [0, 1, 2, 3])
    : [];

  // Play audio triggers on state updates
  useEffect(() => {
    if (currentDice > 0 && phase === 1) {
      playDiceRoll();
    }
  }, [currentDice, phase, playDiceRoll]);

  useEffect(() => {
    if (isGameOver) {
      playWin();
    }
  }, [isGameOver, playWin]);

  const handleRollClick = () => {
    if (!isMyTurn || phase !== 0 || isRolling) return;
    setIsRolling(true);
    playDiceRoll();
    onRollDice();
    setTimeout(() => setIsRolling(false), 800);
  };

  const handleTokenClick = (tokenIdx) => {
    if (!isMyTurn || phase !== 1) return;
    playTokenHop();
    onMoveToken(tokenIdx);
  };

  return (
    <main className="page-container" style={{ maxWidth: '1000px', padding: '16px 12px' }}>
      {/* Top Bar: Turn Indicator & Quick Controls */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: isMyTurn ? 'var(--color-tertiary)' : 'var(--color-primary-strong)',
              color: isMyTurn ? '#1a1a1a' : 'var(--color-secondary)',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: COLOR_MAP[activePlayer?.color] || '#eb3322'
              }}
            />
            <span>
              {isMyTurn ? "YOUR TURN!" : `${activePlayer?.name || 'Player'}'s turn`}
            </span>
          </div>

          {engineState?.consecutive_sixes > 1 && (
            <span className="label-sm" style={{ color: 'var(--color-tertiary)' }}>
              🔥 {engineState.consecutive_sixes} Sixes in a row!
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={toggleMute}
            aria-label="Toggle sound"
            style={{
              background: 'none',
              border: '1px solid var(--color-neutral)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-secondary)',
              padding: '6px 10px',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            {muted ? '🔇 Muted' : '🔊 Sound'}
          </button>
          <Button variant="secondary" onClick={onLeaveGame} style={{ minWidth: '70px', height: '34px', fontSize: '12px' }}>
            Exit
          </Button>
        </div>
      </div>

      {/* Main Game Layout: Board + Controls Sidebar */}
      <div
        style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 560px) 1fr',
          gap: '24px',
          alignItems: 'start'
        }}
      >
        {/* SVG Board */}
        <div>
          <Board
            engineState={engineState}
            validMoves={validMoves}
            onTokenClick={handleTokenClick}
            playerColors={players.map(p => p.color)}
          />
        </div>

        {/* Sidebar: Dice, Moves, Chat */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Interactive Dice Card */}
          <Card style={{ textAlign: 'center', padding: '20px' }}>
            <div className="label-sm" style={{ marginBottom: '10px', opacity: 0.85 }}>
              Game Dice
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
              <Dice3D
                currentDice={currentDice}
                isRolling={isRolling}
                disable3D={!animationsEnabled}
              />
            </div>

            {isMyTurn && phase === 0 && (
              <Button
                variant="primary"
                onClick={handleRollClick}
                disabled={isRolling}
                style={{
                  width: '100%',
                  height: '46px',
                  fontSize: '15px',
                  backgroundColor: 'var(--color-tertiary)',
                  color: '#1a1a1a',
                  borderColor: 'var(--color-tertiary)'
                }}
              >
                {isRolling ? 'Rolling...' : 'ROLL DICE'}
              </Button>
            )}

            {isMyTurn && phase === 1 && (
              <div
                className="body-sm"
                style={{
                  color: 'var(--color-tertiary)',
                  fontWeight: 700,
                  animation: 'pulse 1s infinite'
                }}
              >
                👉 Select a glowing token to move ({currentDice} steps)
              </div>
            )}

            {!isMyTurn && !isGameOver && (
              <div className="body-sm" style={{ opacity: 0.75 }}>
                Waiting for {activePlayer?.name}...
              </div>
            )}
          </Card>

          {/* Move Log */}
          <Card style={{ padding: '14px', maxHeight: '140px', overflowY: 'auto' }}>
            <div className="label-sm" style={{ marginBottom: '6px', opacity: 0.8 }}>
              Move Log
            </div>
            {roomState?.moveLog?.length === 0 ? (
              <div className="body-sm" style={{ opacity: 0.5 }}>Game started.</div>
            ) : (
              roomState?.moveLog?.slice(-4).map((log, i) => (
                <div key={i} className="body-sm" style={{ opacity: 0.85, fontSize: '13px' }}>
                  • {log.text}
                </div>
              ))
            )}
          </Card>

          {/* In-Game Chat (Multiplayer) */}
          {!roomState?.isSinglePlayer && (
            <Chat
              messages={roomState?.chatMessages || []}
              onSendMessage={onSendMessage}
            />
          )}
        </div>
      </div>

      {/* Game Over / Winner Screen Modal */}
      {isGameOver && (
        <div
          role="dialog"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
        >
          <Card
            style={{
              maxWidth: '440px',
              width: '100%',
              padding: '32px 24px',
              textAlign: 'center',
              backgroundColor: 'var(--color-primary)',
              border: '2px solid var(--color-tertiary)'
            }}
          >
            <h2 className="headline-lg" style={{ color: 'var(--color-tertiary)', marginBottom: '8px' }}>
              VICTORY!
            </h2>
            <p className="headline-sm" style={{ marginBottom: '16px' }}>
              {winnerPlayer ? `${winnerPlayer.name} Wins the Game!` : 'Game Over!'}
            </p>

            {/* 3D Trophy / Confetti */}
            <WinnerScene
              winnerName={winnerPlayer?.name}
              winnerColor={winnerPlayer?.color}
            />

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
              <Button variant="primary" onClick={onRematch} style={{ height: '44px' }}>
                Play Again
              </Button>
              <Button variant="secondary" onClick={onLeaveGame} style={{ height: '44px' }}>
                Main Menu
              </Button>
            </div>
          </Card>
        </div>
      )}
    </main>
  );
}
