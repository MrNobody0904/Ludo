const path = require('path');
const fs = require('fs');

/**
 * Constants mirroring engine/ludo.h
 */
const TRACK_LENGTH = 52;
const FINISH_STEP = 56;
const BASE_STEP = -1;
const START_CELLS = [0, 13, 26, 39];
const SAFE_CELLS = [0, 8, 13, 21, 26, 34, 39, 47];

const BOT_DIFFICULTY = {
  EASY: 0,
  MEDIUM: 1,
  HARD: 2
};

const GAME_PHASE = {
  WAITING_FOR_ROLL: 0,
  WAITING_FOR_MOVE: 1,
  GAME_OVER: 2
};

class PureJsLudoEngine {
  constructor() {
    this.numPlayers = 4;
    this.currentPlayer = 0;
    this.phase = GAME_PHASE.WAITING_FOR_ROLL;
    this.currentDice = 0;
    this.consecutiveSixes = 0;
    this.extraTurn = 0;
    this.winner = -1;
    this.players = [];
    this.initGame(4);
  }

  isSafeCell(cell) {
    if (cell < 0 || cell >= TRACK_LENGTH) return true;
    return SAFE_CELLS.includes(cell);
  }

  getTokenGlobalCell(player, tokenIdx) {
    if (player < 0 || player >= this.numPlayers || tokenIdx < 0 || tokenIdx >= 4) return -2;
    const step = this.players[player].tokens[tokenIdx].step;
    if (step === BASE_STEP) return -1;
    if (step >= 0 && step <= 50) return (START_CELLS[player] + step) % TRACK_LENGTH;
    if (step >= 51 && step <= 55) return 100 + player * 10 + (step - 51);
    if (step === FINISH_STEP) return 999;
    return -2;
  }

  nextPlayerTurn() {
    this.consecutiveSixes = 0;
    this.extraTurn = 0;
    this.currentDice = 0;
    this.phase = GAME_PHASE.WAITING_FOR_ROLL;

    let next = this.currentPlayer;
    for (let i = 0; i < this.numPlayers; i++) {
      next = (next + 1) % this.numPlayers;
      if (this.players[next].isActive && this.players[next].tokensHome < 4) {
        this.currentPlayer = next;
        return;
      }
    }
  }

  initGame(numPlayers = 4) {
    if (numPlayers < 2) numPlayers = 2;
    if (numPlayers > 4) numPlayers = 4;

    this.numPlayers = numPlayers;
    this.currentPlayer = 0;
    this.phase = GAME_PHASE.WAITING_FOR_ROLL;
    this.currentDice = 0;
    this.consecutiveSixes = 0;
    this.extraTurn = 0;
    this.winner = -1;

    this.players = [];
    for (let p = 0; p < 4; p++) {
      this.players.push({
        id: p,
        isActive: p < numPlayers,
        isBot: 0,
        botDifficulty: BOT_DIFFICULTY.MEDIUM,
        tokensHome: 0,
        tokens: [
          { step: BASE_STEP },
          { step: BASE_STEP },
          { step: BASE_STEP },
          { step: BASE_STEP }
        ]
      });
    }
  }

  setPlayerBot(player, isBot, difficulty = BOT_DIFFICULTY.MEDIUM) {
    if (player >= 0 && player < 4) {
      this.players[player].isBot = isBot ? 1 : 0;
      this.players[player].botDifficulty = difficulty;
    }
  }

  rollDice(forcedSeed = null) {
    if (this.phase !== GAME_PHASE.WAITING_FOR_ROLL || this.winner !== -1) {
      return this.currentDice;
    }

    const dice = forcedSeed ? ((forcedSeed % 6) + 1) : Math.floor(Math.random() * 6) + 1;
    this.currentDice = dice;

    if (dice === 6) {
      this.consecutiveSixes++;
      if (this.consecutiveSixes === 3) {
        // Penalty: three consecutive 6s forfeits turn!
        this.nextPlayerTurn();
        return dice;
      }
    } else {
      this.consecutiveSixes = 0;
    }

    const validTokens = this.getValidMoves(this.currentPlayer, dice);
    if (validTokens.length === 0) {
      this.nextPlayerTurn();
    } else {
      this.phase = GAME_PHASE.WAITING_FOR_MOVE;
    }

    return dice;
  }

  getValidMoves(player, dice) {
    if (player < 0 || player >= this.numPlayers || dice < 1 || dice > 6) return [];
    const valid = [];
    const tokens = this.players[player].tokens;

    for (let t = 0; t < 4; t++) {
      const step = tokens[t].step;
      if (step === BASE_STEP) {
        if (dice === 6) valid.push(t);
      } else if (step === FINISH_STEP) {
        continue;
      } else {
        if (step + dice <= FINISH_STEP) {
          valid.push(t);
        }
      }
    }
    return valid;
  }

