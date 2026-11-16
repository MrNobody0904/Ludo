import React, { useState } from 'react';

const TECH_ITEMS = [
  { name: 'C', category: 'Systems', desc: 'Core game engine, memory-efficient bitwise state & WebAssembly compilation', color: '#ff5148' },
  { name: 'C++', category: 'Systems', desc: 'High-performance competitive programming & data structures', color: '#ff5148' },
  { name: 'JavaScript', category: 'Fullstack', desc: 'Modern ES6+, async architectures & interactive browser applications', color: '#ffc857' },
  { name: 'Python', category: 'AI & Data', desc: 'Algorithm prototyping, scripting & machine learning pipelines', color: '#58a5ef' },
  { name: 'React', category: 'Frontend', desc: 'Component architectures, state synchronization & virtual DOM', color: '#58a5ef' },
  { name: 'Three.js', category: '3D & Graphics', desc: 'WebGL rendering, custom geometries, procedural shaders & R3F', color: '#5dce9b' },
  { name: 'GSAP', category: 'Animation', desc: 'Cinematic timelines, ScrollTrigger scrub sequences & micro-interactions', color: '#5dce9b' },
  { name: 'Node.js', category: 'Backend', desc: 'Event-driven servers, REST APIs & real-time socket connections', color: '#5dce9b' },
  { name: 'Express', category: 'Backend', desc: 'Robust routing, CORS handling & microservices', color: '#aaa9b8' },
  { name: 'Socket.IO', category: 'Real-time', desc: 'Bi-directional WebSockets for multiplayer room synchronization', color: '#ffc857' },
  { name: 'Tailwind CSS', category: 'Frontend', desc: 'Rapid utility-first styling & responsive layouts', color: '#58a5ef' },
  { name: 'HTML & CSS', category: 'Web Core', desc: 'Semantic markup, accessibility & responsive design tokens', color: '#ff5148' },
  { name: 'Git', category: 'DevOps', desc: 'Version control, atomic commits, branching & open-source workflows', color: '#ff5148' },
  { name: 'MongoDB', category: 'Database', desc: 'NoSQL document schemas, indexing & high-throughput persistence', color: '#5dce9b' },
  { name: 'NumPy', category: 'AI & Data', desc: 'N-dimensional matrix calculations & scientific numerical computing', color: '#58a5ef' },
  { name: 'Pandas', category: 'AI & Data', desc: 'Data frame manipulation, preprocessing & statistical analysis', color: '#ffc857' }
];

export default function TechConstellation() {
  const [selectedTech, setSelectedTech] = useState(TECH_ITEMS[0]);
  const [activeFilter, setActiveFilter] = useState('ALL');

  const categories = ['ALL', 'Systems', 'Frontend', 'Backend', '3D & Graphics', 'AI & Data'];

  const filteredItems = activeFilter === 'ALL'
    ? TECH_ITEMS
    : TECH_ITEMS.filter(t => t.category.toLowerCase().includes(activeFilter.toLowerCase()) || (activeFilter === 'Frontend' && (t.category === 'Frontend' || t.category === 'Web Core' || t.category === '3D & Graphics')));

  return (
    <section
      style={{
        padding: '100px 24px',
        maxWidth: '1240px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 3
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <span
          style={{
            fontFamily: 'var(--creator-font-mono)',
            fontSize: '12px',
            color: 'var(--creator-accent-yellow)',
            letterSpacing: '0.15em',
            fontWeight: 700
          }}
        >
          // MY DIGITAL TOYS
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
          MY TECH TOOLKIT
        </h2>
        <p style={{ color: 'var(--creator-text-secondary)', fontSize: '15px', marginTop: '8px' }}>
          Technologies, frameworks, and instruments I use to turn lines of code into living experiences.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          flexWrap: 'wrap',
          marginBottom: '36px'
        }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveFilter(cat)}
            style={{
              background: activeFilter === cat ? 'var(--creator-accent-yellow)' : 'var(--creator-bg-secondary)',
              color: activeFilter === cat ? '#17172b' : 'var(--creator-text-secondary)',
              border: `1px solid ${activeFilter === cat ? 'var(--creator-accent-yellow)' : 'var(--creator-border)'}`,
              padding: '6px 16px',
              borderRadius: '999px',
              fontFamily: 'var(--creator-font-mono)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Interactive Constellation Cloud */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '14px',
          maxWidth: '920px',
          margin: '0 auto 36px auto'
        }}
      >
        {filteredItems.map((tech) => {
          const isSelected = selectedTech?.name === tech.name;
          return (
            <button
              key={tech.name}
              type="button"
              onClick={() => setSelectedTech(tech)}
              onMouseEnter={() => setSelectedTech(tech)}
              style={{
                backgroundColor: isSelected ? 'var(--creator-bg-secondary)' : 'rgba(34, 34, 58, 0.45)',
                border: `1.5px solid ${isSelected ? tech.color : 'var(--creator-border)'}`,
                color: isSelected ? 'var(--creator-text-primary)' : 'var(--creator-text-secondary)',
                borderRadius: '8px',
                padding: '12px 22px',
                fontFamily: 'var(--creator-font-mono)',
                fontSize: '15px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                cursor: 'pointer',
                transform: isSelected ? 'scale(1.08) translateY(-3px)' : 'none',
                boxShadow: isSelected ? `0 8px 24px ${tech.color}44` : 'none',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: tech.color
                }}
              />
              <span>{tech.name}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Tech Detail Drawer */}
      {selectedTech && (
        <div
          style={{
            maxWidth: '640px',
            margin: '0 auto',
            backgroundColor: 'var(--creator-bg-secondary)',
            border: `1px solid ${selectedTech.color}`,
            borderRadius: '12px',
            padding: '20px 24px',
            textAlign: 'center',
            boxShadow: `0 12px 30px rgba(0, 0, 0, 0.4), 0 0 20px ${selectedTech.color}22`,
            transition: 'all 0.25s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--creator-text-primary)', fontFamily: 'var(--creator-font-mono)' }}>
              {selectedTech.name}
            </span>
            <span
              style={{
                fontFamily: 'var(--creator-font-mono)',
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: 'rgba(23, 23, 43, 0.8)',
                color: selectedTech.color,
                border: `1px solid ${selectedTech.color}44`
              }}
            >
              {selectedTech.category}
            </span>
          </div>
          <p style={{ color: 'var(--creator-text-secondary)', fontSize: '14px', lineHeight: 1.5, margin: 0 }}>
            {selectedTech.desc}
          </p>
        </div>
      )}
    </section>
  );
}
