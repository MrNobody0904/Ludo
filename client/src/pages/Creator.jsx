import React, { useEffect } from 'react';
import '../styles/creator.css';

import CreatorHero from '../components/creator/CreatorHero';
import CodeExperience from '../components/creator/CodeExperience';
import AboutSection from '../components/creator/AboutSection';
import TechConstellation from '../components/creator/TechConstellation';
import Terminal from '../components/creator/Terminal';
import GameStory from '../components/creator/GameStory';
import DiceInteraction from '../components/creator/DiceInteraction';
import CreatorFooter from '../components/creator/CreatorFooter';

export default function Creator({ onNavigate }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleExploreClick = () => {
    const nextSec = document.getElementById('code-experience-section');
    if (nextSec) {
      nextSec.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="creator-page">
      {/* Top Navigation */}
      <header className="creator-nav">
        <div className="creator-brand">
          <span>LUDO</span>
          <span className="creator-brand-slash">/</span>
          <span>CREATOR</span>
        </div>
        <button
          type="button"
          className="creator-nav-back"
          onClick={() => onNavigate('/')}
        >
          BACK TO GAME ↗
        </button>
      </header>

      {/* 1. Hero Section (Meet the Creator) */}
      <CreatorHero
        onNavigate={onNavigate}
        onExploreClick={handleExploreClick}
      />

      {/* 2. Signature Feature: Roll Through My Code (ScrollTrigger) */}
      <CodeExperience />

      {/* 3. About Me: Beyond The Game */}
      <AboutSection />

      {/* 4. Tech Toolkit: My Digital Toys */}
      <TechConstellation />

      {/* 5. Personality: PRANAV.EXE Interactive Terminal */}
      <Terminal />

      {/* 6. The Game Developer Story Timeline */}
      <GameStory />

      {/* 7. Interactive Ludo Moment */}
      <DiceInteraction />

      {/* 8. Closing Section */}
      <CreatorFooter onNavigate={onNavigate} />
    </div>
  );
}
