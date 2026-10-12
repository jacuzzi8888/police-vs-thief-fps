/**
 * Main Game Entry Point
 * Initializes PlayCanvas, creates all systems, and runs the game loop.
 */
(function () {
  'use strict';

  // PlayCanvas Application
  var canvas = document.getElementById('application-canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';

  var app = new pc.Application(canvas, {
    mouse: new pc.Mouse(canvas),
    keyboard: new pc.Keyboard(window),
    touch: new pc.TouchDevice(canvas),
    graphicsDeviceOptions: {
      antialias: false,
      alpha: false
    }
  });

  // Scene root
  var sceneRoot = new pc.Entity('SceneRoot');
  app.root.addChild(sceneRoot);

  // Camera
  var camera = new pc.Entity('PlayerCamera');
  camera.addComponent('camera', {
    clearColor: new pc.Color(0.55, 0.7, 0.85),
    fov: 75,
    nearClip: 0.1,
    farClip: 500
  });
  camera.setPosition(0, 1.6, 0);
  sceneRoot.addChild(camera);

  // Initialize all systems
  var fpsController = new FpsController(app, camera, null);
  var mobileControls = new MobileControls(fpsController);
  var networkManager = new NetworkManager(app, sceneRoot);
  var teamManager = new TeamManager();
  var shootingSystem = new ShootingSystem(app, camera, networkManager, mobileControls);
  var mapBuilder = new MapBuilder(app, sceneRoot);
  var hudManager = new HudManager();
  var menuManager = new MenuManager();

  // Build the map
  mapBuilder.build();

  // Network sync throttling
  var lastSyncTime = 0;
  var syncInterval = 50; // ms - send position 20 times per second

  // Wire up network callbacks
  networkManager.onJoin = function (data) {
    teamManager.setTeam(data.team);
    fpsController.setPosition(data.x, data.y, data.z);
    fpsController.activate();

    // Hide menu, show HUD
    menuManager.hide();
    hudManager.show();

    // On mobile, request no pointer lock (we use touch)
    if (!fpsController.isMobile) {
      // Desktop: pointer lock will be requested on canvas click
    }
  };

  networkManager.onKillMessage = function (msg) {
    hudManager.addKillMessage(msg);
  };

  networkManager.onScoreUpdate = function (police, thief) {
    hudManager.updateScore(police, thief);
  };

  networkManager.onHealthChange = function (health) {
    hudManager.updateHealth(health);
  };

  networkManager.onAmmoChange = function (ammo) {
    hudManager.updateAmmo(ammo, 30);
    shootingSystem.setAmmo(ammo);
  };

  networkManager.onDeath = function () {
    fpsController.deactivate();
    hudManager.showDeathScreen();
  };

  networkManager.onRespawn = function () {
    hudManager.hideDeathScreen();
    fpsController.activate();
  };

  // Menu join handler
  menuManager.onJoin(function (name) {
    menuManager.setStatus('Connecting to server...');
    networkManager.connect(name);
  });

  // Main update loop
  var lastLookSync = 0;

  app.on('update', function (dt) {
    if (!fpsController.isActive) return;

    // Update FPS controller (handles input + movement)
    var state = fpsController.update(dt);
    if (!state) return;

    // Update shooting
    shootingSystem.update();

    // Sync position to server (throttled)
    var now = Date.now();
    if (now - lastSyncTime > syncInterval) {
      networkManager.sendMove(state.x, state.y, state.z);
      lastSyncTime = now;
    }

    // Sync rotation (less frequent to save bandwidth)
    if (now - lastLookSync > 100) {
      networkManager.sendLook(state.rotY);
      lastLookSync = now;
    }
  });

  // Handle resize - force canvas to fill viewport
  function doResize() {
    var w = window.innerWidth;
    var h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    app.resizeCanvas(w, h);
  }
  window.addEventListener('resize', doResize);

  // Start the application
  app.start();
  doResize();

  console.log('Police vs Thief - Lagos FPS initialized');
  console.log('Waiting for player to join...');
})();
