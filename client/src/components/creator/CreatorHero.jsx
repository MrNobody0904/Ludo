import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import CreatorScene from './CreatorScene';

export default function CreatorHero({ onNavigate, onExploreClick }) {
  const heroRef = useRef(null);

  useEffect(() => {
    if (!heroRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // 1. Status badge & eyebrow slide in
      tl.fromTo(
        ['.creator-status-badge', '.creator-floating-tag', '.creator-eyebrow'],
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1 }
      );

      // 2. Letters of "PRANAV" slam in with bounce
      tl.fromTo(
        '.creator-letter',
        { y: 60, opacity: 0, rotateX: -60 },
        { y: 0, opacity: 1, rotateX: 0, duration: 0.7, stagger: 0.05, ease: 'back.out(2)' },
        '-=0.3'
      );

      // 3. Subheadings fade & slide up
      tl.fromTo(
        ['.creator-hero-hook', '.creator-hero-bio'],
        { y: 25, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.12 },
        '-=0.3'
      );

      // 4. CTA buttons pop
      tl.fromTo(
        '.creator-hero-cta button',
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(1.8)' },
        '-=0.2'
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const pranavLetters = ['P', 'R', 'A', 'N', 'A', 'V', '.'];

  return (
    <section ref={heroRef} className="creator-hero">
      <div className="creator-hero-layout">
        <div className="creator-hero-content">
          {/* Status Indicator & Floating Tag */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <div className="creator-status-badge">
              <span className="pulse-dot" />
              <span>CURRENTLY BUILDING LUDO</span>
            </div>
            <span className="creator-floating-tag">
              // ROLLING IDEAS INTO REALITY.
            </span>
          </div>

          {/* Eyebrow */}
          <div className="creator-eyebrow">
            THE HUMAN BEHIND THE DICE.
          </div>

          {/* Main Headline */}
          <div className="creator-hero-title">
            <div style={{ fontSize: '0.45em', letterSpacing: '0.04em', color: 'var(--creator-text-secondary)', marginBottom: '4px' }}>
              YO, I'M
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {pranavLetters.map((char, i) => (
                <span
                  key={i}
                  className={`creator-letter ${char !== '.' ? 'highlight' : ''}`}
                >
                  {char}
                </span>
              ))}
            </div>
          </div>

          {/* Subtitle hook */}
          <p className="creator-hero-hook">
            "I'm the developer who decided to build a Ludo game instead of just playing one."
          </p>

          {/* Detailed bio */}
          <p className="creator-hero-bio">
            I'm <strong>Pranav Raj</strong> — known online as <strong>OG yng.pranav4</strong>. I'm a developer, engineering student, and builder exploring web development, competitive programming, AI/ML, and creative technology. I enjoy turning random ideas into real products and making the internet a little more interesting.
          </p>

          {/* Hero Actions */}
          <div className="creator-hero-cta">
            <button
              type="button"
              className="btn-creator-primary"
              onClick={onExploreClick}
            >
              EXPLORE MY WORLD ↓
            </button>
            <button
              type="button"
              className="btn-creator-secondary"
              onClick={() => onNavigate('/')}
            >
              BACK TO GAME ↗
            </button>
          </div>
        </div>

        {/* 3D Interactive Ludo Universe */}
        <div className="creator-hero-3d">
          <CreatorScene />
        </div>
      </div>
    </section>
  );
}
