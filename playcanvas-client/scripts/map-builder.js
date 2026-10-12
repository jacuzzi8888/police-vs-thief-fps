/**
 * Map Builder - Lagos Street (reference-matched)
 * Dense low-poly street with sand buildings, market stalls,
 * palms, power lines, Nigerian flag, orange car, and blue sky.
 */
var MapBuilder = function (app, sceneRoot) {
  this.app = app;
  this.root = sceneRoot;
};

// Shared material cache
var _mats = {};
function mat(color) {
  var key = color[0]+','+color[1]+','+color[2];
  if (!_mats[key]) {
    var m = new pc.StandardMaterial();
    m.diffuse = new pc.Color(color[0], color[1], color[2]);
    m.update();
    _mats[key] = m;
  }
  return _mats[key];
}

function box(size, color, px, py, pz) {
  var e = new pc.Entity('b');
  e.addComponent('render', { type: 'box', size: new pc.Vec3(size[0], size[1], size[2]) });
  e.render.meshInstances[0].material = mat(color);
  e.setPosition(px, py, pz);
  return e;
}

MapBuilder.prototype.build = function () {
  this._skybox();
  this._clouds();
  this._ground();
  this._street();
  this._sidewalks();
  this._buildings();
  this._marketStalls();
  this._crates();
  this._car();
  this._barriers();
  this._palms();
  this._streetLamps();
  this._flag();
  this._utilityPoles();
  this._powerLines();
  this._signs();
  this._boundaryWalls();
  this._lighting();
};

// ---- Sky (camera clear color) ----
MapBuilder.prototype._skybox = function () {
  this.app.scene.clearColor = new pc.Color(0.42, 0.68, 0.92);
  this.app.scene.fog = pc.FOG_NONE;
};

// ---- Low-poly clouds ----
MapBuilder.prototype._clouds = function () {
  var cloudMat = mat([0.95, 0.95, 0.97]);
  var clouds = [
    { x: 8, y: 22, z: -15, s: [5, 1.2, 3] },
    { x: -6, y: 24, z: -20, s: [4, 1.0, 2.5] },
    { x: 15, y: 20, z: 10, s: [6, 1.4, 3.5] },
    { x: -12, y: 23, z: 18, s: [4.5, 1.1, 2.8] },
  ];
  for (var i = 0; i < clouds.length; i++) {
    var c = clouds[i];
    // Main body
    var body = box(c.s, [0.95, 0.95, 0.97], c.x, c.y, c.z);
    this.root.addChild(body);
    // Puffs
    var puffs = [
      [c.x - c.s[0]*0.3, c.y + 0.4, c.z, [c.s[0]*0.5, c.s[1]*0.8, c.s[2]*0.7]],
      [c.x + c.s[0]*0.3, c.y + 0.3, c.z - c.s[2]*0.2, [c.s[0]*0.45, c.s[1]*0.7, c.s[2]*0.65]],
      [c.x, c.y + 0.5, c.z + c.s[2]*0.15, [c.s[0]*0.4, c.s[1]*0.75, c.s[2]*0.6]],
    ];
    for (var p = 0; p < puffs.length; p++) {
      var puff = box(puffs[p][3], [0.95, 0.95, 0.97], puffs[p][0], puffs[p][1], puffs[p][2]);
      this.root.addChild(puff);
    }
  }
};

// ---- Ground (gray pavement) ----
MapBuilder.prototype._createGround = function () {
  // We don't call this separately; _ground handles it
};

MapBuilder.prototype._ground = function () {
  var ground = box([50, 0.2, 50], [0.58, 0.56, 0.52], 0, -0.1, 0);
  this.root.addChild(ground);
};

// ---- Street (light gray asphalt) ----
MapBuilder.prototype._street = function () {
  var street = box([10, 0.06, 50], [0.62, 0.60, 0.57], 0, 0.01, 0);
  this.root.addChild(street);
  // Center line (faint)
  var line = box([0.15, 0.07, 50], [0.72, 0.70, 0.67], 0, 0.02, 0);
  this.root.addChild(line);
};

