require('dotenv').config();
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const cors = require('cors');

const roomManager = require('./roomManager');
const { GAME_PHASE, isWasmActive } = require('./engineWrapper');

const PORT = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Map socketId -> { roomCode, playerId }
const socketUserMap = new Map();

/* -------------------------------------------------------------------------- */
/*                                REST ROUTES                                 */
/* -------------------------------------------------------------------------- */

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    wasmEngine: isWasmActive() ? 'WebAssembly (Native C)' : 'JavaScript (Mirror C)'
  });
});

app.post('/api/rooms', (req, res) => {
  const { hostName, hostColor, isSinglePlayer, botCount, botDifficulty } = req.body;
  const room = roomManager.createRoom(
    hostName,
    hostColor,
    Boolean(isSinglePlayer),
    botCount || 0,
    botDifficulty !== undefined ? botDifficulty : 1
  );

  const hostPlayer = room.players[0];
  res.status(201).json({
    roomCode: room.code,
    playerId: hostPlayer.id,
    seat: hostPlayer.seat,
    color: hostPlayer.color,
    isHost: true
  });
});

app.get('/api/rooms/:code', (req, res) => {
  const room = roomManager.getRoom(req.params.code);
  if (!room) {
    return res.status(404).json({ exists: false, message: 'Room not found' });
  }

  res.json({
    exists: true,
    code: room.code,
    status: room.status,
    playerCount: room.players.length,
    isSinglePlayer: room.isSinglePlayer,
    players: room.players.map(p => ({
      name: p.name,
      seat: p.seat,
      color: p.color,
      isHost: p.isHost,
      isBot: p.isBot,
      connected: p.connected
    }))
  });
});

/* -------------------------------------------------------------------------- */
/*                            BOT TURN SCHEDULER                              */
/* -------------------------------------------------------------------------- */

const activeBotTimers = new Map();

function cancelBotTimer(roomCode) {
  if (activeBotTimers.has(roomCode)) {
    clearTimeout(activeBotTimers.get(roomCode));
    activeBotTimers.delete(roomCode);
  }
}

function scheduleBotTurnIfNeeded(roomCode) {
  cancelBotTimer(roomCode);

  const room = roomManager.getRoom(roomCode);
  if (!room || room.status !== 'in_progress') return;

  const state = room.engine.getState();
  if (state.phase === GAME_PHASE.GAME_OVER) return;

  const currentSeat = state.current_player;
  const currentPlayer = room.players[currentSeat];

  if (!currentPlayer || !currentPlayer.isBot) {
    return; // Current turn belongs to human player
  }

  // Delay bot action by 1200ms to 1800ms so humans can see the action smoothly
  const delay = 1200 + Math.floor(Math.random() * 600);

  const timer = setTimeout(() => {
    activeBotTimers.delete(roomCode);
    executeBotTurn(roomCode, currentSeat);
  }, delay);

  activeBotTimers.set(roomCode, timer);
}

function executeBotTurn(roomCode, expectedSeat) {
  const room = roomManager.getRoom(roomCode);
  if (!room || room.status !== 'in_progress') return;

  let state = room.engine.getState();
  if (state.current_player !== expectedSeat || state.phase === GAME_PHASE.GAME_OVER) return;

  const botPlayer = room.players[expectedSeat];
  if (!botPlayer || !botPlayer.isBot) return;

  // 1. If waiting for roll, bot rolls dice
  if (state.phase === GAME_PHASE.WAITING_FOR_ROLL) {
    const dice = room.engine.rollDice();
    const updatedState = room.engine.getState();

    room.addMoveLog(`${botPlayer.name} rolled a ${dice}`);

    io.to(roomCode).emit('dice_rolled', {
      dice,
      player: expectedSeat,
      playerName: botPlayer.name,
      consecutiveSixes: updatedState.consecutive_sixes
    });

    io.to(roomCode).emit('game_state_update', room.getPublicState());

    if (updatedState.phase === GAME_PHASE.WAITING_FOR_MOVE) {
      // Delay before moving token so roll animation completes
      const moveDelay = 800 + Math.floor(Math.random() * 400);
      const timer = setTimeout(() => {
        executeBotMove(roomCode, expectedSeat, dice);
      }, moveDelay);
      activeBotTimers.set(roomCode, timer);
    } else {
      // Turn passed automatically (no moves or forfeited)
      scheduleBotTurnIfNeeded(roomCode);
    }
  } else if (state.phase === GAME_PHASE.WAITING_FOR_MOVE) {
    executeBotMove(roomCode, expectedSeat, state.current_dice);
  }
}

