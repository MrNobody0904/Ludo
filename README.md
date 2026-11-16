# 🎲 LUDO — Planetono Space

> A modern, authoritative full-stack Ludo web game built with a **C WebAssembly engine**, **Node.js + Socket.IO**, **React (Vite)**, **GSAP animations**, and **Three.js 3D graphics**.

Designed with the **"Planetono Space"** aesthetic: a bold, flat, saturated red canvas, warm off-white typography, sunny yellow accents, and generous whitespace. Zero gradients, zero shadows, pure poster-style game art.

---

## 🌟 Key Features

1. **Two Game Modes:**
   - **Single Player:** Play solo against 1 to 3 intelligent bots with selectable difficulty (**Easy**, **Medium**, **Hard**).
   - **Multiplayer:** Create a private room, copy a shareable link or use native mobile share (`/room/ABC123`), and play with friends in real-time from anywhere in the world.
2. **Authoritative Server Architecture:**
   - The server validates all game logic, dice rolls, turns, and moves via the C engine to prevent cheating or race conditions.
   - Client visuals (3D dice tumbling, GSAP hopping) are purely presentation-tier animations synced to server events.
3. **High-Performance C Engine (WebAssembly):**
   - Pure ANSI C core with unit tests compiled via Emscripten (`emcc`) to WebAssembly.
   - Dual-engine fallback: seamlessly runs via native WebAssembly in production and verified JavaScript mirror in local environments without extra toolchain setup.
4. **GSAP Micro-Interactions & Timelines:**
   - Staggered letter entrance for **"LUDO"** and hero elements.
   - Full-screen red wipe page transitions between views.
   - Arc-bounce token hopping cell by cell and capture shake-and-shrink animations.
5. **Three.js & React Three Fiber (Flat 3D):**
   - Floating flat-shaded 3D hero dice on the landing page that tilts towards the mouse pointer.
   - Deterministic 3D tumbling game dice that lands on the exact server roll.
   - Low-end device detection (`useIsLowEnd.js`) and error boundaries with instant 2D SVG fallbacks.
6. **Polished Experience:**
   - Dark / Light mode toggle (swapping between saturated red and off-white canvas).
   - Procedural Web Audio API sound effects with zero external audio assets needed.
   - Automatic 60-second reconnection grace period on page refresh.
   - Bot auto-takeover if an opponent abandons an active game.

---

## 📁 Project Architecture

```
Ludo/
├── engine/                  # C Game Engine & WebAssembly Build
│   ├── ludo.h               # API definitions, safe cells, data structures
│   ├── ludo.c               # Board coordinate math, capture logic, bot AI
│   ├── test_ludo.c          # Assert-based C unit test suite (7 suites)
│   ├── build.sh             # Linux/macOS/CI build script for emcc
│   └── build.bat            # Windows build script for emcc
├── server/                  # Authoritative Node.js Backend
│   ├── index.js             # Express REST API & Socket.IO websocket hub
│   ├── roomManager.js       # Room lifecycle, seats, bot timers, reconnects
│   ├── engineWrapper.js     # WebAssembly loader + pure JS fallback engine
│   ├── test_server.js       # Backend integration test suite
│   ├── .env.example         # Environment template
│   └── package.json         # Pinned server dependencies
├── client/                  # React Frontend (Vite)
│   ├── index.html           # Google Fonts Poppins & viewport setup
│   ├── vite.config.js       # Vite configuration
│   ├── src/
│   │   ├── styles/
│   │   │   ├── tokens.css   # Planetono Space design tokens
│   │   │   └── global.css   # Typography, layout, and reset styles
│   │   ├── components/      # Button, Card, Input, Modal, Board, Token, Chat
│   │   ├── three/           # HeroDice, Dice3D, WinnerScene, useIsLowEnd
│   │   ├── animations/      # landingTimeline, tokenMove, pageTransition
│   │   ├── pages/           # Landing, SingleSetup, Multiplayer, Lobby, Game
│   │   ├── hooks/           # useSound, useIsLowEnd
│   │   ├── socket.js        # Socket.IO client instance
│   │   ├── App.jsx          # Route manager and screen transition orchestrator
│   │   └── main.jsx         # React DOM entry point
│   └── package.json         # Pinned client dependencies
└── README.md
```

