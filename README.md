# Police vs Thief - Lagos FPS

A browser-based 5v5 multiplayer low-poly FPS built with PlayCanvas + Colyseus.

## Architecture

```
police-thief-server/    → Colyseus authoritative server (TypeScript)
playcanvas-client/      → PlayCanvas game client (JavaScript)
```

## Quick Start

### 1. Start the Server

```bash
cd police-thief-server
npm install
npm run dev
```

Server runs on `ws://localhost:2567`

### 2. Open the Client

Open `playcanvas-client/index.html` in a browser.

For multiplayer across devices, serve the client via the built-in Express server:

```bash
# Server already serves the client folder at http://localhost:2567
```

Or use any static server:

```bash
cd playcanvas-client
npx http-server -p 8080
```

### 3. Connect

- Open the client URL on **multiple devices** (PC + mobile)
- Enter a name → click **Join Match**
- Players are auto-assigned to Police (blue) or Thief (red)

### Deployment (for remote testing)

**Option A: ngrok tunnel**
```bash
# Terminal 1 - server
cd police-thief-server && npm run dev

# Terminal 2 - tunnel
ngrok http 2567
```
Update `serverUrl` in `network-manager.js` with the ngrok URL.

**Option B: Railway / Render / Fly.io**
Push the `police-thief-server` folder and deploy as a Node.js app.

## Controls

### PC (Keyboard + Mouse)
| Input | Action |
|-------|--------|
| WASD | Move |
| Mouse | Look |
| Left Click | Fire |
| Space | Jump |
| R | Reload |
| Click canvas | Lock pointer |

### Mobile (Touch)
| Input | Action |
|-------|--------|
| Left joystick | Move |
| Right side drag | Look |
| FIRE button | Shoot |
| JUMP button | Jump |
| R button | Reload |

## Project Phases

| Phase | Feature | Files |
|-------|---------|-------|
| 0 | Setup | `package.json`, `tsconfig.json`, `index.ts` |
| 1 | FPS Movement | `fps-controller.js` |
| 2 | Mobile Controls | `mobile-controls.js` |
| 3 | Multiplayer Sync | `network-manager.js`, `FpsRoom.ts` |
| 4 | Teams | `team-manager.js`, Player schema |
| 5 | Shooting & Health | `shooting-system.js`, server hitscan |
| 6 | Map | `map-builder.js` |
| 7 | HUD & Score | `hud-manager.js` |
| 8 | Menu & Polish | `menu-manager.js`, `game.js` |

## Server Schemas

### Player
- `x, y, z` - position
- `rotY` - rotation
- `health` - HP (0-100)
- `team` - 0=Police, 1=Thief
- `alive` - alive/dead state
- `ammo` - current ammo
- `kills, deaths` - stats

### GameState
- `players` - Map of all connected players
- `policeScore, thiefScore` - team scores
- `lastKillMessage` - kill feed

## Notes

- Server is authoritative for hitscan/hit detection
- Position sync is throttled to 20Hz, rotation to 10Hz
- Respawn after 3 seconds on death
- Team balancing: auto-assigned to smaller team on join
- Map is procedurally generated with low-poly Lagos-inspired buildings
