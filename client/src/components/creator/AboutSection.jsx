import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const CARDS = [
  {
    num: '01',
    role: 'THE BUILDER',
    title: 'BUILDING THINGS THAT EXISTED ONLY IN MY HEAD.',
    desc: 'Turning ideas into interactive websites, responsive web apps, developer utilities, and digital playgrounds that people actually enjoy using.',
    accent: '#ff5148',
    icon: '⚡',
    badge: 'FRONTEND & FULLSTACK'
  },
  {
    num: '02',
    role: 'THE PROBLEM SOLVER',
    title: 'I LIKE HARD PROBLEMS. SOMETIMES TOO MUCH.',
    desc: 'Competitive programming, core data structures, graph theory, time-complexity optimizations, and building rock-solid C game engines.',
    accent: '#ffc857',
    icon: '🧩',
    badge: 'DSA & ALGORITHMS'
  },
  {
    num: '03',
    role: 'THE EXPLORER',
    title: "ALWAYS EXPLORING WHAT'S NEXT.",
    desc: 'Machine learning models, generative AI integrations, Three.js 3D shaders, and experimenting with the bleeding edge of the web.',
    accent: '#58a5ef',
    icon: '🚀',
    badge: 'AI/ML & CREATIVE TECH'
  }
];

export default function AboutSection() {
  const sectionRef = useRef(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.about-card-item',
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.18,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%'
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        padding: '100px 24px',
        maxWidth: '1240px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 3
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '56px' }}>
        <span
          style={{
            fontFamily: 'var(--creator-font-mono)',
            fontSize: '12px',
            color: 'var(--creator-player-green)',
            letterSpacing: '0.15em',
            fontWeight: 700
          }}
        >
          // BEYOND THE GAME
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
            marginBottom: '16px'
          }}
        >
          NOT JUST HERE TO ROLL DICE.
        </h2>
        <p
          style={{
            fontSize: 'clamp(15px, 2vw, 18px)',
            color: 'var(--creator-text-secondary)',
            maxWidth: '720px',
            margin: '0 auto',
            lineHeight: 1.6
          }}
        >
          I'm an engineering student who enjoys building things beyond the classroom. From interactive websites and developer tools to competitive programming and AI-powered experiments, I love exploring how technology can turn an interesting idea into something real.
        </p>
      </div>

      {/* 3 Interactive Pillar Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}
      >
        {CARDS.map((card, i) => (
          <div
            key={i}
            className="about-card-item"
            style={{
              backgroundColor: 'var(--creator-bg-secondary)',
              border: '1px solid var(--creator-border)',
              borderRadius: '12px',
              padding: '32px 26px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
              cursor: 'default'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px)';
              e.currentTarget.style.borderColor = card.accent;
              e.currentTarget.style.boxShadow = `0 12px 30px rgba(0, 0, 0, 0.4), 0 0 20px ${card.accent}33`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'var(--creator-border)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Top Row: Number & Icon */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  fontFamily: 'var(--creator-font-mono)',
                  fontSize: '28px',
                  fontWeight: 800,
                  color: card.accent,
                  opacity: 0.9
                }}
              >
                {card.num}
              </span>
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(23, 23, 43, 0.8)',
                  border: `1px solid ${card.accent}55`,
                  fontFamily: 'var(--creator-font-mono)',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: card.accent
                }}
              >
                {card.badge}
              </span>
            </div>

            {/* Role Eyebrow */}
            <div
              style={{
                fontFamily: 'var(--creator-font-mono)',
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--creator-text-secondary)',
                letterSpacing: '0.08em'
              }}
            >
              {card.icon} {card.role}
            </div>

            {/* Headline */}
            <h3
              style={{
                fontSize: '20px',
                fontWeight: 700,
                lineHeight: 1.35,
                color: 'var(--creator-text-primary)',
                letterSpacing: '-0.01em'
              }}
            >
              {card.title}
            </h3>

            {/* Description */}
            <p
              style={{
                fontSize: '14px',
                color: 'var(--creator-text-secondary)',
                lineHeight: 1.6,
                marginTop: 'auto'
              }}
            >
              {card.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