---

## 🛠️ Tech Stack & Pinned Libraries

### Backend:
- **Node.js** (v18+)
- `express`: `4.21.2`
- `socket.io`: `4.8.1`
- `cors`: `2.8.5`
- `dotenv`: `16.4.7`

### Frontend:
- **React**: `18.3.1`
- **Vite**: `5.4.11`
- **GSAP**: `3.12.5` + `@gsap/react: 2.1.1`
- **Three.js**: `0.169.0` + `@react-three/fiber: 8.17.10` + `@react-three/drei: 9.114.3`
- `socket.io-client`: `4.8.1`
- `canvas-confetti`: `1.9.3`

---

## 🎓 Presentation Guide: Explaining GSAP & Three.js

When presenting this project to your mentor or professor, highlight these key design decisions:

### 1. Why Flat-Shaded Three.js?
> *"Instead of realistic 3D lighting, gloss, or shadows, we used flat `MeshBasicMaterial` solid colors matching our Planetono Space palette (`#f7f2e5` for the body, `#eb3322` for pips). This produces a stylized, poster-like 3D appearance that feels consistent with the flat 2D SVG board while maintaining 60 FPS performance even on mobile phones."*

### 2. How the 3D Dice Stays Authoritative:
> *"The dice roll is NEVER decided on the client. When a player presses 'Roll', the server invokes `roll_dice()` in the C engine. The server broadcasts the result (e.g. `4`), and the client's Three.js dice runs a GSAP-driven tumble animation that is calculated to land exactly with face 4 facing up (`targetEuler = [0, Math.PI / 2, 0]`). Visuals are purely cosmetic—the server enforces the rules."*

### 3. GSAP Timelines & Staggering:
> *"We use `@gsap/react`'s `useGSAP()` / `gsap.context()` for automatic cleanup when components unmount. On the landing page, each letter of 'LUDO' is an isolated `span` that drops in with a stagger of `0.08s` using `back.out(2)` easing. For route changes, a full-screen red wipe slides up and down using `power2.inOut`, completely eliminating white flashes during page navigation."*

### 4. Accessibility & Low-End Fallback:
> *"Our custom hook `useIsLowEnd.js` detects devices with low CPU cores (`<= 4`), small screens, or users with `prefers-reduced-motion` enabled. On those devices, heavy WebGL canvases are bypassed in favor of crisp, lightweight 2D SVG dice, ensuring anyone can play without stutter."*

---

## 🚀 Step-by-Step Running Instructions

### 1. Test the C Engine:
```bash
cd engine
gcc -O2 -Wall -I. ludo.c test_ludo.c -o test_ludo.exe
.\test_ludo.exe
```

### 2. Run the Backend Server:
```bash
cd server
npm install
npm test      # runs automated integration tests
npm start     # starts server on port 4000
```

### 3. Run the Frontend Client:
In a second terminal window:
```bash
cd client
npm install
npm run dev   # starts Vite dev server on http://localhost:5173
```
Open [http://localhost:5173](http://localhost:5173) in your browser!

---

## 🌐 Deployment Instructions

### Deploying the Server (Render / Railway)
1. Push your repository to GitHub.
2. In **Render** or **Railway**, create a **New Web Service** pointing to the `server/` directory.
3. **Build Command:** `npm install` (or `./build.sh` if Emscripten is configured in a custom Dockerfile).
4. **Start Command:** `node index.js`.
5. Set Environment Variables:
   - `PORT`: `4000` (or leave default on Render)
   - `CLIENT_URL`: `https://your-frontend.vercel.app`

### Deploying the Client (Vercel / Netlify)
1. In **Vercel** or **Netlify**, import the repository and set the **Root Directory** to `client`.
2. **Build Command:** `npm run build`.
3. **Output Directory:** `dist`.
4. Set Environment Variable:
   - `VITE_SERVER_URL`: `https://your-server.onrender.com`
5. Deploy! Your share links (`/room/ABC123`) will route smoothly thanks to Vite single-page application routing.
