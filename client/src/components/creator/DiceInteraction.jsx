import React, { useState, useRef } from 'react';
import gsap from 'gsap';
import Dice3D from '../../three/Dice3D';
import useSound from '../../hooks/useSound';

const MESSAGES = {
  1: "The journey begins.",
  2: "Getting somewhere.",
  3: "Keep moving.",
  4: "Nice roll!",
  5: "Almost there.",
  6: "LET'S GOOOO! Extra turn energy! 🔥"
};

export default function DiceInteraction() {
  const [rolledNumber, setRolledNumber] = useState(6);
  const [isRolling, setIsRolling] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const { playDiceRoll } = useSound();
  const tokensRef = useRef(null);

  const handleRoll = () => {
    if (isRolling) return;
    setIsRolling(true);
    setCelebrating(false);
    playDiceRoll();

    const result = Math.floor(Math.random() * 6) + 1;

    setTimeout(() => {
      setRolledNumber(result);
      setIsRolling(false);
      setCelebrating(true);

      // 4 Tokens bounce celebration
      if (tokensRef.current) {
        gsap.fromTo(
          tokensRef.current.children,
          { y: 0 },
          { y: -24, stagger: 0.08, duration: 0.3, yoyo: true, repeat: 3, ease: 'bounce.out' }
        );
      }
    }, 700);
  };

  return (
    <section
      style={{
        padding: '90px 24px',
        maxWidth: '820px',
        margin: '0 auto',
        textAlign: 'center',
        position: 'relative',
        zIndex: 3
      }}
    >
      <span
        style={{
          fontFamily: 'var(--creator-font-mono)',
          fontSize: '12px',
          color: 'var(--creator-player-green)',
          letterSpacing: '0.15em',
          fontWeight: 700
        }}
      >
        // INTERACTIVE MOMENT
      </span>
      <h2
        style={{
          fontSize: 'clamp(32px, 6vw, 56px)',
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          textTransform: 'uppercase',
          color: 'var(--creator-text-primary)',
          letterSpacing: '-0.02em',
          marginTop: '8px',
          marginBottom: '28px'
        }}
      >
        ENOUGH ABOUT ME. LET'S ROLL.
      </h2>

      {/* 3D Dice Display Box */}
      <div
        style={{
          backgroundColor: 'var(--creator-bg-secondary)',
          border: '1px solid var(--creator-border)',
          borderRadius: '16px',
          padding: '40px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)'
        }}
      >
        {/* Tumbling 3D Dice */}
        <div style={{ cursor: 'pointer' }} onClick={handleRoll}>
          <Dice3D currentDice={rolledNumber} isRolling={isRolling} />
        </div>

        {/* Big Roll Number */}
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '64px',
            fontWeight: 800,
            color: 'var(--creator-accent-yellow)',
            lineHeight: 1
          }}
        >
          {isRolling ? '...' : rolledNumber}
        </div>

        {/* Playful Result Message */}
        <p
          style={{
            fontFamily: 'var(--creator-font-mono)',
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--creator-text-primary)',
            minHeight: '28px',
            margin: 0
          }}
        >
          {isRolling ? 'Rolling in 3D...' : MESSAGES[rolledNumber]}
        </p>

        {/* 4 Celebrating Player Tokens */}
        <div
          ref={tokensRef}
          style={{
            display: 'flex',
            gap: '18px',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: '8px'
          }}
        >
          {['#ff5148', '#5dce9b', '#ffc857', '#58a5ef'].map((c, idx) => (
            <div
              key={idx}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: c,
                border: '3px solid #f8f1e5',
                boxShadow: `0 4px 14px ${c}55`
              }}
            />
          ))}
        </div>

        {/* Roll Trigger Button */}
        <button
          type="button"
          className="btn-creator-primary"
          onClick={handleRoll}
          disabled={isRolling}
          style={{ marginTop: '10px' }}
        >
          {isRolling ? 'Rolling...' : 'ROLL THE DICE 🎲'}
        </button>
      </div>
    </section>
  );
}