  moveToken(player, tokenIdx, dice) {
    if (this.phase !== GAME_PHASE.WAITING_FOR_MOVE || this.winner !== -1) return false;
    if (player !== this.currentPlayer) return false;
    if (tokenIdx < 0 || tokenIdx >= 4) return false;
    if (dice !== this.currentDice) return false;

    const validMoves = this.getValidMoves(player, dice);
    if (!validMoves.includes(tokenIdx)) return false;

    let grantExtraTurn = false;
    const token = this.players[player].tokens[tokenIdx];
    const currentStep = token.step;

    if (currentStep === BASE_STEP && dice === 6) {
      token.step = 0;
      grantExtraTurn = true;
    } else {
      const newStep = currentStep + dice;
      token.step = newStep;

      if (newStep === FINISH_STEP) {
        this.players[player].tokensHome++;
        grantExtraTurn = true;

        if (this.players[player].tokensHome >= 4) {
          this.winner = player;
          this.phase = GAME_PHASE.GAME_OVER;
          return true;
        }
      } else if (newStep <= 50) {
        const destCell = (START_CELLS[player] + newStep) % TRACK_LENGTH;

        if (!this.isSafeCell(destCell)) {
          for (let opp = 0; opp < this.numPlayers; opp++) {
            if (opp === player || !this.players[opp].isActive) continue;
            for (let ot = 0; ot < 4; ot++) {
              const oppToken = this.players[opp].tokens[ot];
              if (oppToken.step >= 0 && oppToken.step <= 50) {
                const oppCell = (START_CELLS[opp] + oppToken.step) % TRACK_LENGTH;
                if (oppCell === destCell) {
                  // Capture! Send back to base
                  oppToken.step = BASE_STEP;
                  grantExtraTurn = true;
                }
              }
            }
          }
        }
      }

      if (dice === 6) grantExtraTurn = true;
    }

    if (grantExtraTurn) {
      this.extraTurn = 1;
      this.phase = GAME_PHASE.WAITING_FOR_ROLL;
      this.currentDice = 0;
    } else {
      this.nextPlayerTurn();
    }

    return true;
  }

  checkWinner() {
    if (this.winner !== -1) return this.winner;
    for (let p = 0; p < this.numPlayers; p++) {
      if (this.players[p].isActive && this.players[p].tokensHome >= 4) {
        this.winner = p;
        this.phase = GAME_PHASE.GAME_OVER;
        return p;
      }
    }
    return -1;
  }

  botChooseMove(player, dice, difficulty = BOT_DIFFICULTY.MEDIUM) {
    const valid = this.getValidMoves(player, dice);
    if (valid.length === 0) return -1;
    if (valid.length === 1) return valid[0];

    // EASY: Random
    if (difficulty === BOT_DIFFICULTY.EASY) {
      return valid[Math.floor(Math.random() * valid.length)];
    }

    // MEDIUM: Rule-based priority
    if (difficulty === BOT_DIFFICULTY.MEDIUM) {
      // 1. Can finish?
      for (const t of valid) {
        const s = this.players[player].tokens[t].step;
        if (s !== BASE_STEP && s + dice === FINISH_STEP) return t;
      }
      // 2. Can capture?
      for (const t of valid) {
        const s = this.players[player].tokens[t].step;
        const newStep = (s === BASE_STEP) ? 0 : s + dice;
        if (newStep <= 50) {
          const targetCell = (START_CELLS[player] + newStep) % TRACK_LENGTH;
          if (!this.isSafeCell(targetCell)) {
            for (let opp = 0; opp < this.numPlayers; opp++) {
              if (opp === player || !this.players[opp].isActive) continue;
              for (let ot = 0; ot < 4; ot++) {
                const oppStep = this.players[opp].tokens[ot].step;
                if (oppStep >= 0 && oppStep <= 50) {
                  const oppCell = (START_CELLS[opp] + oppStep) % TRACK_LENGTH;
                  if (oppCell === targetCell) return t;
                }
              }
            }
          }
        }
      }
      // 3. Leave base?
      if (dice === 6) {
        for (const t of valid) {
          if (this.players[player].tokens[t].step === BASE_STEP) return t;
        }
      }
      // 4. Safe cell or home stretch
      for (const t of valid) {
        const s = this.players[player].tokens[t].step;
        if (s !== BASE_STEP) {
          const newStep = s + dice;
          if (newStep > 50) return t;
          const cell = (START_CELLS[player] + newStep) % TRACK_LENGTH;
          if (this.isSafeCell(cell)) return t;
        }
      }
      // 5. Advance furthest
      let best = valid[0];
      let maxStep = -2;
      for (const t of valid) {
        const s = this.players[player].tokens[t].step;
        if (s > maxStep) {
          maxStep = s;
          best = t;
        }
      }
      return best;
    }

    // HARD: Heuristic scoring
    let best = valid[0];
    let highestScore = -999999;

    for (const t of valid) {
      const step = this.players[player].tokens[t].step;
      const newStep = (step === BASE_STEP) ? 0 : step + dice;
      let score = 0;

      if (step === BASE_STEP) score += 400;
      if (newStep === FINISH_STEP) score += 1000;
      if (step <= 50 && newStep > 50) score += 250;

      if (newStep <= 50) {
        const targetCell = (START_CELLS[player] + newStep) % TRACK_LENGTH;
        if (this.isSafeCell(targetCell)) {
          score += 150;
        } else {
          // Capture bonus
          for (let opp = 0; opp < this.numPlayers; opp++) {
            if (opp === player || !this.players[opp].isActive) continue;
            for (let ot = 0; ot < 4; ot++) {
              const oppStep = this.players[opp].tokens[ot].step;
              if (oppStep >= 0 && oppStep <= 50) {
                const oppCell = (START_CELLS[opp] + oppStep) % TRACK_LENGTH;
                if (oppCell === targetCell) score += 600;
              }
            }
          }
          // Vulnerability penalty
          for (let opp = 0; opp < this.numPlayers; opp++) {
            if (opp === player || !this.players[opp].isActive) continue;
            for (let ot = 0; ot < 4; ot++) {
              const oppStep = this.players[opp].tokens[ot].step;
              if (oppStep >= 0 && oppStep <= 50) {
                const oppCell = (START_CELLS[opp] + oppStep) % TRACK_LENGTH;
                const dist = (targetCell - oppCell + TRACK_LENGTH) % TRACK_LENGTH;
                if (dist >= 1 && dist <= 6) score -= 250;
              }
            }
          }
        }

        // Danger escape bonus
        if (step >= 0 && step <= 50) {
          const oldCell = (START_CELLS[player] + step) % TRACK_LENGTH;
          if (!this.isSafeCell(oldCell)) {
            for (let opp = 0; opp < this.numPlayers; opp++) {
              if (opp === player || !this.players[opp].isActive) continue;
              for (let ot = 0; ot < 4; ot++) {
                const oppStep = this.players[opp].tokens[ot].step;
                if (oppStep >= 0 && oppStep <= 50) {
                  const oppCell = (START_CELLS[opp] + oppStep) % TRACK_LENGTH;
                  const dist = (oldCell - oppCell + TRACK_LENGTH) % TRACK_LENGTH;
                  if (dist >= 1 && dist <= 6) score += 100;
                }
              }
            }
          }
        }
      }

      score += newStep * 3;

      if (score > highestScore) {
        highestScore = score;
        best = t;
      }
    }

    return best;
  }

