import React, { useState } from 'react';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

const COLORS = [
  { id: 'red', label: 'Red', hex: '#eb3322' },
  { id: 'green', label: 'Green', hex: '#10b981' },
  { id: 'yellow', label: 'Yellow', hex: '#f59e0b' },
  { id: 'blue', label: 'Blue', hex: '#3b82f6' }
];

const DIFFICULTIES = [
  { id: 0, label: 'Easy' },
  { id: 1, label: 'Medium' },
  { id: 2, label: 'Hard' }
];

export default function SingleSetup({ onStartSinglePlayer, onBack }) {
  const [name, setName] = useState(localStorage.getItem('ludo_player_name') || 'Player');
  const [selectedColor, setSelectedColor] = useState('red');
  const [botCount, setBotCount] = useState(3);
  const [difficulty, setDifficulty] = useState(1); // Medium default
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    localStorage.setItem('ludo_player_name', name.trim());
    setIsLoading(true);
    try {
      await onStartSinglePlayer({
        name: name.trim(),
        color: selectedColor,
        botCount,
        difficulty
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="page-container" style={{ maxWidth: '520px' }}>
      <Card style={{ width: '100%', padding: '32px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 className="headline-md">Single Player</h2>
          <Button variant="secondary" onClick={onBack} style={{ minWidth: '80px', height: '34px', fontSize: '13px' }}>
            ← Back
          </Button>
        </div>

        <form onSubmit={handleStart} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Player Name */}
          <Input
            label="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            maxLength={18}
          />

          {/* Color Picker */}
          <div>
            <div className="label-sm" style={{ marginBottom: '8px', opacity: 0.85 }}>
              Choose Your Color
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              {COLORS.map((c) => {
                const isSelected = selectedColor === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedColor(c.id)}
                    style={{
                      height: '44px',
                      backgroundColor: c.hex,
                      border: isSelected ? '3px solid var(--color-tertiary)' : '1px solid var(--color-neutral)',
                      borderRadius: 'var(--radius-sm)',
                      color: '#ffffff',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '13px',
                      textTransform: 'uppercase',
                      transition: 'transform 0.1s ease',
                      transform: isSelected ? 'scale(1.04)' : 'none'
                    }}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bot Count */}
          <div>
            <div className="label-sm" style={{ marginBottom: '8px', opacity: 0.85 }}>
              Number of Bots ({botCount})
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {[1, 2, 3].map((num) => {
                const isSelected = botCount === num;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setBotCount(num)}
                    style={{
                      height: '42px',
                      backgroundColor: isSelected ? 'var(--color-secondary)' : 'transparent',
                      color: isSelected ? 'var(--color-primary)' : 'var(--color-secondary)',
                      border: `1px solid ${isSelected ? 'var(--color-secondary)' : 'var(--color-neutral)'}`,
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {num} {num === 1 ? 'Bot' : 'Bots'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bot Difficulty */}
          <div>
            <div className="label-sm" style={{ marginBottom: '8px', opacity: 0.85 }}>
              Bot Difficulty
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {DIFFICULTIES.map((d) => {
                const isSelected = difficulty === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDifficulty(d.id)}
                    style={{
                      height: '42px',
                      backgroundColor: isSelected ? 'var(--color-tertiary)' : 'transparent',
                      color: isSelected ? '#1a1a1a' : 'var(--color-secondary)',
                      border: `1px solid ${isSelected ? 'var(--color-tertiary)' : 'var(--color-neutral)'}`,
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading || !name.trim()}
            style={{ height: '48px', marginTop: '10px', fontSize: '16px' }}
          >
            {isLoading ? 'Setting up...' : 'Start Game'}
          </Button>
        </form>
      </Card>
    </main>
  );
}
