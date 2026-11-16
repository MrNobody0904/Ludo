import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const STORY_STEPS = [
  {
    step: '01',
    title: 'THE IDEA',
    desc: 'A simple thought: What if I built my own Ludo game from scratch?',
    tech: 'Game Architecture',
    color: '#ff5148'
  },
  {
    step: '02',
    title: 'THE ENGINE',
    desc: 'Building the core game rules, track mathematics, and bot heuristics in pure C, compiling to WebAssembly with Emscripten.',
    tech: 'C & WebAssembly',
    color: '#ffc857'
  },
  {
    step: '03',
    title: 'THE MULTIPLAYER',
    desc: 'Building an authoritative real-time game server with Node.js, Express, and Socket.IO to eliminate client-side cheating.',
    tech: 'Node.js & Socket.IO',
    color: '#58a5ef'
  },
  {
    step: '04',
    title: 'THE EXPERIENCE',
    desc: 'Crafting the responsive interface using React, Three.js 3D dice tumbling, and GSAP timelines for playful motion.',
    tech: 'React, Three.js & GSAP',
    color: '#5dce9b'
  },
  {
    step: '05',
    title: 'THE GAME',
    desc: 'A complete, polished, and delightful Ludo world that friends anywhere can play together on any screen.',
    tech: 'LUDO Universe',
    color: '#ffc857'
  }
];

export default function GameStory() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.story-timeline-card',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 75%'
          }
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      style={{
        padding: '100px 24px',
        maxWidth: '1240px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 3
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <span
          style={{
            fontFamily: 'var(--creator-font-mono)',
            fontSize: '12px',
            color: 'var(--creator-accent-red)',
            letterSpacing: '0.15em',
            fontWeight: 700
          }}
        >
          // THE GAME DEVELOPER STORY
        </span>
        <h2
          style={{
            fontSize: 'clamp(32px, 6vw, 56px)',
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            textTransform: 'uppercase',
            color: 'var(--creator-text-primary)',
            letterSpacing: '-0.02em',
            marginTop: '8px'
          }}
        >
          FROM AN IDEA TO A PLAYABLE WORLD.
        </h2>
      </div>

      {/* Timeline Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          position: 'relative'
        }}
      >
        {STORY_STEPS.map((item, i) => (
          <div
            key={i}
            className="story-timeline-card"
            style={{
              backgroundColor: 'var(--creator-bg-secondary)',
              border: '1px solid var(--creator-border)',
              borderRadius: '12px',
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              position: 'relative',
              transition: 'transform 0.2s ease, border-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = item.color;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'var(--creator-border)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  fontFamily: 'var(--creator-font-mono)',
                  fontSize: '24px',
                  fontWeight: 800,
                  color: item.color
                }}
              >
                {item.step}
              </span>
              <span
                style={{
                  fontFamily: 'var(--creator-font-mono)',
                  fontSize: '11px',
                  color: 'var(--creator-text-secondary)',
                  opacity: 0.8
                }}
              >
                {item.tech}
              </span>
            </div>

            <h3
              style={{
                fontSize: '17px',
                fontWeight: 700,
                color: 'var(--creator-text-primary)',
                letterSpacing: '0.02em',
                textTransform: 'uppercase'
              }}
            >
              {item.title}
            </h3>

            <p style={{ fontSize: '13px', color: 'var(--creator-text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
