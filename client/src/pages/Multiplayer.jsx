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

export default function Multiplayer({
  onCreateRoom,
  onJoinRoom,
  onBack,
  initialRoomCode = ''
}) {
  const [mode, setMode] = useState(initialRoomCode ? 'join' : 'create'); // 'create' or 'join'
  const [name, setName] = useState(localStorage.getItem('ludo_player_name') || 'Player');
  const [preferredColor, setPreferredColor] = useState('red');
  const [joinCode, setJoinCode] = useState(initialRoomCode);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    localStorage.setItem('ludo_player_name', name.trim());

    setIsLoading(true);
    try {
      if (mode === 'create') {
        await onCreateRoom({ name: name.trim(), color: preferredColor });
      } else {
        if (!joinCode.trim()) {
          setError('Please enter a 6-letter room code');
          setIsLoading(false);
          return;
        }
        await onJoinRoom({ roomCode: joinCode.trim().toUpperCase(), name: name.trim() });
      }
    } catch (err) {
      setError(err.message || 'Failed to connect');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="page-container" style={{ maxWidth: '520px' }}>
      <Card style={{ width: '100%', padding: '32px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 className="headline-md">Multiplayer</h2>
          <Button variant="secondary" onClick={onBack} style={{ minWidth: '80px', height: '34px', fontSize: '13px' }}>
            ← Back
          </Button>
        </div>

        {/* Tab Toggle: Create vs Join */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
          <button
            type="button"
            onClick={() => { setMode('create'); setError(''); }}
            style={{
              height: '42px',
              backgroundColor: mode === 'create' ? 'var(--color-secondary)' : 'transparent',
              color: mode === 'create' ? 'var(--color-primary)' : 'var(--color-secondary)',
              border: `1px solid ${mode === 'create' ? 'var(--color-secondary)' : 'var(--color-neutral)'}`,
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
              cursor: 'pointer',
              textTransform: 'uppercase'
            }}
          >
            Create Room
          </button>
          <button
            type="button"
            onClick={() => { setMode('join'); setError(''); }}
            style={{
              height: '42px',
              backgroundColor: mode === 'join' ? 'var(--color-secondary)' : 'transparent',
              color: mode === 'join' ? 'var(--color-primary)' : 'var(--color-secondary)',
              border: `1px solid ${mode === 'join' ? 'var(--color-secondary)' : 'var(--color-neutral)'}`,
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
              cursor: 'pointer',
              textTransform: 'uppercase'
            }}
          >
            Join with Code
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Input
            label="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            maxLength={18}
          />

          {mode === 'create' ? (
            <div>
              <div className="label-sm" style={{ marginBottom: '8px', opacity: 0.85 }}>
                Preferred Color
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {COLORS.map((c) => {
                  const isSelected = preferredColor === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setPreferredColor(c.id)}
                      style={{
                        height: '44px',
                        backgroundColor: c.hex,
                        border: isSelected ? '3px solid var(--color-tertiary)' : '1px solid var(--color-neutral)',
                        borderRadius: 'var(--radius-sm)',
                        color: '#ffffff',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transform: isSelected ? 'scale(1.04)' : 'none'
                      }}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <Input
              label="6-Character Room Code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="e.g. ABC123"
              maxLength={6}
              style={{ letterSpacing: '0.15em', fontWeight: 700 }}
            />
          )}

          {error && (
            <div style={{ color: 'var(--color-tertiary)', fontSize: '13px', fontWeight: 600 }}>
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={isLoading || !name.trim()}
            style={{ height: '48px', marginTop: '10px', fontSize: '15px' }}
          >
            {isLoading ? 'Connecting...' : mode === 'create' ? 'Create & Get Link' : 'Join Room'}
          </Button>
        </form>
      </Card>
    </main>
  );
}