function executeBotMove(roomCode, expectedSeat, dice) {
  const room = roomManager.getRoom(roomCode);
  if (!room || room.status !== 'in_progress') return;

  const botPlayer = room.players[expectedSeat];
  const chosenToken = room.engine.botChooseMove(expectedSeat, dice, botPlayer.botDifficulty);

  if (chosenToken !== -1) {
    const moved = room.engine.moveToken(expectedSeat, chosenToken, dice);
    if (moved) {
      const winner = room.engine.checkWinner();
      const updatedState = room.engine.getState();

      room.addMoveLog(`${botPlayer.name} moved token ${chosenToken + 1}`);

      io.to(roomCode).emit('token_moved', {
        player: expectedSeat,
        tokenIndex: chosenToken,
        dice
      });

      io.to(roomCode).emit('game_state_update', room.getPublicState());

      if (winner !== -1) {
        room.status = 'finished';
        io.to(roomCode).emit('game_over', {
          winner: winner,
          winnerName: room.players[winner].name,
          color: room.players[winner].color
        });
        return;
      }
    }
  }

  // Check if next turn is also a bot
  scheduleBotTurnIfNeeded(roomCode);
}

/* -------------------------------------------------------------------------- */
/*                            SOCKET.IO HANDLERS                              */
/* -------------------------------------------------------------------------- */

