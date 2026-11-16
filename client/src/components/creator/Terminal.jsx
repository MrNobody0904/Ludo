import React, { useState, useEffect, useRef } from 'react';

const SCRIPT_LINES = [
  { cmd: 'whoami', output: ['> Pranav Raj'] },
  { cmd: 'username', output: ['> OG yng.pranav4'] },
  { cmd: 'current_status', output: ['> Building. Learning. Experimenting.'] },
  { cmd: 'interests', output: ['> Web Development', '> Competitive Programming', '> AI / ML', '> Creative Coding'] },
  { cmd: 'current_mission', output: ['> Turning ideas into reality.'] },
  { cmd: 'motto', output: ['> Build. Break. Learn. Repeat.'] }
];

export default function Terminal() {
  const [displayedLines, setDisplayedLines] = useState([]);
  const [currentCmdIndex, setCurrentCmdIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const terminalEndRef = useRef(null);
  const audioCtxRef = useRef(null);

  // Play subtle futuristic keyclick audio
  const playClick = () => {
    if (!audioEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!audioCtxRef.current && AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current) {
        const osc = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600 + Math.random() * 400, audioCtxRef.current.currentTime);
        gain.gain.setValueAtTime(0.015, audioCtxRef.current.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(audioCtxRef.current.destination);
        osc.start();
        osc.stop(audioCtxRef.current.currentTime + 0.04);
      }
    } catch {
      // Audio fallback
    }
  };

  useEffect(() => {
    if (currentCmdIndex >= SCRIPT_LINES.length) {
      setIsTyping(false);
      return;
    }

    const targetItem = SCRIPT_LINES[currentCmdIndex];
    const fullCmd = targetItem.cmd;

    if (currentText.length < fullCmd.length) {
      const timer = setTimeout(() => {
        setCurrentText(fullCmd.slice(0, currentText.length + 1));
        playClick();
      }, 45 + Math.random() * 30);
      return () => clearTimeout(timer);
    } else {
      // Finished typing command, reveal outputs
      const timer = setTimeout(() => {
        setDisplayedLines(prev => [
          ...prev,
          { type: 'cmd', text: `$ ${fullCmd}` },
          ...targetItem.output.map(out => ({ type: 'output', text: out }))
        ]);
        setCurrentText('');
        setCurrentCmdIndex(prev => prev + 1);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [currentCmdIndex, currentText, audioEnabled]);

  const handleRestart = () => {
    setDisplayedLines([]);
    setCurrentCmdIndex(0);
    setCurrentText('');
    setIsTyping(true);
  };

  return (
    <section
      style={{
        padding: '80px 24px',
        maxWidth: '920px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 3
      }}
    >
      <div
        style={{
          backgroundColor: '#121224',
          border: '1px solid rgba(255, 200, 87, 0.3)',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 30px rgba(255, 200, 87, 0.08)'
        }}
      >
        {/* Terminal Title Bar */}
        <div
          style={{
            backgroundColor: '#1a1a30',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--creator-border)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ff5f56' }} />
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#27c93f' }} />
            <span
              style={{
                fontFamily: 'var(--creator-font-mono)',
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--creator-accent-yellow)',
                marginLeft: '12px',
                letterSpacing: '0.08em'
              }}
            >
              PRANAV.EXE — DEVELOPER PROFILE
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setAudioEnabled(prev => !prev)}
              style={{
                background: 'none',
                border: '1px solid var(--creator-border)',
                color: 'var(--creator-text-secondary)',
                fontSize: '11px',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontFamily: 'var(--creator-font-mono)'
              }}
            >
              {audioEnabled ? '🔊 SFX' : '🔇 MUTE'}
            </button>
            <button
              type="button"
              onClick={handleRestart}
              disabled={isTyping}
              style={{
                background: 'var(--creator-accent-yellow)',
                border: 'none',
                color: '#17172b',
                fontSize: '11px',
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: '4px',
                cursor: isTyping ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--creator-font-mono)',
                opacity: isTyping ? 0.5 : 1
              }}
            >
              RUN AGAIN ↻
            </button>
          </div>
        </div>

        {/* Terminal Screen Body */}
        <div
          style={{
            padding: '24px 28px',
            minHeight: '340px',
            fontFamily: 'var(--creator-font-mono)',
            fontSize: '14px',
            lineHeight: 1.8,
            color: 'var(--creator-text-primary)'
          }}
        >
          {displayedLines.map((line, i) => (
            <div key={i} style={{ marginBottom: line.type === 'cmd' ? '2px' : '4px' }}>
              {line.type === 'cmd' ? (
                <span style={{ color: 'var(--creator-accent-yellow)', fontWeight: 700 }}>
                  {line.text}
                </span>
              ) : (
                <span style={{ color: 'var(--creator-player-green)', paddingLeft: '14px' }}>
                  {line.text}
                </span>
              )}
            </div>
          ))}

          {/* Currently typing active command */}
          {currentCmdIndex < SCRIPT_LINES.length && (
            <div>
              <span style={{ color: 'var(--creator-accent-yellow)', fontWeight: 700 }}>$ </span>
              <span style={{ color: '#ffffff', fontWeight: 600 }}>{currentText}</span>
              <span
                style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '15px',
                  backgroundColor: 'var(--creator-accent-yellow)',
                  marginLeft: '4px',
                  verticalAlign: 'middle',
                  animation: 'blink 0.8s infinite'
                }}
              />
            </div>
          )}

          <div ref={terminalEndRef} />
        </div>
      </div>
    </section>
  );
}
