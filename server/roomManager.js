const { LudoEngineWrapper, BOT_DIFFICULTY } = require('./engineWrapper');

const PLAYER_COLORS = ['red', 'green', 'yellow', 'blue'];
const RECONNECT_TIMEOUT_MS = 60 * 1000; // 60 seconds
const ROOM_CLEANUP_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // omit ambiguous characters like 0, O, 1, I
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function generatePlayerId() {
  return 'p_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

class Room {
  constructor(code, hostName, hostColor = 'red', isSinglePlayer = false) {
    this.code = code;
    this.isSinglePlayer = isSinglePlayer;
    this.createdAt = Date.now();
    this.lastActivity = Date.now();
    this.status = 'lobby'; // 'lobby', 'in_progress', 'finished'
    this.engine = new LudoEngineWrapper(4);

    this.hostPlayerId = generatePlayerId();
    this.players = [
      {
        id: this.hostPlayerId,
        socketId: null,
        name: hostName || 'Player 1',
        seat: 0,
        color: hostColor || 'red',
        isHost: true,
        isBot: false,
        botDifficulty: BOT_DIFFICULTY.MEDIUM,
        isReady: true,
        connected: true,
        disconnectedAt: null
      }
    ];

    this.chatMessages = [];
    this.moveLog = [];
    this.disconnectTimers = new Map();
  }

  touch() {
    this.lastActivity = Date.now();
  }

  getAvailableColors() {
    const taken = this.players.filter(p => !p.isBot).map(p => p.color);
    return PLAYER_COLORS.filter(c => !taken.includes(c));
  }

  addPlayer(name, preferredColor, socketId) {
    this.touch();
    if (this.status !== 'lobby') {
      return { success: false, message: 'Game has already started' };
    }
    if (this.players.length >= 4) {
      return { success: false, message: 'Room is full (max 4 players)' };
    }

    const availableColors = this.getAvailableColors();
    let color = preferredColor && availableColors.includes(preferredColor)
      ? preferredColor
      : availableColors[0] || PLAYER_COLORS[this.players.length];

    const seat = this.players.length;
    const playerId = generatePlayerId();

    const newPlayer = {
      id: playerId,
      socketId,
      name: name || `Player ${seat + 1}`,
      seat,
      color,
      isHost: false,
      isBot: false,
      botDifficulty: BOT_DIFFICULTY.MEDIUM,
      isReady: true,
      connected: true,
      disconnectedAt: null
    };

    this.players.push(newPlayer);
    return { success: true, player: newPlayer };
  }

  addBot(difficulty = BOT_DIFFICULTY.MEDIUM) {
    this.touch();
    if (this.players.length >= 4) return null;
    const seat = this.players.length;
    const color = PLAYER_COLORS[seat];
    const bot = {
      id: 'bot_' + Math.random().toString(36).substring(2, 6),
      socketId: null,
      name: `Bot ${seat + 1} (${['Easy', 'Med', 'Hard'][difficulty]})`,
      seat,
      color,
      isHost: false,
      isBot: true,
      botDifficulty: difficulty,
      isReady: true,
      connected: true,
      disconnectedAt: null
    };
    this.players.push(bot);
    return bot;
  }

  removeBot(seat) {
    this.touch();
    const idx = this.players.findIndex(p => p.seat === seat && p.isBot);
    if (idx !== -1) {
      this.players.splice(idx, 1);
      // Re-index seats
      this.players.forEach((p, i) => { p.seat = i; });
      return true;
    }
    return false;
  }

  fillEmptySlotsWithBots(difficulty = BOT_DIFFICULTY.MEDIUM) {
    this.touch();
    while (this.players.length < 4) {
      this.addBot(difficulty);
    }
  }

  startGame(requestingSocketId) {
    this.touch();
    const host = this.players.find(p => p.isHost);
    if (!host || (host.socketId && host.socketId !== requestingSocketId)) {
      return { success: false, message: 'Only the host can start the game' };
    }

    if (this.players.length < 2) {
      return { success: false, message: 'Need at least 2 players to start' };
    }

    // Configure the C engine
    this.engine.initGame(this.players.length);
    this.players.forEach((p, idx) => {
      this.engine.setPlayerBot(idx, p.isBot, p.botDifficulty);
    });

    this.status = 'in_progress';
    this.moveLog.push({
      type: 'info',
      text: 'Game started! Red plays first.',
      timestamp: Date.now()
    });

    return { success: true, gameState: this.getPublicState() };
  }

  handleDisconnect(socketId, onSeatReplacedByBot) {
    this.touch();
    const player = this.players.find(p => p.socketId === socketId);
    if (!player) return null;

    player.connected = false;
    player.disconnectedAt = Date.now();

    // If game is in lobby, remove player immediately if not host
    if (this.status === 'lobby') {
      if (player.isHost) {
        // Pass host to next connected human
        const nextHuman = this.players.find(p => p.id !== player.id && !p.isBot);
        if (nextHuman) {
          nextHuman.isHost = true;
          this.hostPlayerId = nextHuman.id;
        }
      }
      this.players = this.players.filter(p => p.id !== player.id);
      this.players.forEach((p, i) => { p.seat = i; });
      return { player, action: 'removed' };
    }

    // If game in progress, start 60s reconnect grace timer
    if (this.status === 'in_progress') {
      const timer = setTimeout(() => {
        // Time expired: convert seat to bot
        player.isBot = true;
        player.name = `${player.name} (Bot)`;
        player.connected = true;
        this.engine.setPlayerBot(player.seat, 1, BOT_DIFFICULTY.MEDIUM);
        this.disconnectTimers.delete(player.id);
        if (typeof onSeatReplacedByBot === 'function') {
          onSeatReplacedByBot(this.code, player);
        }
      }, RECONNECT_TIMEOUT_MS);

      this.disconnectTimers.set(player.id, timer);
      return { player, action: 'reconnect_grace' };
    }

    return { player, action: 'none' };
  }

  reconnectPlayer(playerId, socketId) {
    this.touch();
    const player = this.players.find(p => p.id === playerId);
    if (!player) return null;

    player.socketId = socketId;
    player.connected = true;
    player.disconnectedAt = null;

    // Cancel reconnect grace timer if active
    if (this.disconnectTimers.has(playerId)) {
      clearTimeout(this.disconnectTimers.get(playerId));
      this.disconnectTimers.delete(playerId);
    }

    return player;
  }

  addChatMessage(senderName, senderSeat, text) {
    this.touch();
    const message = {
      id: 'msg_' + Date.now() + Math.random().toString(36).substring(2, 5),
      senderName,
      senderSeat,
      text: text.slice(0, 160), // clamp chat length
      timestamp: Date.now()
    };
    this.chatMessages.push(message);
    if (this.chatMessages.length > 50) this.chatMessages.shift();
    return message;
  }

  addMoveLog(text) {
    this.touch();
    this.moveLog.push({
      text,
      timestamp: Date.now()
    });
    if (this.moveLog.length > 30) this.moveLog.shift();
  }

  getPublicState() {
    const rawState = this.engine.getState();
    return {
      roomCode: this.code,
      status: this.status,
      isSinglePlayer: this.isSinglePlayer,
      players: this.players.map(p => ({
        id: p.id,
        name: p.name,
        seat: p.seat,
        color: p.color,
        isHost: p.isHost,
        isBot: p.isBot,
        botDifficulty: p.botDifficulty,
        connected: p.connected
      })),
      engineState: rawState,
      chatMessages: this.chatMessages,
      moveLog: this.moveLog
    };
  }

  rematch() {
    this.touch();
    this.engine.initGame(this.players.length);
    this.players.forEach((p, idx) => {
      this.engine.setPlayerBot(idx, p.isBot, p.botDifficulty);
    });
    this.status = 'in_progress';
    this.moveLog = [{
      type: 'info',
      text: 'Rematch started! Red plays first.',
      timestamp: Date.now()
    }];
    return this.getPublicState();
  }
}

class RoomManager {
  constructor() {
    this.rooms = new Map();
    // Periodic cleanup of stale or abandoned rooms
    setInterval(() => this.cleanupStaleRooms(), ROOM_CLEANUP_INTERVAL_MS);
  }

  createRoom(hostName, hostColor = 'red', isSinglePlayer = false, botCount = 0, botDifficulty = BOT_DIFFICULTY.MEDIUM) {
    let code = generateRoomCode();
    while (this.rooms.has(code)) {
      code = generateRoomCode();
    }

    const room = new Room(code, hostName, hostColor, isSinglePlayer);

    if (isSinglePlayer) {
      const count = Math.min(Math.max(botCount, 1), 3);
      for (let i = 0; i < count; i++) {
        room.addBot(botDifficulty);
      }
    }

    this.rooms.set(code, room);
    return room;
  }

  getRoom(code) {
    if (!code) return null;
    return this.rooms.get(code.toUpperCase()) || null;
  }

  cleanupStaleRooms() {
    const now = Date.now();
    const MAX_IDLE_TIME = 2 * 60 * 60 * 1000; // 2 hours
    for (const [code, room] of this.rooms.entries()) {
      const allDisconnected = room.players.every(p => !p.connected && !p.isBot);
      if (now - room.lastActivity > MAX_IDLE_TIME || (allDisconnected && room.players.length > 0 && now - room.lastActivity > 10 * 60 * 1000)) {
        // Clear active timers
        room.disconnectTimers.forEach(t => clearTimeout(t));
        this.rooms.delete(code);
      }
    }
  }
}

module.exports = new RoomManager();
