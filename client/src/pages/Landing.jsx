import React, { useEffect, useRef } from 'react';
import HeroDice from '../three/HeroDice';
import Button from '../components/Button';
import useSound from '../hooks/useSound';
import { animateLandingEntrance } from '../animations/landingTimeline';

export default function Landing({
  onNavigate,
  theme,
  onToggleTheme,
  animationsEnabled,
  onToggleAnimations
}) {
  const containerRef = useRef(null);
  const { playDiceRoll } = useSound();

  useEffect(() => {
    const cleanup = animateLandingEntrance(containerRef);
    return () => cleanup && cleanup();
  }, []);

  const titleLetters = ['L', 'U', 'D', 'O'];

  return (
    <main
      ref={containerRef}
      className="page-container"
      style={{
        textAlign: 'center',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '20px 12px'
      }}
    >
      {/* 3D Hero Scene with Giant Dice, Floating Pawns & Mini Board */}
      <div className="hero-dice-container" style={{ margin: '0 auto', width: '100%', maxWidth: '620px' }}>
        <HeroDice onDiceClick={playDiceRoll} />
      </div>

      {/* Title "LUDO" with staggered letters */}
      <h1
        className="font-display"
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '6px',
          color: 'var(--color-secondary)',
          margin: '12px 0 8px 0'
        }}
      >
        {titleLetters.map((char, index) => (
          <span
            key={index}
            className="letter-char"
            style={{ display: 'inline-block' }}
          >
            {char}
          </span>
        ))}
      </h1>

      {/* Tagline */}
      <p
        className="hero-tagline body-lg"
        style={{
          color: 'var(--color-secondary)',
          maxWidth: '480px',
          margin: '0 auto 24px auto',
          letterSpacing: '-0.01em'
        }}
      >
        Roll. Race. Capture. Play with a bot or your friends.
      </p>

      {/* Exactly Two Buttons */}
      <div
        className="hero-btn-group"
        style={{
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: '36px'
        }}
      >
        <Button
          variant="primary"
          onClick={() => onNavigate('/single')}
          style={{ minWidth: '160px', height: '46px', fontSize: '15px' }}
        >
          Single Player
        </Button>
        <Button
          variant="secondary"
          onClick={() => onNavigate('/multiplayer')}
          style={{ minWidth: '160px', height: '46px', fontSize: '15px' }}
        >
          Multiplayer
        </Button>
      </div>

      {/* Footer */}
      <footer
        className="landing-footer body-sm"
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '14px',
          opacity: 0.9,
          paddingTop: '10px',
          borderTop: '1px solid rgba(247, 242, 229, 0.15)'
        }}
      >
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ opacity: 0.75, fontSize: '13px' }}>
            © 2026 LUDO. All rights reserved.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <button
            onClick={onToggleTheme}
            style={{
              background: 'none',
              border: '1px solid var(--color-neutral)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-secondary)',
              padding: '4px 10px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Theme: {theme === 'dark' ? 'Dark (Red)' : 'Light (Off-white)'}
          </button>
          <button
            onClick={onToggleAnimations}
            style={{
              background: 'none',
              border: '1px solid var(--color-neutral)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-secondary)',
              padding: '4px 10px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            3D & Motion: {animationsEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
      </footer>
    </main>
  );
}
