import WebSocketLib from "ws";
const { WebSocketServer, WebSocket, OPEN } = WebSocketLib;
import { Server } from "http";

interface Player {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  rotY: number;
  health: number;
  team: number;
  alive: boolean;
  ammo: number;
  kills: number;
  deaths: number;
  isShooting: boolean;
  lastShotTime: number;
  ws: any;
}

const POLICE_SPAWNS = [
  { x: -5, y: 1.6, z: -20 },
  { x: -3, y: 1.6, z: -20 },
  { x: -7, y: 1.6, z: -20 },
  { x: -5, y: 1.6, z: -17 },
  { x: -3, y: 1.6, z: -17 },
];

const THIEF_SPAWNS = [
  { x: 5, y: 1.6, z: 20 },
  { x: 3, y: 1.6, z: 20 },
  { x: 7, y: 1.6, z: 20 },
  { x: 5, y: 1.6, z: 17 },
  { x: 3, y: 1.6, z: 17 },
];

const FIRE_RATE_MS = 200;
const DAMAGE = 25;
const MAX_HEALTH = 100;
const RESPAWN_MS = 3000;
const MAX_AMMO = 30;
const STATE_BROADCAST_MS = 50;

let players = new Map<string, Player>();
let policeScore = 0;
let thiefScore = 0;
let lastKillMessage = "";
let idCounter = 0;

function send(ws: any, data: any) {
  if (ws.readyState === OPEN) {
    ws.send(JSON.stringify(data));
  }
}

function broadcast(data: any, excludeId?: string) {
  const msg = JSON.stringify(data);
  const arr = Array.from(players.values());
  for (const p of arr) {
    if (p.id !== excludeId && p.ws.readyState === OPEN) {
      p.ws.send(msg);
    }
  }
}

function broadcastAll(data: any) {
  const msg = JSON.stringify(data);
  const arr = Array.from(players.values());
  for (const p of arr) {
    if (p.ws.readyState === OPEN) {
      p.ws.send(msg);
    }
  }
}

function spawnPlayer(ws: any, name: string): Player {
  let policeCount = 0, thiefCount = 0;
  const arr = Array.from(players.values());
  for (const p of arr) {
    if (p.team === 0) policeCount++;
    else thiefCount++;
  }
  const team = policeCount <= thiefCount ? 0 : 1;
  const spawns = team === 0 ? POLICE_SPAWNS : THIEF_SPAWNS;
  const spawn = spawns[Math.floor(Math.random() * spawns.length)];

  const player: Player = {
    id: `p${++idCounter}`,
    name: name || `Player_${idCounter}`,
    x: spawn.x, y: spawn.y, z: spawn.z,
    rotY: 0,
    health: MAX_HEALTH,
    team,
    alive: true,
    ammo: MAX_AMMO,
    kills: 0,
    deaths: 0,
    isShooting: false,
    lastShotTime: 0,
    ws,
  };

  players.set(player.id, player);
  return player;
}

function respawnPlayer(player: Player) {
  const spawns = player.team === 0 ? POLICE_SPAWNS : THIEF_SPAWNS;
  const spawn = spawns[Math.floor(Math.random() * spawns.length)];
  player.x = spawn.x;
  player.y = spawn.y;
  player.z = spawn.z;
  player.health = MAX_HEALTH;
  player.alive = true;
  player.ammo = MAX_AMMO;
  player.isShooting = false;
  send(player.ws, { type: "respawn", sessionId: player.id });
  broadcastState();
}

function broadcastState() {
  const statePlayers: Record<string, any> = {};
  const arr = Array.from(players.values());
  for (const p of arr) {
    statePlayers[p.id] = {
      x: p.x, y: p.y, z: p.z,
      rotY: p.rotY,
      health: p.health,
      team: p.team,
      alive: p.alive,
      ammo: p.ammo,
    };
  }
  broadcastAll({
    type: "state",
    players: statePlayers,
    policeScore,
    thiefScore,
  });
}