// ---- Sidewalks ----
MapBuilder.prototype._sidewalks = function () {
  // Left sidewalk
  var left = box([4, 0.15, 50], [0.70, 0.68, 0.64], -7, 0.07, 0);
  this.root.addChild(left);
  // Right sidewalk
  var right = box([4, 0.15, 50], [0.70, 0.68, 0.64], 7, 0.07, 0);
  this.root.addChild(right);
  // Curb edges
  var curbL = box([0.2, 0.2, 50], [0.55, 0.53, 0.50], -5, 0.1, 0);
  this.root.addChild(curbL);
  var curbR = box([0.2, 0.2, 50], [0.55, 0.53, 0.50], 5, 0.1, 0);
  this.root.addChild(curbR);
};

// ---- Buildings (sand/beige, arched windows, balconies) ----
MapBuilder.prototype._buildings = function () {
  var sand   = [0.82, 0.75, 0.60];
  var beige  = [0.88, 0.82, 0.68];
  var tan    = [0.78, 0.68, 0.52];
  var cream  = [0.90, 0.85, 0.70];
  var warm   = [0.85, 0.72, 0.55];

  var buildingData = [
    // Left side
    { x:-13, z:-22, w:7, h:10, d:6, c:sand },
    { x:-13, z:-13, w:7, h:12, d:6, c:beige },
    { x:-13, z: -4, w:7, h: 9, d:6, c:tan },
    { x:-13, z:  5, w:7, h:11, d:6, c:cream },
    { x:-13, z: 14, w:7, h:10, d:6, c:warm },
    { x:-13, z: 22, w:6, h: 8, d:5, c:sand },
    // Right side
    { x: 13, z:-22, w:7, h:11, d:6, c:beige },
    { x: 13, z:-13, w:7, h: 9, d:6, c:sand },
    { x: 13, z: -4, w:7, h:12, d:6, c:cream },
    { x: 13, z:  5, w:7, h:10, d:6, c:tan },
    { x: 13, z: 14, w:7, h: 9, d:6, c:warm },
    { x: 13, z: 22, w:6, h: 8, d:5, c:beige },
    // Far end
    { x: -4, z:-24, w:5, h:10, d:4, c:sand },
    { x:  4, z:-24, w:5, h:10, d:4, c:beige },
    { x: -4, z: 24, w:5, h:10, d:4, c:tan },
    { x:  4, z: 24, w:5, h:10, d:4, c:cream },
  ];

  for (var i = 0; i < buildingData.length; i++) {
    this._createBuilding(buildingData[i]);
  }
};

