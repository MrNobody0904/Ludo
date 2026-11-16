import React from 'react';

export default function CreatorFooter({ onNavigate }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      style={{
        padding: '120px 24px 60px 24px',
        maxWidth: '1000px',
        margin: '0 auto',
        textAlign: 'center',
        position: 'relative',
        zIndex: 3
      }}
    >
      {/* Large Headline */}
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(44px, 8vw, 88px)',
          fontWeight: 800,
          textTransform: 'uppercase',
          lineHeight: 1.05,
          letterSpacing: '-0.03em',
          color: 'var(--creator-text-primary)',
          marginBottom: '20px'
        }}
      >
        ANYWAY,<br />
        <span style={{ color: 'var(--creator-accent-yellow)' }}>BACK TO BUILDING.</span>
      </h2>

      {/* Supporting Text */}
      <p
        style={{
          fontSize: 'clamp(16px, 2.5vw, 20px)',
          color: 'var(--creator-text-secondary)',
          maxWidth: '580px',
          margin: '0 auto 36px auto',
          lineHeight: 1.6
        }}
      >
        Thanks for exploring my little corner of the Ludo universe. Now go roll something.
      </p>

      {/* Navigation Buttons */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          marginBottom: '80px'
        }}
      >
        <button
          type="button"
          className="btn-creator-primary"
          onClick={() => onNavigate('/')}
        >
          BACK TO LUDO ↗
        </button>
        <button
          type="button"
          className="btn-creator-secondary"
          onClick={scrollToTop}
        >
          EXPLORE AGAIN ↑
        </button>
      </div>

      {/* Footer Sign-off Divider */}
      <div
        style={{
          paddingTop: '32px',
          borderTop: '1px solid var(--creator-border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <p
          style={{
            fontFamily: 'var(--creator-font-mono)',
            fontSize: '12px',
            color: 'var(--creator-text-secondary)',
            margin: 0,
            opacity: 0.8
          }}
        >
          Made with curiosity, caffeine & questionable debugging decisions.
        </p>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'var(--creator-font-mono)',
            fontSize: '13px',
            fontWeight: 700,
            color: 'var(--creator-accent-yellow)'
          }}
        >
          <span>OG yng.pranav4</span>
          {/* Animated Mini Dice Icon */}
          <span
            style={{
              display: 'inline-block',
              animation: 'spinDice 4s linear infinite'
            }}
          >
            🎲
          </span>
        </div>
      </div>

      <style>{`
        @keyframes spinDice {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </footer>
  );
}
