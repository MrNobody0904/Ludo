import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import Card from '../components/Card';
import Button from '../components/Button';

const COLOR_MAP = {
  red: '#eb3322',
  green: '#10b981',
  yellow: '#f59e0b',
  blue: '#3b82f6'
};

export default function Lobby({
  roomState,
  currentPlayerId,
  onStartGame,
  onAddBot,
  onRemoveBot,
  onLeaveRoom
}) {
  const [copied, setCopied] = useState(false);
  const cardsRef = useRef([]);

  const isHost = roomState?.players?.find(p => p.id === currentPlayerId)?.isHost;
  const shareUrl = `${window.location.origin}/room/${roomState?.roomCode}`;

  useEffect(() => {
    // GSAP pop-in for player cards
    if (cardsRef.current.length > 0) {
      gsap.fromTo(
        cardsRef.current.filter(Boolean),
        { scale: 0.85, opacity: 0, y: 15 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'back.out(1.8)' }
      );
    }
  }, [roomState?.players?.length]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // fallback
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Play Ludo with me!',
          text: `Join my Ludo room: ${roomState.roomCode}`,
          url: shareUrl
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopy();
    }
  };

  const players = roomState?.players || [];
  const maxPlayers = 4;
  const emptySlots = maxPlayers - players.length;

  return (
    <main className="page-container" style={{ maxWidth: '580px' }}>
      <Card style={{ width: '100%', padding: '28px 22px' }}>
        {/* Room Header & Code */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <span className="label-sm" style={{ opacity: 0.8 }}>Room Code</span>
            <h2 className="headline-lg" style={{ letterSpacing: '0.12em', color: 'var(--color-tertiary)' }}>
              {roomState?.roomCode}
            </h2>
          </div>
          <Button variant="secondary" onClick={onLeaveRoom} style={{ minWidth: '70px', height: '34px', fontSize: '13px' }}>
            Leave
          </Button>
        </div>

        {/* Share Link Actions */}
        <div
          style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
            backgroundColor: 'var(--color-primary-strong)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '24px'
          }}
        >
          <div className="body-sm" style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {shareUrl}
          </div>
          <Button variant="primary" onClick={handleCopy} style={{ minWidth: '90px', height: '34px', fontSize: '12px' }}>
            {copied ? '✓ Copied!' : 'Copy Link'}
          </Button>
          {typeof navigator !== 'undefined' && navigator.share && (
            <Button variant="secondary" onClick={handleShare} style={{ minWidth: '70px', height: '34px', fontSize: '12px' }}>
              Share
            </Button>
          )}
        </div>

        {/* Players List */}
        <div style={{ marginBottom: '24px' }}>
          <div className="label-sm" style={{ marginBottom: '10px', opacity: 0.85 }}>
            Players ({players.length} / 4)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {players.map((p, idx) => (
              <div
                key={p.id}
                ref={(el) => (cardsRef.current[idx] = el)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  backgroundColor: 'var(--color-primary-strong)',
                  border: `1px solid ${COLOR_MAP[p.color] || 'var(--color-neutral)'}`,
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      backgroundColor: COLOR_MAP[p.color] || '#eb3322',
                      border: '2px solid #f7f2e5'
                    }}
                  />
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '15px' }}>
                      {p.name} {p.id === currentPlayerId && '(You)'}
                    </span>
                    {p.isHost && (
                      <span className="label-sm" style={{ marginLeft: '8px', color: 'var(--color-tertiary)' }}>
                        ★ Host
                      </span>
                    )}
                    {p.isBot && (
                      <span className="label-sm" style={{ marginLeft: '8px', opacity: 0.7 }}>
                        [Bot]
                      </span>
                    )}
                  </div>
                </div>

                {isHost && p.isBot && (
                  <button
                    onClick={() => onRemoveBot(p.seat)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-secondary)',
                      cursor: 'pointer',
                      fontSize: '16px',
                      opacity: 0.8
                    }}
                    title="Remove bot"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}

            {/* Empty Slots */}
            {Array.from({ length: emptySlots }).map((_, i) => (
              <div
                key={`empty-${i}`}
                style={{
                  padding: '12px 16px',
                  border: '1px dashed var(--color-neutral)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  opacity: 0.6
                }}
              >
                <span className="body-sm">Empty Slot</span>
                {isHost && (
                  <Button
                    variant="secondary"
                    onClick={() => onAddBot(1)} // Medium bot
                    style={{ minWidth: '80px', height: '30px', fontSize: '11px', padding: '4px 8px' }}
                  >
                    + Add Bot
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Start Game Button (Host only) */}
        {isHost ? (
          <Button
            variant="primary"
            onClick={onStartGame}
            disabled={players.length < 2}
            style={{ width: '100%', height: '48px', fontSize: '16px' }}
          >
            {players.length < 2 ? 'Waiting for players (min 2)...' : 'Start Game'}
          </Button>
        ) : (
          <div className="body-sm" style={{ textAlign: 'center', opacity: 0.8, fontStyle: 'italic' }}>
            Waiting for host to start the game...
          </div>
        )}
      </Card>
    </main>
  );
}