function handleShoot(shooter: Player) {
  if (!shooter.alive) return;
  if (shooter.ammo <= 0) return;
  const now = Date.now();
  if (now - shooter.lastShotTime < FIRE_RATE_MS) return;
  shooter.lastShotTime = now;
  shooter.ammo--;

  send(shooter.ws, { type: "ammo", sessionId: shooter.id, ammo: shooter.ammo });

  const shootDir = {
    x: Math.sin(shooter.rotY),
    z: Math.cos(shooter.rotY),
  };

  let closestHit: Player | null = null;
  let closestDist = Infinity;
  const MAX_RANGE = 50;
  const HIT_RADIUS = 1.5;

  const playerArray = Array.from(players.values());
  for (const other of playerArray) {
    if (other.id === shooter.id) continue;
    if (!other.alive) continue;
    if (other.team === shooter.team) continue;

    const dx = other.x - shooter.x;
    const dz = other.z - shooter.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist > MAX_RANGE || dist >= closestDist) continue;

    const dot = (dx * shootDir.x + dz * shootDir.z) / dist;
    if (dot < 0.9) continue;

    const dy = Math.abs(other.y - shooter.y);
    if (dy > 3) continue;

    const lateral = dist * Math.sqrt(1 - dot * dot);
    if (lateral < HIT_RADIUS) {
      closestHit = other;
      closestDist = dist;
    }
  }

  if (closestHit !== null) {
    closestHit.health -= DAMAGE;
    send(closestHit.ws, { type: "hit", sessionId: closestHit.id, health: closestHit.health });

    if (closestHit.health <= 0) {
      closestHit.alive = false;
      closestHit.health = 0;
      closestHit.deaths++;
      shooter.kills++;

      if (shooter.team === 0) policeScore++;
      else thiefScore++;

      const teamName = shooter.team === 0 ? "Police" : "Thief";
      lastKillMessage = `${shooter.name} [${teamName}] eliminated ${closestHit.name}`;
      broadcastAll({ type: "killMessage", message: lastKillMessage });
      broadcastState();

      setTimeout(() => respawnPlayer(closestHit!), RESPAWN_MS);
    } else {
      broadcastState();
    }
  }

  broadcast({ type: "shoot", sessionId: shooter.id }, shooter.id);
}

function handleMessage(ws: any, raw: string) {
  let msg: any;
  try {
    msg = JSON.parse(raw);
  } catch {
    return;
  }

  let player: Player | undefined;
  const arr = Array.from(players.values());
  for (const p of arr) {
    if (p.ws === ws) { player = p; break; }
  }

  switch (msg.type) {
    case "join": {
      const p = spawnPlayer(ws, msg.name);
      send(ws, {
        type: "joined",
        sessionId: p.id,
        team: p.team,
        x: p.x, y: p.y, z: p.z,
      });
      console.log(`${p.name} joined as ${p.team === 0 ? "Police" : "Thief"}`);
      broadcastState();
      break;
    }
    case "move":
      if (player && player.alive) {
        player.x = msg.x;
        player.y = msg.y;
        player.z = msg.z;
      }
      break;
    case "look":
      if (player && player.alive) {
        player.rotY = msg.rotY;
      }
      break;
    case "shoot":
      if (player) handleShoot(player);
      break;
    case "reload":
      if (player && player.alive) {
        setTimeout(() => {
          if (player) {
            player.ammo = MAX_AMMO;
            send(player.ws, { type: "ammo", sessionId: player.id, ammo: player.ammo });
          }
        }, 2000);
      }
      break;
  }
}

export function setupWebSocketServer(httpServer: Server) {
  const wss = new WebSocketServer({ server: httpServer, path: "/fps_room" });

  wss.on("connection", (ws: any) => {
    console.log("New WebSocket connection");

    ws.on("message", (data: Buffer) => {
      handleMessage(ws as WebSocket, data.toString());
    });

    ws.on("close", () => {
      const arr = Array.from(players.values());
      for (const p of arr) {
        if (p.ws === ws) {
          console.log(`${p.name} disconnected`);
          players.delete(p.id);
          broadcastState();
          break;
        }
      }
    });
  });

  setInterval(() => {
    if (players.size > 0) broadcastState();
  }, STATE_BROADCAST_MS);

  console.log("WebSocket server ready at /fps_room");
}
