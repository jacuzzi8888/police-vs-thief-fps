/**
 * Phase 3: Network Manager (raw WebSocket - no SDK dependency)
 * Connects to the Colyseus server via native WebSocket with JSON protocol.
 * Handles player sync, remote player rendering, and game state.
 */
var NetworkManager = function (app, sceneRoot) {
  this.app = app;
  this.sceneRoot = sceneRoot;
  this.ws = null;
  this.sessionId = null;
  this.myTeam = -1;
  this.isConnected = false;

  // Remote player entities: sessionId -> entity
  this.remotePlayers = {};
  this.remotePlayerData = {};

  // Callbacks
  this.onJoin = null;
  this.onKillMessage = null;
  this.onScoreUpdate = null;
  this.onHealthChange = null;
  this.onAmmoChange = null;
  this.onDeath = null;
  this.onRespawn = null;

  var host = window.location.hostname || 'localhost';
  this.serverUrl = 'ws://' + host + ':2567';
};

NetworkManager.prototype.connect = function (playerName) {
  var self = this;
  var statusEl = document.getElementById('connection-status');
  statusEl.textContent = 'Connecting...';

  try {
    this.ws = new WebSocket(this.serverUrl + '/fps_room');

    this.ws.onopen = function () {
      console.log('WebSocket connected');
      // Send join message
      self.ws.send(JSON.stringify({
        type: 'join',
        name: playerName
      }));
    };

    this.ws.onmessage = function (event) {
      try {
        var msg = JSON.parse(event.data);
        self._handleMessage(msg);
      } catch (e) {
        console.error('Failed to parse message:', e);
      }
    };

    this.ws.onerror = function (err) {
      console.error('WebSocket error:', err);
      statusEl.textContent = 'Connection error. Is the server running?';
    };

    this.ws.onclose = function () {
      console.log('WebSocket closed');
      self.isConnected = false;
    };

  } catch (e) {
    console.error('WebSocket error:', e);
    statusEl.textContent = 'WebSocket not supported';
  }
};

NetworkManager.prototype._handleMessage = function (msg) {
  var self = this;
  switch (msg.type) {
    case 'joined':
      this.sessionId = msg.sessionId;
      this.myTeam = msg.team;
      this.isConnected = true;
      document.getElementById('connection-status').textContent = 'Connected!';
      console.log('Joined as team:', msg.team === 0 ? 'Police' : 'Thief');
      if (this.onJoin) this.onJoin(msg);
      break;

    case 'state':
      // Full state sync - update all remote players
      if (msg.players) {
        Object.keys(msg.players).forEach(function (sid) {
          if (sid === self.sessionId) return;
          var data = msg.players[sid];
          self._syncRemotePlayer(sid, data);
        });
      }
      if (this.onScoreUpdate) this.onScoreUpdate(msg.policeScore, msg.thiefScore);
      break;

    case 'playerUpdate':
      // Incremental position update
      if (msg.sessionId !== this.sessionId) {
        this._syncRemotePlayer(msg.sessionId, msg);
      }
      break;

    case 'shoot':
      // Someone shot - could add visual effects
      break;

    case 'hit':
      // We got hit
      if (msg.sessionId === this.sessionId) {
        if (this.onHealthChange) this.onHealthChange(msg.health);
        if (msg.health <= 0 && this.onDeath) this.onDeath();
      }
      break;

    case 'respawn':
      if (msg.sessionId === this.sessionId && this.onRespawn) {
        this.onRespawn();
      }
      break;

    case 'killMessage':
      if (this.onKillMessage) this.onKillMessage(msg.message);
      break;

    case 'ammo':
      if (msg.sessionId === this.sessionId && this.onAmmoChange) {
        this.onAmmoChange(msg.ammo);
      }
      break;

    case 'error':
      console.error('Server error:', msg.message);
      break;
  }
};

NetworkManager.prototype._syncRemotePlayer = function (sessionId, data) {
  var entity = this.remotePlayers[sessionId];

  if (!entity) {
    // Create new remote player
    entity = this._createRemotePlayer(sessionId, data);
  }

  if (data.alive === false) {
    entity.enabled = false;
  } else {
    entity.enabled = true;
    entity.setPosition(data.x, data.y + 0.9, data.z);
    entity.setEulerAngles(0, data.rotY * (180 / Math.PI), 0);
  }

  this.remotePlayerData[sessionId] = data;
};

NetworkManager.prototype._createRemotePlayer = function (sessionId, data) {
  var entity = new pc.Entity('remote_' + sessionId);

  var bodyEntity = new pc.Entity('body');
  bodyEntity.addComponent('render', {
    type: 'capsule',
    height: 1.8,
    radius: 0.35
  });

  var color = data.team === 0
    ? new pc.Color(0.2, 0.4, 0.9)
    : new pc.Color(0.9, 0.2, 0.2);
  bodyEntity.render.meshInstances[0].material.diffuse = color;
  bodyEntity.render.meshInstances[0].material.update();

  entity.addChild(bodyEntity);
  entity.setPosition(data.x, data.y + 0.9, data.z);
  this.sceneRoot.addChild(entity);
  this.remotePlayers[sessionId] = entity;
  return entity;
};

NetworkManager.prototype.sendMove = function (x, y, z) {
  if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
  this.ws.send(JSON.stringify({
    type: 'move',
    x: x, y: y, z: z
  }));
};

NetworkManager.prototype.sendLook = function (rotY) {
  if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
  this.ws.send(JSON.stringify({
    type: 'look',
    rotY: rotY
  }));
};

NetworkManager.prototype.sendShoot = function () {
  if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
  this.ws.send(JSON.stringify({ type: 'shoot' }));
};

NetworkManager.prototype.sendReload = function () {
  if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
  this.ws.send(JSON.stringify({ type: 'reload' }));
};