MapBuilder.prototype._createBuilding = function (cfg) {
  var g = new pc.Entity('bldg');
  // Main body
  var body = box([cfg.w, cfg.h, cfg.d], cfg.c, 0, cfg.h/2, 0);
  g.addChild(body);

  // Roof trim (darker band)
  var trim = box([cfg.w+0.3, 0.3, cfg.d+0.3], [cfg.c[0]*0.65, cfg.c[1]*0.60, cfg.c[2]*0.50], 0, cfg.h+0.15, 0);
  g.addChild(trim);

  // Top ledge
  var ledge = box([cfg.w+0.5, 0.15, cfg.d+0.5], [cfg.c[0]*0.7, cfg.c[1]*0.65, cfg.c[2]*0.55], 0, cfg.h+0.38, 0);
  g.addChild(ledge);

  // Arched windows (dark rectangles with arched tops simulated by smaller box on top)
  var rows = Math.floor(cfg.h / 3.2);
  var cols = Math.floor(cfg.w / 2.4);
  var winDark = [0.18, 0.16, 0.14];
  var frameColor = [cfg.c[0]*0.75, cfg.c[1]*0.70, cfg.c[2]*0.60];

  for (var r = 0; r < rows; r++) {
    for (var c = 0; c < cols; c++) {
      var wx = (c - (cols-1)/2) * 2.2;
      var wy = -cfg.h/2 + 2.2 + r * 3.2;
      // Window recess
      var win = box([0.8, 1.3, 0.12], winDark, wx, wy, cfg.d/2+0.06);
      g.addChild(win);
      // Frame
      var frame = box([1.0, 0.08, 0.14], frameColor, wx, wy+0.7, cfg.d/2+0.07);
      g.addChild(frame);
      // Arch top
      var arch = box([0.8, 0.25, 0.12], frameColor, wx, wy+0.82, cfg.d/2+0.06);
      g.addChild(arch);

      // Back side windows too
      var winB = box([0.8, 1.3, 0.12], winDark, wx, wy, -cfg.d/2-0.06);
      g.addChild(winB);
    }
  }

  // Balcony on some taller buildings
  if (cfg.h >= 11) {
    var balconyY = -cfg.h/2 + 5.5;
    // Floor
    var bFloor = box([cfg.w*0.5, 0.12, 1.2], frameColor, 0, balconyY, cfg.d/2+0.6);
    g.addChild(bFloor);
    // Railing
    var rail = box([cfg.w*0.5, 0.8, 0.08], [0.35, 0.30, 0.25], 0, balconyY+0.46, cfg.d/2+1.16);
    g.addChild(rail);
    // Railing posts
    for (var rp = 0; rp < 3; rp++) {
      var rx = (rp - 1) * cfg.w * 0.22;
      var post = box([0.06, 0.8, 0.06], [0.35, 0.30, 0.25], rx, balconyY+0.46, cfg.d/2+1.16);
      g.addChild(post);
    }
  }

  g.setPosition(cfg.x, 0, cfg.z);
  this.root.addChild(g);
};

// ---- Market Stalls (orange canopy, fruit tables) ----
MapBuilder.prototype._marketStalls = function () {
  var stalls = [
    { x: -9, z: -8,  canopyColor: [0.85, 0.35, 0.12] },
    { x: -9, z:  2,  canopyColor: [0.75, 0.30, 0.10] },
    { x:  9, z: -6,  canopyColor: [0.20, 0.55, 0.25] },
    { x:  9, z:  4,  canopyColor: [0.20, 0.50, 0.20] },
  ];

  for (var i = 0; i < stalls.length; i++) {
    this._createStall(stalls[i]);
  }
};

MapBuilder.prototype._createStall = function (cfg) {
  var g = new pc.Entity('stall');
  var woodColor = [0.50, 0.38, 0.24];
  var canopyH = 2.8;

  // 4 poles
  var poles = [[-1.4, 0, -0.8], [1.4, 0, -0.8], [-1.4, 0, 0.8], [1.4, 0, 0.8]];
  for (var p = 0; p < poles.length; p++) {
    var pole = box([0.10, canopyH, 0.10], woodColor, poles[p][0], canopyH/2, poles[p][2]);
    g.addChild(pole);
  }

  // Canopy roof (pyramid-like: flat top + angled sides via two boxes)
  var canopyTop = box([3.6, 0.10, 2.4], cfg.canopyColor, 0, canopyH + 0.05, 0);
  g.addChild(canopyTop);
  // Canopy slope edges
  var slope1 = box([3.6, 0.08, 0.4], cfg.canopyColor, 0, canopyH - 0.15, -1.0);
  g.addChild(slope1);
  var slope2 = box([3.6, 0.08, 0.4], cfg.canopyColor, 0, canopyH - 0.15, 1.0);
  g.addChild(slope2);

  // Table
  var table = box([2.8, 0.08, 1.2], woodColor, 0, 0.75, 0);
  g.addChild(table);
  // Table legs
  var tLegs = [[-1.2, 0, -0.5], [1.2, 0, -0.5], [-1.2, 0, 0.5], [1.2, 0, 0.5]];
  for (var tl = 0; tl < tLegs.length; tl++) {
    var tLeg = box([0.08, 0.75, 0.08], woodColor, tLegs[tl][0], 0.37, tLegs[tl][2]);
    g.addChild(tLeg);
  }

  // Fruit pile (colorful spheres simulated as small boxes)
  var fruits = [
    [0.85, 0.75, 0.10], // yellow (mango)
    [0.90, 0.40, 0.10], // orange
    [0.20, 0.60, 0.15], // green (lime)
    [0.85, 0.20, 0.15], // red (tomato)
  ];
  for (var f = 0; f < fruits.length; f++) {
    for (var fx = 0; fx < 3; fx++) {
      var fruit = box([0.22, 0.20, 0.22], fruits[f], -0.8 + fx * 0.55, 0.92, (f%2 === 0 ? 0.15 : -0.15));
      g.addChild(fruit);
    }
  }

  g.setPosition(cfg.x, 0, cfg.z);
  this.root.addChild(g);
};