io.on('connection', (socket) => {
  // Join Room
  socket.on('join_room', ({ roomCode, playerName, preferredColor, playerId }) => {
    if (!roomCode) {
      return socket.emit('error_message', { message: 'Room code is required' });
    }

    const code = roomCode.toUpperCase();
    const room = roomManager.getRoom(code);

    if (!room) {
      return socket.emit('error_message', { message: 'Room not found' });
    }

    // Check if this is a reconnecting player
    if (playerId) {
      const reconnectedPlayer = room.reconnectPlayer(playerId, socket.id);
      if (reconnectedPlayer) {
        socketUserMap.set(socket.id, { roomCode: code, playerId });
        socket.join(code);
        socket.emit('room_joined', {
          roomCode: code,
          playerId: reconnectedPlayer.id,
          seat: reconnectedPlayer.seat,
          color: reconnectedPlayer.color,
          isHost: reconnectedPlayer.isHost,
          roomState: room.getPublicState()
        });
        io.to(code).emit('player_reconnected', { player: reconnectedPlayer });
        io.to(code).emit('game_state_update', room.getPublicState());
        return;
      }
    }

    // New player joining
    const result = room.addPlayer(playerName, preferredColor, socket.id);
    if (!result.success) {
      return socket.emit('error_message', { message: result.message });
    }

    const player = result.player;
    socketUserMap.set(socket.id, { roomCode: code, playerId: player.id });
    socket.join(code);

    socket.emit('room_joined', {
      roomCode: code,
      playerId: player.id,
      seat: player.seat,
      color: player.color,
      isHost: player.isHost,
      roomState: room.getPublicState()
    });

    io.to(code).emit('player_joined', {
      player,
      roomState: room.getPublicState()
    });
  });

  // Host adds bot to lobby
  socket.on('add_bot', ({ roomCode, difficulty }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room || room.status !== 'lobby') return;

    const user = socketUserMap.get(socket.id);
    const player = room.players.find(p => p.id === (user && user.playerId));
    if (!player || !player.isHost) return;

    const bot = room.addBot(difficulty !== undefined ? difficulty : 1);
    if (bot) {
      io.to(roomCode).emit('game_state_update', room.getPublicState());
    }
  });

  // Host removes bot
  socket.on('remove_bot', ({ roomCode, seat }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room || room.status !== 'lobby') return;

    const user = socketUserMap.get(socket.id);
    const player = room.players.find(p => p.id === (user && user.playerId));
    if (!player || !player.isHost) return;

    const removed = room.removeBot(seat);
    if (removed) {
      io.to(roomCode).emit('game_state_update', room.getPublicState());
    }
  });

  // Start Game
  socket.on('start_game', ({ roomCode }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room) {
      return socket.emit('error_message', { message: 'Room not found' });
    }

    const result = room.startGame(socket.id);
    if (!result.success) {
      return socket.emit('error_message', { message: result.message });
    }

    io.to(roomCode).emit('game_started', {
      gameState: room.getPublicState()
    });

    scheduleBotTurnIfNeeded(roomCode);
  });

  // Roll Dice
  socket.on('roll_dice', ({ roomCode }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room || room.status !== 'in_progress') return;

    const user = socketUserMap.get(socket.id);
    if (!user) return;

    const player = room.players.find(p => p.id === user.playerId);
    if (!player) return;

    const state = room.engine.getState();
    if (state.current_player !== player.seat) {
      return socket.emit('error_message', { message: 'Not your turn!' });
    }
    if (state.phase !== GAME_PHASE.WAITING_FOR_ROLL) {
      return socket.emit('error_message', { message: 'Dice already rolled!' });
    }

    const dice = room.engine.rollDice();
    const updatedState = room.engine.getState();
    const validMoves = room.engine.getValidMoves(player.seat, dice);

    room.addMoveLog(`${player.name} rolled a ${dice}`);

    io.to(roomCode).emit('dice_rolled', {
      dice,
      player: player.seat,
      playerName: player.name,
      validMoves,
      consecutiveSixes: updatedState.consecutive_sixes
    });

    io.to(roomCode).emit('game_state_update', room.getPublicState());

    if (updatedState.phase === GAME_PHASE.WAITING_FOR_ROLL) {
      // Turn passed automatically due to no valid moves or 3 sixes
      scheduleBotTurnIfNeeded(roomCode);
    }
  });

  // Move Token
  socket.on('move_token', ({ roomCode, tokenIndex }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room || room.status !== 'in_progress') return;

    const user = socketUserMap.get(socket.id);
    if (!user) return;

    const player = room.players.find(p => p.id === user.playerId);
    if (!player) return;

    const state = room.engine.getState();
    if (state.current_player !== player.seat) {
      return socket.emit('error_message', { message: 'Not your turn!' });
    }
    if (state.phase !== GAME_PHASE.WAITING_FOR_MOVE) {
      return socket.emit('error_message', { message: 'Roll the dice first!' });
    }

    const dice = state.current_dice;
    const moved = room.engine.moveToken(player.seat, tokenIndex, dice);

    if (!moved) {
      return socket.emit('error_message', { message: 'Illegal move!' });
    }

    room.addMoveLog(`${player.name} moved token ${tokenIndex + 1}`);

    io.to(roomCode).emit('token_moved', {
      player: player.seat,
      tokenIndex,
      dice
    });

    const winner = room.engine.checkWinner();
    io.to(roomCode).emit('game_state_update', room.getPublicState());

    if (winner !== -1) {
      room.status = 'finished';
      io.to(roomCode).emit('game_over', {
        winner,
        winnerName: room.players[winner].name,
        color: room.players[winner].color
      });
      return;
    }

    scheduleBotTurnIfNeeded(roomCode);
  });

  // In-Game Chat
  socket.on('chat_message', ({ roomCode, text }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room || !text || !text.trim()) return;

    const user = socketUserMap.get(socket.id);
    const player = room.players.find(p => p.id === (user && user.playerId));
    const senderName = player ? player.name : 'Spectator';
    const senderSeat = player ? player.seat : -1;

    const message = room.addChatMessage(senderName, senderSeat, text);
    io.to(roomCode).emit('chat_message', message);
  });

  // Rematch
  socket.on('rematch', ({ roomCode }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room) return;

    const user = socketUserMap.get(socket.id);
    const player = room.players.find(p => p.id === (user && user.playerId));
    if (!player || !player.isHost) {
      return socket.emit('error_message', { message: 'Only host can restart' });
    }

    const newState = room.rematch();
    io.to(roomCode).emit('game_started', { gameState: newState });
    scheduleBotTurnIfNeeded(roomCode);
  });

  // Disconnect
  socket.on('disconnect', () => {
    const user = socketUserMap.get(socket.id);
    if (!user) return;

    const { roomCode } = user;
    const room = roomManager.getRoom(roomCode);
    if (!room) {
      socketUserMap.delete(socket.id);
      return;
    }

    room.handleDisconnect(socket.id, (code, botPlayer) => {
      // Replaced by bot callback
      io.to(code).emit('player_replaced_by_bot', {
        seat: botPlayer.seat,
        name: botPlayer.name
      });
      io.to(code).emit('game_state_update', room.getPublicState());
      scheduleBotTurnIfNeeded(code);
    });

    socketUserMap.delete(socket.id);
    io.to(roomCode).emit('game_state_update', room.getPublicState());
  });
});

/* -------------------------------------------------------------------------- */
/*                                SERVER START                                */
/* -------------------------------------------------------------------------- */

server.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 LUDO Authoritative Game Server running on port ${PORT}`);
  console.log(`🌐 CORS enabled for: ${CLIENT_URL}`);
  console.log(`⚡ Engine: ${isWasmActive() ? 'WebAssembly (C)' : 'JavaScript (Mirror)'}`);
  console.log(`=================================================`);
});

module.exports = { app, server };