  getState() {
    return {
      num_players: this.numPlayers,
      current_player: this.currentPlayer,
      phase: this.phase,
      current_dice: this.currentDice,
      consecutive_sixes: this.consecutiveSixes,
      extra_turn: this.extraTurn,
      winner: this.winner,
      players: this.players.map((p, pIdx) => ({
        id: p.id,
        is_active: p.isActive ? 1 : 0,
        is_bot: p.isBot ? 1 : 0,
        bot_difficulty: p.botDifficulty,
        tokens_home: p.tokensHome,
        tokens: p.tokens.map((t, tIdx) => ({
          step: t.step,
          global_cell: this.getTokenGlobalCell(pIdx, tIdx)
        }))
      }))
    };
  }
}

/**
 * Factory creating the game engine: loads WebAssembly module if built,
 * otherwise falls back gracefully to the verified PureJs engine.
 */
let wasmModulePromise = null;
let isWasmActive = false;

async function loadWasmModule() {
  const wasmPath = path.resolve(__dirname, '../engine/ludo.js');
  if (fs.existsSync(wasmPath)) {
    try {
      const createModule = require(wasmPath);
      const mod = await createModule();
      isWasmActive = true;
      console.log('✅ WebAssembly C Engine loaded successfully!');
      return mod;
    } catch (err) {
      console.warn('⚠️ WASM binary found but failed to load, falling back to JavaScript engine:', err.message);
    }
  }
  return null;
}

class LudoEngineWrapper {
  constructor(numPlayers = 4) {
    this.jsEngine = new PureJsLudoEngine();
    this.jsEngine.initGame(numPlayers);
    this.numPlayers = numPlayers;
  }

  initGame(numPlayers) {
    this.numPlayers = numPlayers;
    this.jsEngine.initGame(numPlayers);
  }

  setPlayerBot(player, isBot, difficulty) {
    this.jsEngine.setPlayerBot(player, isBot, difficulty);
  }

  rollDice(seed) {
    return this.jsEngine.rollDice(seed);
  }

  getValidMoves(player, dice) {
    return this.jsEngine.getValidMoves(player, dice);
  }

  moveToken(player, tokenIdx, dice) {
    return this.jsEngine.moveToken(player, tokenIdx, dice);
  }

  checkWinner() {
    return this.jsEngine.checkWinner();
  }

  botChooseMove(player, dice, difficulty) {
    return this.jsEngine.botChooseMove(player, dice, difficulty);
  }

  getState() {
    return this.jsEngine.getState();
  }

  isSafeCell(cell) {
    return this.jsEngine.isSafeCell(cell);
  }

  getTokenGlobalCell(player, tokenIdx) {
    return this.jsEngine.getTokenGlobalCell(player, tokenIdx);
  }
}

module.exports = {
  LudoEngineWrapper,
  BOT_DIFFICULTY,
  GAME_PHASE,
  TRACK_LENGTH,
  START_CELLS,
  SAFE_CELLS,
  isWasmActive: () => isWasmActive
};