// ---- Crates ----
MapBuilder.prototype._crates = function () {
  var cratePositions = [
    [-4, -10], [4, -7], [-3, 1], [5, 6],
    [-6, 12], [3, -15], [-2, 18], [6, -18],
    [-5, -3], [4, 14], [-4, 8], [5, -12],
  ];
  var crateMat = mat([0.50, 0.38, 0.22]);

  for (var i = 0; i < cratePositions.length; i++) {
    var crate = box([0.85, 0.85, 0.85], [0.50, 0.38, 0.22], cratePositions[i][0], 0.43, cratePositions[i][1]);
    this.root.addChild(crate);
  }

  // Stacked crates
  var stacks = [[-5, -3], [4, 14]];
  for (var s = 0; s < stacks.length; s++) {
    var crate2 = box([0.85, 0.85, 0.85], [0.48, 0.36, 0.20], stacks[s][0], 1.28, stacks[s][1]);
    this.root.addChild(crate2);
  }
};

// ---- Orange Car ----
MapBuilder.prototype._car = function () {
  var car = new pc.Entity('car');
  var orange = [0.92, 0.42, 0.08];
  var darkOrange = [0.72, 0.32, 0.05];
  var glass = [0.30, 0.38, 0.45];
  var black = [0.12, 0.12, 0.12];
  var gray = [0.30, 0.30, 0.30];

  // Lower body
  var lower = box([1.9, 0.7, 4.0], orange, 0, 0.45, 0);
  car.addChild(lower);

  // Cabin
  var cabin = box([1.7, 0.65, 1.9], darkOrange, 0, 1.05, -0.3);
  car.addChild(cabin);

  // Windshield
  var wind = box([1.55, 0.50, 0.05], glass, 0, 1.05, 0.68);
  car.addChild(wind);

  // Rear window
  var rear = box([1.50, 0.45, 0.05], glass, 0, 1.05, -1.23);
  car.addChild(rear);

  // Headlights
  var hlMat = mat([0.95, 0.90, 0.70]);
  var hl1 = box([0.35, 0.20, 0.06], [0.95, 0.90, 0.70], -0.6, 0.50, 2.01);
  car.addChild(hl1);
  var hl2 = box([0.35, 0.20, 0.06], [0.95, 0.90, 0.70], 0.6, 0.50, 2.01);
  car.addChild(hl2);

  // Tail lights
  var tl1 = box([0.30, 0.18, 0.06], [0.80, 0.10, 0.10], -0.6, 0.50, -2.01);
  car.addChild(tl1);
  var tl2 = box([0.30, 0.18, 0.06], [0.80, 0.10, 0.10], 0.6, 0.50, -2.01);
  car.addChild(tl2);

  // Bumpers
  var fb = box([1.7, 0.20, 0.15], gray, 0, 0.30, 2.05);
  car.addChild(fb);
  var rb = box([1.7, 0.20, 0.15], gray, 0, 0.30, -2.05);
  car.addChild(rb);

  // Wheels
  var wheelPositions = [[-0.85, 0.28, 1.2], [0.85, 0.28, 1.2], [-0.85, 0.28, -1.2], [0.85, 0.28, -1.2]];
  for (var w = 0; w < wheelPositions.length; w++) {
    var wheel = new pc.Entity('wheel');
    wheel.addComponent('render', { type: 'cylinder', radius: 0.30, height: 0.20 });
    wheel.render.meshInstances[0].material = mat(black);
    wheel.setLocalPosition(wheelPositions[w][0], wheelPositions[w][1], wheelPositions[w][2]);
    wheel.setLocalEulerAngles(0, 0, 90);
    car.addChild(wheel);
    // Hubcap
    var hub = new pc.Entity('hub');
    hub.addComponent('render', { type: 'cylinder', radius: 0.15, height: 0.22 });
    hub.render.meshInstances[0].material = mat(gray);
    hub.setLocalPosition(wheelPositions[w][0], wheelPositions[w][1], wheelPositions[w][2]);
    hub.setLocalEulerAngles(0, 0, 90);
    car.addChild(hub);
  }

  car.setPosition(3.5, 0, 2);
  car.setEulerAngles(0, 12, 0);
  this.root.addChild(car);
};

