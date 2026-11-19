import React, { useState, useEffect, useCallback } from 'react';
import { runPageTransition } from './animations/pageTransition';
import socket from './socket';

import Landing from './pages/Landing';
import SingleSetup from './pages/SingleSetup';
import Multiplayer from './pages/Multiplayer';
import Lobby from './pages/Lobby';
import Game from './pages/Game';
import Creator from './pages/Creator';

// Server URL — set VITE_SERVER_URL in your .env or Render/Vercel env vars
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';

export default function App() {
  const [currentPath, setCurrentPath] = useState(() => {
    return window.location.pathname || '/';
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('ludo_theme') || 'dark';
  });

  const [animationsEnabled, setAnimationsEnabled] = useState(() => {
    return localStorage.getItem('ludo_animations') !== 'false';
  });

  const [roomState, setRoomState] = useState(null);
  const [currentPlayerId, setCurrentPlayerId] = useState(() => {
    return localStorage.getItem('ludo_player_id') || null;
  });
  const [validMoves, setValidMoves] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Apply Theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ludo_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleAnimations = () => {
    setAnimationsEnabled(prev => {
      const next = !prev;
      localStorage.setItem('ludo_animations', String(next));
      return next;
    });
  };

  // Smooth route navigation with Red Screen Wipe transition
  const navigate = useCallback((toPath) => {
    runPageTransition(() => {
      window.history.pushState({}, '', toPath);
      setCurrentPath(toPath);
    });
  }, []);

  // Listen to browser popstate (back/forward)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Socket.IO event listeners
  useEffect(() => {
    const onRoomJoined = (data) => {
      setCurrentPlayerId(data.playerId);
      localStorage.setItem('ludo_player_id', data.playerId);
      localStorage.setItem('ludo_room_code', data.roomCode);
      setRoomState(data.roomState);

      const targetPath = `/room/${data.roomCode}`;
      if (window.location.pathname !== targetPath) {
        navigate(targetPath);
      }
    };

    const onGameStateUpdate = (state) => {
      setRoomState(state);
      // Clear valid moves when it's no longer the move phase
      if (state?.engineState?.phase !== 1) {
        setValidMoves([]);
      }
    };

    const onGameStarted = (data) => {
      setRoomState(data.gameState);
    };

    const onDiceRolled = (data) => {
      // Server bundles validMoves + gameState in dice_rolled to reduce round-trips
      if (data.validMoves) setValidMoves(data.validMoves);
      if (data.gameState) setRoomState(data.gameState);
    };

    const onChatMessage = (message) => {
      setRoomState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          chatMessages: [...(prev.chatMessages || []), message]
        };
      });
    };

    const onErrorMsg = (data) => {
      setErrorMessage(data.message);
      setTimeout(() => setErrorMessage(''), 3500);
    };

    socket.on('room_joined', onRoomJoined);
    socket.on('game_state_update', onGameStateUpdate);
    socket.on('game_started', onGameStarted);
    socket.on('dice_rolled', onDiceRolled);
    socket.on('chat_message', onChatMessage);
    socket.on('error_message', onErrorMsg);

    // Auto-reconnect ONLY if we have both a saved room AND player ID
    // AND the socket is connected (avoid firing on every render)
    const savedRoom = localStorage.getItem('ludo_room_code');
    const savedPlayerId = localStorage.getItem('ludo_player_id');
    const savedName = localStorage.getItem('ludo_player_name') || 'Player';

    if (savedRoom && savedPlayerId) {
      // Wait for socket to connect before emitting
      if (socket.connected) {
        socket.emit('join_room', {
          roomCode: savedRoom,
          playerName: savedName,
          playerId: savedPlayerId
        });
      } else {
        socket.once('connect', () => {
          socket.emit('join_room', {
            roomCode: savedRoom,
            playerName: savedName,
            playerId: savedPlayerId
          });
        });
      }
    }

    return () => {
      socket.off('room_joined', onRoomJoined);
      socket.off('game_state_update', onGameStateUpdate);
      socket.off('game_started', onGameStarted);
      socket.off('dice_rolled', onDiceRolled);
      socket.off('chat_message', onChatMessage);
      socket.off('error_message', onErrorMsg);
    };
  }, [navigate]);

  // Action: Start Single Player
  const handleStartSinglePlayer = async ({ name, color, botCount, difficulty }) => {
    const res = await fetch(`${SERVER_URL}/api/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hostName: name,
        hostColor: color,
        isSinglePlayer: true,
        botCount,
        botDifficulty: difficulty
      })
    });
    if (!res.ok) throw new Error('Failed to create game. Server error.');
    const data = await res.json();
    setCurrentPlayerId(data.playerId);
    localStorage.setItem('ludo_player_id', data.playerId);
    localStorage.setItem('ludo_room_code', data.roomCode);

    socket.emit('join_room', {
      roomCode: data.roomCode,
      playerName: name,
      preferredColor: color,
      playerId: data.playerId
    });

    // Start game immediately in single player mode
    setTimeout(() => {
      socket.emit('start_game', { roomCode: data.roomCode });
    }, 400);
  };

  // Action: Create Multiplayer Room
  const handleCreateRoom = async ({ name, color }) => {
    const res = await fetch(`${SERVER_URL}/api/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hostName: name,
        hostColor: color,
        isSinglePlayer: false
      })
    });
    if (!res.ok) throw new Error('Failed to create room. Server error.');
    const data = await res.json();
    setCurrentPlayerId(data.playerId);
    localStorage.setItem('ludo_player_id', data.playerId);
    localStorage.setItem('ludo_room_code', data.roomCode);

    socket.emit('join_room', {
      roomCode: data.roomCode,
      playerName: name,
      preferredColor: color,
      playerId: data.playerId
    });
  };

  // Action: Join Room
  const handleJoinRoom = ({ roomCode, name }) => {
    socket.emit('join_room', {
      roomCode,
      playerName: name
    });
  };

  // Action: Start Game (Host)
  const handleStartGame = () => {
    if (roomState?.roomCode) {
      socket.emit('start_game', { roomCode: roomState.roomCode });
    }
  };

  // Action: Add Bot (Host)
  const handleAddBot = (difficulty) => {
    if (roomState?.roomCode) {
      socket.emit('add_bot', { roomCode: roomState.roomCode, difficulty });
    }
  };

  // Action: Remove Bot (Host)
  const handleRemoveBot = (seat) => {
    if (roomState?.roomCode) {
      socket.emit('remove_bot', { roomCode: roomState.roomCode, seat });
    }
  };

  // Action: Roll Dice
  const handleRollDice = () => {
    if (roomState?.roomCode) {
      socket.emit('roll_dice', { roomCode: roomState.roomCode });
    }
  };

  // Action: Move Token
  const handleMoveToken = (tokenIndex) => {
    if (roomState?.roomCode) {
      socket.emit('move_token', { roomCode: roomState.roomCode, tokenIndex });
    }
  };

  // Action: Send Chat Message
  const handleSendMessage = (text) => {
    if (roomState?.roomCode) {
      socket.emit('chat_message', { roomCode: roomState.roomCode, text });
    }
  };

  // Action: Rematch
  const handleRematch = () => {
    if (roomState?.roomCode) {
      socket.emit('rematch', { roomCode: roomState.roomCode });
    }
  };

  // Action: Leave Room
  const handleLeaveRoom = () => {
    localStorage.removeItem('ludo_room_code');
    localStorage.removeItem('ludo_player_id');
    setRoomState(null);
    setCurrentPlayerId(null);
    setValidMoves([]);
    navigate('/');
  };

  // Parse path for room code (e.g. /room/ABC123)
  const roomCodeMatch = currentPath.match(/^\/room\/([A-Za-z0-9]+)/);
  const directRoomCode = roomCodeMatch ? roomCodeMatch[1].toUpperCase() : null;

  return (
    <>
      {/* Full-screen red wipe overlay */}
      <div className="screen-wipe" />

      {/* Global Toast Error Banner */}
      {errorMessage && (
        <div
          role="alert"
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'var(--color-primary-strong)',
            color: 'var(--color-tertiary)',
            border: '2px solid var(--color-tertiary)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 20px',
            fontWeight: 700,
            zIndex: 99999
          }}
        >
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Routing Views */}
      {currentPath === '/' && (
        <Landing
          onNavigate={navigate}
          theme={theme}
          onToggleTheme={toggleTheme}
          animationsEnabled={animationsEnabled}
          onToggleAnimations={toggleAnimations}
        />
      )}

      {currentPath === '/creator' && (
        <Creator onNavigate={navigate} />
      )}

      {currentPath === '/single' && (
        <SingleSetup
          onStartSinglePlayer={handleStartSinglePlayer}
          onBack={() => navigate('/')}
        />
      )}

      {currentPath === '/multiplayer' && (
        <Multiplayer
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          onBack={() => navigate('/')}
        />
      )}

      {/* When URL has /room/CODE */}
      {directRoomCode && !roomState && (
        <Multiplayer
          initialRoomCode={directRoomCode}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          onBack={() => navigate('/')}
        />
      )}

      {/* Lobby View */}
      {roomState && roomState.status === 'lobby' && (
        <Lobby
          roomState={roomState}
          currentPlayerId={currentPlayerId}
          onStartGame={handleStartGame}
          onAddBot={handleAddBot}
          onRemoveBot={handleRemoveBot}
          onLeaveRoom={handleLeaveRoom}
        />
      )}

      {/* Active Game View */}
      {roomState && (roomState.status === 'in_progress' || roomState.status === 'finished') && (
        <Game
          roomState={{ ...roomState, validMoves }}
          currentPlayerId={currentPlayerId}
          onRollDice={handleRollDice}
          onMoveToken={handleMoveToken}
          onSendMessage={handleSendMessage}
          onRematch={handleRematch}
          onLeaveGame={handleLeaveRoom}
          animationsEnabled={animationsEnabled}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}
    </>
  );
}
