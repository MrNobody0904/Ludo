import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function CodeExperience() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // 1. Terminal window pin & parallax reveal
      const pinTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=200%',
          pin: true,
          scrub: 1,
          anticipatePin: 1
        }
      });

      // Step 1: Code lines slide in from alternating sides
      pinTimeline.fromTo(
        '.code-line-left',
        { x: -120, opacity: 0 },
        { x: 0, opacity: 1, stagger: 0.08, duration: 0.8 }
      );
      pinTimeline.fromTo(
        '.code-line-right',
        { x: 120, opacity: 0 },
        { x: 0, opacity: 1, stagger: 0.08, duration: 0.8 },
        '<'
      );

      // Step 2: Main Terminal scales in and takes focus
      pinTimeline.fromTo(
        '.code-terminal-card',
        { scale: 0.85, opacity: 0.3, y: 40 },
        { scale: 1, opacity: 1, y: 0, duration: 1.2 }
      );

      // Step 3: Floating code cards drift in 3D parallax
      pinTimeline.to('.code-floating-card-1', { y: -80, x: -30, rotate: -4, duration: 1.2 }, '<');
      pinTimeline.to('.code-floating-card-2', { y: 60, x: 40, rotate: 6, duration: 1.2 }, '<');

      // Step 4: Code fragments dissolve and characters assemble into large typography
      pinTimeline.to('.code-terminal-card', {
        scale: 0.9,
        opacity: 0.12,
        duration: 0.8
      });
      pinTimeline.fromTo(
        '.code-mantra-title',
        { scale: 0.7, opacity: 0, y: 50 },
        { scale: 1, opacity: 1, y: 0, duration: 1, ease: 'back.out(1.5)' }
      );
      pinTimeline.fromTo(
        '.code-mantra-word',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.15, duration: 0.8 },
        '<'
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="code-experience-section"
      ref={containerRef}
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: 'var(--creator-bg)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '80px 24px',
        overflow: 'hidden',
        zIndex: 2
      }}
    >
      {/* Section Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px', zIndex: 10 }}>
        <span
          style={{
            fontFamily: 'var(--creator-font-mono)',
            fontSize: '12px',
            color: 'var(--creator-accent-yellow)',
            letterSpacing: '0.15em',
            fontWeight: 700
          }}
        >
          // SIGNATURE FEATURE
        </span>
        <h2
          style={{
            fontSize: 'clamp(32px, 6vw, 56px)',
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            textTransform: 'uppercase',
            color: 'var(--creator-text-primary)',
            letterSpacing: '-0.02em',
            marginTop: '6px'
          }}
        >
          ROLL THROUGH MY CODE
        </h2>
      </div>

      {/* Main Terminal Window Frame */}
      <div
        className="code-terminal-card"
        style={{
          width: '100%',
          maxWidth: '820px',
          backgroundColor: '#1b1b32',
          border: '1px solid rgba(255, 200, 87, 0.3)',
          borderRadius: '12px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(255, 200, 87, 0.1)',
          overflow: 'hidden',
          zIndex: 5,
          position: 'relative'
        }}
      >
        {/* Terminal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 18px',
            backgroundColor: 'rgba(34, 34, 58, 0.95)',
            borderBottom: '1px solid var(--creator-border)'
          }}
        >
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ff5f56', display: 'inline-block' }} />
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ffbd2e', display: 'inline-block' }} />
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#27c93f', display: 'inline-block' }} />
          </div>
          <span
            style={{
              fontFamily: 'var(--creator-font-mono)',
              fontSize: '12px',
              color: 'var(--creator-text-secondary)',
              letterSpacing: '0.06em'
            }}
          >
            pranav.config.js
          </span>
          <span style={{ fontSize: '11px', color: 'var(--creator-accent-yellow)', fontFamily: 'var(--creator-font-mono)' }}>
            UTF-8
          </span>
        </div>

        {/* Code Content Body */}
        <div
          style={{
            padding: '24px 28px',
            fontFamily: 'var(--creator-font-mono)',
            fontSize: 'clamp(12px, 1.8vw, 15px)',
            lineHeight: 1.7,
            color: 'var(--creator-text-primary)'
          }}
        >
          <div className="code-line-left">
            <span style={{ color: '#ff5148' }}>const </span>
            <span style={{ color: '#58a5ef' }}>pranav </span>
            <span style={{ color: '#aaa9b8' }}>= {'{'}</span>
          </div>

          <div className="code-line-left" style={{ paddingLeft: '24px' }}>
            <span style={{ color: '#aaa9b8' }}>name: </span>
            <span style={{ color: '#5dce9b' }}>"Pranav Raj"</span>,
          </div>

          <div className="code-line-left" style={{ paddingLeft: '24px' }}>
            <span style={{ color: '#aaa9b8' }}>username: </span>
            <span style={{ color: '#ffc857' }}>"OG yng.pranav4"</span>,
          </div>

          <div className="code-line-left" style={{ paddingLeft: '24px', marginTop: '6px' }}>
            <span style={{ color: '#aaa9b8' }}>role: [</span>
          </div>
          <div className="code-line-left" style={{ paddingLeft: '48px' }}>
            <span style={{ color: '#5dce9b' }}>"Developer"</span>, <span style={{ color: '#5dce9b' }}>"Builder"</span>, <span style={{ color: '#5dce9b' }}>"Problem Solver"</span>
          </div>
          <div className="code-line-left" style={{ paddingLeft: '24px' }}>
            <span style={{ color: '#aaa9b8' }}>],</span>
          </div>

          <div className="code-line-right" style={{ paddingLeft: '24px', marginTop: '6px' }}>
            <span style={{ color: '#aaa9b8' }}>interests: [</span>
          </div>
          <div className="code-line-right" style={{ paddingLeft: '48px' }}>
            <span style={{ color: '#58a5ef' }}>"Web Development"</span>, <span style={{ color: '#58a5ef' }}>"Competitive Programming"</span>,
          </div>
          <div className="code-line-right" style={{ paddingLeft: '48px' }}>
            <span style={{ color: '#58a5ef' }}>"AI & ML"</span>, <span style={{ color: '#58a5ef' }}>"Creative Coding"</span>
          </div>
          <div className="code-line-right" style={{ paddingLeft: '24px' }}>
            <span style={{ color: '#aaa9b8' }}>],</span>
          </div>

          <div className="code-line-right" style={{ paddingLeft: '24px', marginTop: '6px' }}>
            <span style={{ color: '#aaa9b8' }}>philosophy: </span>
            <span style={{ color: '#ffc857' }}>"Build something interesting."</span>
          </div>

          <div className="code-line-right">
            <span style={{ color: '#aaa9b8' }}>{'};'}</span>
          </div>

          <div className="code-line-right" style={{ marginTop: '14px' }}>
            <span style={{ color: '#ff5148' }}>function </span>
            <span style={{ color: '#58a5ef' }}>createSomething</span>
            <span style={{ color: '#aaa9b8' }}>() {'{'}</span>
          </div>
          <div className="code-line-right" style={{ paddingLeft: '24px' }}>
            <span style={{ color: '#ff5148' }}>return </span>
            <span style={{ color: '#5dce9b' }}>"Ideas into reality."</span>;
          </div>
          <div className="code-line-right">
            <span style={{ color: '#aaa9b8' }}>{'}'}</span>
          </div>
        </div>
      </div>

      {/* Floating Parallax Decorative Snippet Cards */}
      <div
        className="code-floating-card-1"
        style={{
          position: 'absolute',
          top: '22%',
          left: '8%',
          backgroundColor: 'rgba(23, 23, 43, 0.9)',
          border: '1px solid var(--creator-border)',
          borderRadius: '8px',
          padding: '12px 18px',
          fontFamily: 'var(--creator-font-mono)',
          fontSize: '12px',
          color: 'var(--creator-player-green)',
          pointerEvents: 'none',
          zIndex: 3
        }}
      >
        <span>// compilation target: WebAssembly (C)</span>
      </div>

      <div
        className="code-floating-card-2"
        style={{
          position: 'absolute',
          bottom: '20%',
          right: '8%',
          backgroundColor: 'rgba(23, 23, 43, 0.9)',
          border: '1px solid var(--creator-border)',
          borderRadius: '8px',
          padding: '12px 18px',
          fontFamily: 'var(--creator-font-mono)',
          fontSize: '12px',
          color: 'var(--creator-accent-yellow)',
          pointerEvents: 'none',
          zIndex: 3
        }}
      >
        <span>&lt;ThreeCanvas&gt; 🎲 4 Pawns Active &lt;/&gt;</span>
      </div>

      {/* Assembled Typography Climax: ROLL. CODE. CREATE. REPEAT. */}
      <div
        className="code-mantra-title"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          width: '90%',
          maxWidth: '1000px',
          zIndex: 8,
          pointerEvents: 'none'
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(38px, 8vw, 84px)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            textTransform: 'uppercase',
            color: 'var(--creator-text-primary)'
          }}
        >
          <span className="code-mantra-word" style={{ color: '#ff5148', display: 'inline-block', marginRight: '16px' }}>ROLL.</span>
          <span className="code-mantra-word" style={{ color: '#58a5ef', display: 'inline-block', marginRight: '16px' }}>CODE.</span>
          <span className="code-mantra-word" style={{ color: '#ffc857', display: 'inline-block', marginRight: '16px' }}>CREATE.</span>
          <span className="code-mantra-word" style={{ color: '#5dce9b', display: 'inline-block' }}>REPEAT.</span>
        </div>
      </div>
    </section>
  );
}