// ---- Concrete Barriers ----
MapBuilder.prototype._barriers = function () {
  var barrierColor = [0.60, 0.58, 0.55];
  var barriers = [
    [5.5, 0.4, 4],
    [5.5, 0.4, 5.5],
  ];
  for (var i = 0; i < barriers.length; i++) {
    // Jersey barrier shape (trapezoid approximated with box)
    var base = box([0.6, 0.8, 1.8], barrierColor, barriers[i][0], barriers[i][1], barriers[i][2]);
    this.root.addChild(base);
    // Top narrow part
    var top = box([0.3, 0.25, 1.8], barrierColor, barriers[i][0], barriers[i][1]+0.52, barriers[i][2]);
    this.root.addChild(top);
  }
};

// ---- Palm Trees ----
MapBuilder.prototype._palms = function () {
  var palms = [
    { x: -11, z: -16 },
    { x: -11, z:   8 },
    { x:  11, z: -10 },
    { x:  11, z:  16 },
    { x:  -8, z: -22 },
    { x:   8, z:  22 },
  ];
  for (var i = 0; i < palms.length; i++) {
    this._createPalm(palms[i].x, palms[i].z);
  }
};

MapBuilder.prototype._createPalm = function (x, z) {
  var palm = new pc.Entity('palm');
  var trunkH = 5.5;

  // Trunk (slightly tapered via two cylinders)
  var trunk = new pc.Entity('trunk');
  trunk.addComponent('render', { type: 'cylinder', radius: 0.14, height: trunkH });
  trunk.render.meshInstances[0].material = mat([0.48, 0.35, 0.20]);
  trunk.setLocalPosition(0, trunkH/2, 0);
  palm.addChild(trunk);

  // Trunk rings (texture detail)
  for (var r = 0; r < 6; r++) {
    var ring = new pc.Entity('ring');
    ring.addComponent('render', { type: 'cylinder', radius: 0.17, height: 0.08 });
    ring.render.meshInstances[0].material = mat([0.38, 0.28, 0.15]);
    ring.setLocalPosition(0, 0.8 + r * 0.85, 0);
    palm.addChild(ring);
  }

  // Fronds
  var frondColor = [0.18, 0.52, 0.14];
  var frondCount = 7;
  for (var f = 0; f < frondCount; f++) {
    var angle = (360 / frondCount) * f;
    // Main frond
    var frond = new pc.Entity('frond');
    frond.addComponent('render', { type: 'box', size: new pc.Vec3(0.12, 0.05, 2.5) });
    frond.render.meshInstances[0].material = mat(frondColor);
    frond.setLocalPosition(0, trunkH + 0.1, 0);
    frond.setLocalEulerAngles(-30, angle, 0);
    palm.addChild(frond);
    // Drooping tip
    var tip = new pc.Entity('tip');
    tip.addComponent('render', { type: 'box', size: new pc.Vec3(0.08, 0.04, 1.2) });
    tip.render.meshInstances[0].material = mat([0.15, 0.45, 0.12]);
    tip.setLocalPosition(0, trunkH - 0.8, 0);
    tip.setLocalEulerAngles(40, angle, 0);
    palm.addChild(tip);
  }

  // Coconut cluster
  var coconuts = new pc.Entity('coconuts');
  coconuts.addComponent('render', { type: 'sphere', radius: 0.30 });
  coconuts.render.meshInstances[0].material = mat([0.40, 0.30, 0.15]);
  coconuts.setLocalPosition(0, trunkH + 0.05, 0);
  palm.addChild(coconuts);

  palm.setPosition(x, 0, z);
  this.root.addChild(palm);
};

