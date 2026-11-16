const http = require('http');
const assert = require('assert');
const { io: Client } = require('socket.io-client');

process.env.PORT = '4099';
const { app, server } = require('./index');

const BASE_URL = 'http://localhost:4099';

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const req = http.request(
      url,
      {
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      },
      (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, body: data });
          }
        });
      }
    );
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('==================================================');
  console.log('       RUNNING BACKEND INTEGRATION TESTS          ');
  console.log('==================================================');

  // Test 1: GET /health
  console.log('[TEST 1] GET /health...');
  const healthRes = await request('GET', '/health');
  assert.strictEqual(healthRes.status, 200);
  assert.strictEqual(healthRes.body.status, 'ok');
  console.log('  -> PASSED: Server health endpoint returns ok.');

  // Test 2: POST /api/rooms (Single-Player with 3 bots)
  console.log('[TEST 2] POST /api/rooms (Single-Player)...');
  const singleRes = await request('POST', '/api/rooms', {
    hostName: 'Alice',
    hostColor: 'red',
    isSinglePlayer: true,
    botCount: 3,
    botDifficulty: 2
  });
  assert.strictEqual(singleRes.status, 201);
  assert(singleRes.body.roomCode);
  assert.strictEqual(singleRes.body.color, 'red');
  assert.strictEqual(singleRes.body.isHost, true);
  console.log('  -> PASSED: Single player room created with code:', singleRes.body.roomCode);

  // Test 3: GET /api/rooms/:code
  console.log('[TEST 3] GET /api/rooms/:code...');
  const roomInfoRes = await request('GET', `/api/rooms/${singleRes.body.roomCode}`);
  assert.strictEqual(roomInfoRes.status, 200);
  assert.strictEqual(roomInfoRes.body.playerCount, 4); // 1 human + 3 bots
  assert.strictEqual(roomInfoRes.body.isSinglePlayer, true);
  console.log('  -> PASSED: Room info verified with 4 players.');

  // Test 4: Socket.IO Multiplayer Room Lifecycle
  console.log('[TEST 4] Socket.IO Multiplayer Lifecycle...');
  const multiRes = await request('POST', '/api/rooms', {
    hostName: 'HostPlayer',
    hostColor: 'red',
    isSinglePlayer: false
  });
  const roomCode = multiRes.body.roomCode;
  const hostPlayerId = multiRes.body.playerId;

  const clientHost = Client(BASE_URL, { reconnectionDelay: 0, forceNew: true });
  const clientGuest = Client(BASE_URL, { reconnectionDelay: 0, forceNew: true });

  await new Promise((resolve) => {
    clientHost.on('connect', () => {
      clientHost.emit('join_room', {
        roomCode,
        playerName: 'HostPlayer',
        preferredColor: 'red',
        playerId: hostPlayerId
      });
    });

    clientHost.on('room_joined', () => {
      // Connect guest
      clientGuest.emit('join_room', {
        roomCode,
        playerName: 'GuestPlayer',
        preferredColor: 'green'
      });
    });

    clientGuest.on('room_joined', (guestData) => {
      assert.strictEqual(guestData.seat, 1);
      assert.strictEqual(guestData.color, 'green');
      console.log('  -> PASSED: Host and Guest connected via Socket.IO.');
      resolve();
    });
  });

  // Test 5: Chat Messaging
  console.log('[TEST 5] Socket.IO Chat broadcast...');
  await new Promise((resolve) => {
    clientHost.on('chat_message', (msg) => {
      assert.strictEqual(msg.text, 'Hello from Host!');
      console.log('  -> PASSED: Chat message received and verified.');
      resolve();
    });

    clientHost.emit('chat_message', { roomCode, text: 'Hello from Host!' });
  });

  // Test 6: Host starts game
  console.log('[TEST 6] Start Game & Validation...');
  await new Promise((resolve) => {
    clientHost.on('game_started', (data) => {
      assert.strictEqual(data.gameState.status, 'in_progress');
      assert.strictEqual(data.gameState.engineState.current_player, 0);
      assert.strictEqual(data.gameState.engineState.phase, 0); // WAITING_FOR_ROLL
      console.log('  -> PASSED: Game started, Red (Host) plays first.');
      resolve();
    });

    clientHost.emit('start_game', { roomCode });
  });

  // Test 7: Roll dice
  console.log('[TEST 7] Host rolls dice...');
  await new Promise((resolve) => {
    clientHost.on('dice_rolled', (data) => {
      assert.strictEqual(data.player, 0);
      assert(data.dice >= 1 && data.dice <= 6);
      console.log(`  -> PASSED: Host rolled ${data.dice}.`);
      resolve();
    });

    clientHost.emit('roll_dice', { roomCode });
  });

  // Clean up
  clientHost.disconnect();
  clientGuest.disconnect();

  console.log('==================================================');
  console.log('  SUCCESS: ALL BACKEND INTEGRATION TESTS PASSED!  ');
  console.log('==================================================');

  server.close(() => {
    process.exit(0);
  });
}

runTests().catch((err) => {
  console.error('❌ Integration test failed:', err);
  process.exit(1);
});