// ---- Street Lamps ----
MapBuilder.prototype._streetLamps = function () {
  var lampPositions = [
    [-5.5, -14], [-5.5, -4], [-5.5, 6], [-5.5, 16],
    [5.5, -14], [5.5, -4], [5.5, 6], [5.5, 16],
  ];
  var poleColor = [0.20, 0.20, 0.20];
  var lampColor = [0.95, 0.90, 0.70];

  for (var i = 0; i < lampPositions.length; i++) {
    var lamp = new pc.Entity('lamp');
    // Pole
    var pole = box([0.08, 3.5, 0.08], poleColor, 0, 1.75, 0);
    lamp.addChild(pole);
    // Arm
    var arm = box([0.8, 0.06, 0.06], poleColor, 0.35, 3.5, 0);
    lamp.addChild(arm);
    // Lantern housing
    var housing = box([0.30, 0.40, 0.30], poleColor, 0.75, 3.3, 0);
    lamp.addChild(housing);
    // Light glow
    var glow = box([0.20, 0.25, 0.20], lampColor, 0.75, 3.15, 0);
    lamp.addChild(glow);
    // Top cap
    var cap = box([0.35, 0.08, 0.35], poleColor, 0.75, 3.54, 0);
    lamp.addChild(cap);

    lamp.setPosition(lampPositions[i][0], 0, lampPositions[i][1]);
    this.root.addChild(lamp);
  }
};

// ---- Nigerian Flag ----
MapBuilder.prototype._flag = function () {
  var flagGroup = new pc.Entity('flag');

  // Pole
  var pole = box([0.06, 4.5, 0.06], [0.50, 0.45, 0.40], 0, 2.25, 0);
  flagGroup.addChild(pole);

  // Flag panels (green-white-green)
  var green = [0.00, 0.55, 0.00];
  var white = [0.95, 0.95, 0.95];
  var flagW = 0.6;
  var flagH = 1.0;

  var leftGreen = box([flagW, flagH, 0.04], green, -flagW, 3.5, 0);
  flagGroup.addChild(leftGreen);
  var centerWhite = box([flagW, flagH, 0.04], white, 0, 3.5, 0);
  flagGroup.addChild(centerWhite);
  var rightGreen = box([flagW, flagH, 0.04], green, flagW, 3.5, 0);
  flagGroup.addChild(rightGreen);

  flagGroup.setPosition(-9, 0, -12);
  this.root.addChild(flagGroup);
};

// ---- Utility Poles ----
MapBuilder.prototype._utilityPoles = function () {
  var polePositions = [
    [-6, -18], [-6, -6], [-6, 6], [-6, 18],
    [6, -18], [6, -6], [6, 6], [6, 18],
  ];
  var woodColor = [0.45, 0.35, 0.22];

  for (var i = 0; i < polePositions.length; i++) {
    var pole = new pc.Entity('upole');
    // Main pole
    var mainPole = box([0.12, 6, 0.12], woodColor, 0, 3, 0);
    pole.addChild(mainPole);
    // Cross arm
    var crossArm = box([1.5, 0.10, 0.10], woodColor, 0, 5.5, 0);
    pole.addChild(crossArm);
    // Second cross arm
    var crossArm2 = box([1.2, 0.08, 0.08], woodColor, 0, 5.0, 0);
    pole.addChild(crossArm2);
    // Insulators (small white boxes)
    var insulatorColor = [0.85, 0.82, 0.75];
    var ins1 = box([0.08, 0.15, 0.08], insulatorColor, -0.6, 5.55, 0);
    pole.addChild(ins1);
    var ins2 = box([0.08, 0.15, 0.08], insulatorColor, 0.6, 5.55, 0);
    pole.addChild(ins2);

    pole.setPosition(polePositions[i][0], 0, polePositions[i][1]);
    this.root.addChild(pole);
  }
};

// ---- Power Lines ----
MapBuilder.prototype._powerLines = function () {
  var lineColor = [0.15, 0.15, 0.15];
  var leftX = -6;
  var rightX = 6;
  var zPositions = [-18, -6, 6, 18];

  // Lines along left side poles
  for (var i = 0; i < zPositions.length - 1; i++) {
    var z1 = zPositions[i];
    var z2 = zPositions[i+1];
    var midZ = (z1 + z2) / 2;
    var span = z2 - z1;
    // Two wires at different heights
    var wire1 = box([0.03, 0.03, span], lineColor, leftX, 5.5, midZ);
    this.root.addChild(wire1);
    var wire2 = box([0.03, 0.03, span], lineColor, leftX, 5.0, midZ);
    this.root.addChild(wire2);
    // Right side
    var wire3 = box([0.03, 0.03, span], lineColor, rightX, 5.5, midZ);
    this.root.addChild(wire3);
    var wire4 = box([0.03, 0.03, span], lineColor, rightX, 5.0, midZ);
    this.root.addChild(wire4);
  }

  // Cross lines between left and right poles
  for (var j = 0; j < zPositions.length; j++) {
    var crossWire = box([12, 0.02, 0.02], lineColor, 0, 5.5, zPositions[j]);
    this.root.addChild(crossWire);
  }
};

// ---- Building Signs ----
MapBuilder.prototype._signs = function () {
  // Sign boards on buildings (text would require textures, so we use colored rectangles as placeholders)
  var signData = [
    { x: -9.7, y: 3.5, z: -8, w: 2.5, h: 1.0, color: [0.90, 0.88, 0.80], rot: 90 },
    { x:  9.7, y: 3.5, z:  4, w: 2.2, h: 0.9, color: [0.80, 0.30, 0.15], rot: -90 },
    { x:  0,   y: 4.0, z: -18, w: 1.8, h: 2.5, color: [0.88, 0.85, 0.75], rot: 0 },
  ];

  for (var i = 0; i < signData.length; i++) {
    var s = signData[i];
    var sign = box([s.w, s.h, 0.06], s.color, s.x, s.y, s.z);
    sign.setEulerAngles(0, s.rot, 0);
    this.root.addChild(sign);
  }
};

// ---- Boundary Walls ----
MapBuilder.prototype._boundaryWalls = function () {
  var wallColor = [0.60, 0.55, 0.48];
  var walls = [
    { pos: [0, 3.5, -25], size: [50, 7, 1] },
    { pos: [0, 3.5,  25], size: [50, 7, 1] },
    { pos: [-25, 3.5, 0], size: [1, 7, 50] },
    { pos: [ 25, 3.5, 0], size: [1, 7, 50] },
  ];
  for (var i = 0; i < walls.length; i++) {
    var w = walls[i];
    var wall = box(w.size, wallColor, w.pos[0], w.pos[1], w.pos[2]);
    this.root.addChild(wall);
  }
};

// ---- Lighting ----
MapBuilder.prototype._lighting = function () {
  var sun = new pc.Entity('sun');
  sun.addComponent('light', {
    type: 'directional',
    color: new pc.Color(1, 0.95, 0.85),
    intensity: 1.4,
    castShadows: false
  });
  sun.setEulerAngles(55, 25, 0);
  this.root.addChild(sun);

  var ambient = new pc.Entity('ambient');
  ambient.addComponent('light', {
    type: 'ambient',
    color: new pc.Color(0.50, 0.52, 0.58),
    intensity: 0.65
  });
  this.root.addChild(ambient);
};
