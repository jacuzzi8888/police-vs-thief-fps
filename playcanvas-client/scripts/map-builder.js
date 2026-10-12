/**
 * Map Builder - Dense Lagos Street Layout
 * Compact 50x50 neighborhood with buildings flanking a central street,
 * market stalls, palms, crates, and an orange car.
 */
var MapBuilder = function (app, sceneRoot) {
  this.app = app;
  this.root = sceneRoot;
};

MapBuilder.prototype.build = function () {
  this._createGround();
  this._createStreet();
  this._createBuildings();
  this._createMarketStalls();
  this._createCrates();
  this._createCar();
  this._createPalms();
  this._createBoundaryWalls();
  this._createLighting();
  this._createSpawnMarkers();
};

// ---- Ground ----
MapBuilder.prototype._createGround = function () {
  var ground = new pc.Entity('ground');
  ground.addComponent('render', { type: 'box', size: new pc.Vec3(50, 0.2, 50) });
  var mat = new pc.StandardMaterial();
  mat.diffuse = new pc.Color(0.52, 0.44, 0.32); // dusty earth
  mat.update();
  ground.render.meshInstances[0].material = mat;
  ground.setPosition(0, -0.1, 0);
  this.root.addChild(ground);
};

// ---- Street surface (slightly different color) ----
MapBuilder.prototype._createStreet = function () {
  var street = new pc.Entity('street');
  street.addComponent('render', { type: 'box', size: new pc.Vec3(10, 0.05, 50) });
  var mat = new pc.StandardMaterial();
  mat.diffuse = new pc.Color(0.35, 0.33, 0.30); // dark asphalt
  mat.update();
  street.render.meshInstances[0].material = mat;
  street.setPosition(0, 0.01, 0);
  this.root.addChild(street);
};

// ---- Buildings ----
MapBuilder.prototype._createBuildings = function () {
  var buildingData = [
    // Left side (Police side) - warm cream/terracotta
    { x: -14, z: -20, w: 7, h: 10, d: 6, color: [0.85, 0.78, 0.62] },
    { x: -14, z: -10, w: 7, h: 12, d: 6, color: [0.82, 0.55, 0.38] },
    { x: -14, z:   0, w: 7, h:  9, d: 6, color: [0.90, 0.82, 0.65] },
    { x: -14, z:  10, w: 7, h: 11, d: 6, color: [0.78, 0.52, 0.35] },
    { x: -14, z:  20, w: 7, h: 10, d: 6, color: [0.88, 0.75, 0.58] },
    { x: -14, z: -15, w: 6, h:  8, d: 5, color: [0.80, 0.68, 0.50] },
    { x: -14, z:   5, w: 6, h:  8, d: 5, color: [0.76, 0.50, 0.33] },

    // Right side (Thief side)
    { x:  14, z: -20, w: 7, h: 11, d: 6, color: [0.80, 0.72, 0.55] },
    { x:  14, z: -10, w: 7, h:  9, d: 6, color: [0.85, 0.58, 0.40] },
    { x:  14, z:   0, w: 7, h: 12, d: 6, color: [0.88, 0.80, 0.60] },
    { x:  14, z:  10, w: 7, h: 10, d: 6, color: [0.82, 0.55, 0.36] },
    { x:  14, z:  20, w: 7, h:  9, d: 6, color: [0.78, 0.70, 0.52] },
    { x:  14, z: -15, w: 6, h:  8, d: 5, color: [0.74, 0.48, 0.32] },
    { x:  14, z:   5, w: 6, h:  8, d: 5, color: [0.83, 0.73, 0.56] },

    // Far end buildings (back wall)
    { x:  -5, z: -24, w: 6, h: 10, d: 4, color: [0.85, 0.75, 0.58] },
    { x:   5, z: -24, w: 6, h: 10, d: 4, color: [0.80, 0.65, 0.48] },
    { x:  -5, z:  24, w: 6, h: 10, d: 4, color: [0.78, 0.60, 0.42] },
    { x:   5, z:  24, w: 6, h: 10, d: 4, color: [0.82, 0.72, 0.55] },
  ];

  for (var i = 0; i < buildingData.length; i++) {
    this._createBuilding(buildingData[i]);
  }
};

MapBuilder.prototype._createBuilding = function (cfg) {
  var entity = new pc.Entity('building');
  entity.addComponent('render', { type: 'box', size: new pc.Vec3(cfg.w, cfg.h, cfg.d) });
  var mat = new pc.StandardMaterial();
  mat.diffuse = new pc.Color(cfg.color[0], cfg.color[1], cfg.color[2]);
  mat.update();
  entity.render.meshInstances[0].material = mat;
  // Position so bottom sits on ground (y=0)
  entity.setPosition(cfg.x, cfg.h / 2, cfg.z);
  this.root.addChild(entity);

  // Window rows
  var rows = Math.floor(cfg.h / 3);
  var cols = Math.floor(cfg.w / 2.2);
  var winMat = new pc.StandardMaterial();
  winMat.diffuse = new pc.Color(0.12, 0.12, 0.18);
  winMat.update();

  for (var r = 0; r < rows; r++) {
    for (var c = 0; c < cols; c++) {
      var win = new pc.Entity('win');
      win.addComponent('render', { type: 'box', size: new pc.Vec3(0.7, 1.0, 0.08) });
      win.render.meshInstances[0].material = winMat;
      var wx = (c - (cols - 1) / 2) * 2.0;
      var wy = -cfg.h / 2 + 2.0 + r * 3.0;
      win.setLocalPosition(wx, wy, cfg.d / 2 + 0.04);
      entity.addChild(win);
    }
  }

  // Roof ledge
  var ledge = new pc.Entity('ledge');
  ledge.addComponent('render', { type: 'box', size: new pc.Vec3(cfg.w + 0.4, 0.25, cfg.d + 0.4) });
  var ledgeMat = new pc.StandardMaterial();
  ledgeMat.diffuse = new pc.Color(cfg.color[0] * 0.7, cfg.color[1] * 0.7, cfg.color[2] * 0.7);
  ledgeMat.update();
  ledge.render.meshInstances[0].material = ledgeMat;
  ledge.setLocalPosition(0, cfg.h / 2 + 0.12, 0);
  entity.addChild(ledge);
};

// ---- Market Stalls ----
MapBuilder.prototype._createMarketStalls = function () {
  var stallData = [
    { x: -9, z: -12, color: [0.75, 0.25, 0.15] },
    { x: -9, z:  -3, color: [0.20, 0.55, 0.20] },
    { x: -9, z:   6, color: [0.80, 0.50, 0.10] },
    { x: -9, z:  15, color: [0.60, 0.20, 0.50] },
    { x:  9, z: -12, color: [0.15, 0.45, 0.65] },
    { x:  9, z:  -3, color: [0.70, 0.40, 0.10] },
    { x:  9, z:   6, color: [0.55, 0.15, 0.15] },
    { x:  9, z:  15, color: [0.30, 0.50, 0.30] },
  ];

  for (var i = 0; i < stallData.length; i++) {
    this._createStall(stallData[i]);
  }
};

MapBuilder.prototype._createStall = function (cfg) {
  var group = new pc.Entity('stall');

  // Counter
  var counter = new pc.Entity('counter');
  counter.addComponent('render', { type: 'box', size: new pc.Vec3(3.5, 1.0, 1.8) });
  var cMat = new pc.StandardMaterial();
  cMat.diffuse = new pc.Color(0.55, 0.42, 0.28);
  cMat.update();
  counter.render.meshInstances[0].material = cMat;
  counter.setLocalPosition(0, 0.5, 0);
  group.addChild(counter);

  // Poles
  var poleMat = new pc.StandardMaterial();
  poleMat.diffuse = new pc.Color(0.40, 0.30, 0.18);
  poleMat.update();
  var polePositions = [[-1.5, 0, -0.7], [1.5, 0, -0.7], [-1.5, 0, 0.7], [1.5, 0, 0.7]];
  for (var p = 0; p < polePositions.length; p++) {
    var pole = new pc.Entity('pole');
    pole.addComponent('render', { type: 'box', size: new pc.Vec3(0.12, 2.5, 0.12) });
    pole.render.meshInstances[0].material = poleMat;
    pole.setLocalPosition(polePositions[p][0], 1.25, polePositions[p][2]);
    group.addChild(pole);
  }

  // Roof (corrugated metal look)
  var roof = new pc.Entity('roof');
  roof.addComponent('render', { type: 'box', size: new pc.Vec3(4.0, 0.08, 2.4) });
  var rMat = new pc.StandardMaterial();
  rMat.diffuse = new pc.Color(cfg.color[0], cfg.color[1], cfg.color[2]);
  rMat.update();
  roof.render.meshInstances[0].material = rMat;
  roof.setLocalPosition(0, 2.55, 0);
  group.addChild(roof);

  // Goods on counter (small boxes)
  var goodsMat = new pc.StandardMaterial();
  goodsMat.diffuse = new pc.Color(0.9, 0.8, 0.3);
  goodsMat.update();
  for (var g = 0; g < 3; g++) {
    var goods = new pc.Entity('goods');
    goods.addComponent('render', { type: 'box', size: new pc.Vec3(0.5, 0.4, 0.4) });
    goods.render.meshInstances[0].material = goodsMat;
    goods.setLocalPosition(-1.0 + g * 1.0, 1.2, 0);
    group.addChild(goods);
  }

  group.setPosition(cfg.x, 0, cfg.z);
  this.root.addChild(group);
};

// ---- Crates ----
MapBuilder.prototype._createCrates = function () {
  var crateData = [
    { x: -4, z: -8 },
    { x:  4, z: -5 },
    { x: -3, z:  3 },
    { x:  5, z:  8 },
    { x: -6, z: 12 },
    { x:  3, z: -14 },
    { x: -2, z: 18 },
    { x:  6, z: -18 },
    // Stacked pair
    { x: -5, z: -2 },
    { x:  4, z: 14 },
  ];

  var crateMat = new pc.StandardMaterial();
  crateMat.diffuse = new pc.Color(0.50, 0.35, 0.18);
  crateMat.update();

  for (var i = 0; i < crateData.length; i++) {
    var crate = new pc.Entity('crate');
    crate.addComponent('render', { type: 'box', size: new pc.Vec3(0.9, 0.9, 0.9) });
    crate.render.meshInstances[0].material = crateMat;
    crate.setPosition(crateData[i].x, 0.45, crateData[i].z);
    this.root.addChild(crate);
  }

  // A couple of stacked crates
  var stackPositions = [{ x: -5, z: -2 }, { x: 4, z: 14 }];
  for (var s = 0; s < stackPositions.length; s++) {
    var crate2 = new pc.Entity('crate2');
    crate2.addComponent('render', { type: 'box', size: new pc.Vec3(0.9, 0.9, 0.9) });
    crate2.render.meshInstances[0].material = crateMat;
    crate2.setPosition(stackPositions[s].x, 1.35, stackPositions[s].z);
    this.root.addChild(crate2);
  }
};

// ---- Orange Car ----
MapBuilder.prototype._createCar = function () {
  var car = new pc.Entity('car');

  // Body
  var body = new pc.Entity('body');
  body.addComponent('render', { type: 'box', size: new pc.Vec3(2.0, 0.9, 4.2) });
  var bodyMat = new pc.StandardMaterial();
  bodyMat.diffuse = new pc.Color(0.95, 0.45, 0.08); // orange
  bodyMat.update();
  body.render.meshInstances[0].material = bodyMat;
  body.setLocalPosition(0, 0.55, 0);
  car.addChild(body);

  // Cabin
  var cabin = new pc.Entity('cabin');
  cabin.addComponent('render', { type: 'box', size: new pc.Vec3(1.7, 0.7, 2.0) });
  var cabMat = new pc.StandardMaterial();
  cabMat.diffuse = new pc.Color(0.70, 0.35, 0.05);
  cabMat.update();
  cabin.render.meshInstances[0].material = cabMat;
  cabin.setLocalPosition(0, 1.1, -0.2);
  car.addChild(cabin);

  // Windshield
  var wind = new pc.Entity('wind');
  wind.addComponent('render', { type: 'box', size: new pc.Vec3(1.5, 0.5, 0.05) });
  var windMat = new pc.StandardMaterial();
  windMat.diffuse = new pc.Color(0.3, 0.4, 0.5);
  windMat.update();
  wind.render.meshInstances[0].material = windMat;
  wind.setLocalPosition(0, 1.1, 0.81);
  car.addChild(wind);

  // Wheels
  var wheelMat = new pc.StandardMaterial();
  wheelMat.diffuse = new pc.Color(0.15, 0.15, 0.15);
  wheelMat.update();
  var wheelPositions = [[-0.9, 0.25, 1.3], [0.9, 0.25, 1.3], [-0.9, 0.25, -1.3], [0.9, 0.25, -1.3]];
  for (var w = 0; w < wheelPositions.length; w++) {
    var wheel = new pc.Entity('wheel');
    wheel.addComponent('render', { type: 'cylinder', radius: 0.30, height: 0.20 });
    wheel.render.meshInstances[0].material = wheelMat;
    wheel.setLocalPosition(wheelPositions[w][0], wheelPositions[w][1], wheelPositions[w][2]);
    wheel.setLocalEulerAngles(0, 0, 90);
    car.addChild(wheel);
  }

  car.setPosition(2.5, 0, 0);
  car.setEulerAngles(0, 15, 0);
  this.root.addChild(car);
};

// ---- Palm Trees ----
MapBuilder.prototype._createPalms = function () {
  var palmData = [
    { x: -11, z: -18 },
    { x: -11, z:   8 },
    { x:  11, z: -10 },
    { x:  11, z:  16 },
    { x:  -8, z: -22 },
    { x:   8, z:  22 },
  ];

  for (var i = 0; i < palmData.length; i++) {
    this._createPalm(palmData[i].x, palmData[i].z);
  }
};

MapBuilder.prototype._createPalm = function (x, z) {
  var palm = new pc.Entity('palm');

  // Trunk
  var trunk = new pc.Entity('trunk');
  trunk.addComponent('render', { type: 'cylinder', radius: 0.15, height: 5.0 });
  var trunkMat = new pc.StandardMaterial();
  trunkMat.diffuse = new pc.Color(0.45, 0.32, 0.18);
  trunkMat.update();
  trunk.render.meshInstances[0].material = trunkMat;
  trunk.setLocalPosition(0, 2.5, 0);
  palm.addChild(trunk);

  // Fronds (flat boxes radiating out)
  var frondMat = new pc.StandardMaterial();
  frondMat.diffuse = new pc.Color(0.18, 0.55, 0.15);
  frondMat.update();
  var frondCount = 6;
  for (var f = 0; f < frondCount; f++) {
    var frond = new pc.Entity('frond');
    frond.addComponent('render', { type: 'box', size: new pc.Vec3(0.15, 0.06, 2.2) });
    frond.render.meshInstances[0].material = frondMat;
    frond.setLocalPosition(0, 5.0, 0);
    frond.setLocalEulerAngles(-25, (360 / frondCount) * f, 0);
    palm.addChild(frond);
  }

  // Top cluster
  var top = new pc.Entity('top');
  top.addComponent('render', { type: 'sphere', radius: 0.35 });
  var topMat = new pc.StandardMaterial();
  topMat.diffuse = new pc.Color(0.15, 0.45, 0.12);
  topMat.update();
  top.render.meshInstances[0].material = topMat;
  top.setLocalPosition(0, 5.1, 0);
  palm.addChild(top);

  palm.setPosition(x, 0, z);
  this.root.addChild(palm);
};

// ---- Boundary Walls ----
MapBuilder.prototype._createBoundaryWalls = function () {
  var wallMat = new pc.StandardMaterial();
  wallMat.diffuse = new pc.Color(0.55, 0.50, 0.42);
  wallMat.update();

  var walls = [
    { pos: [0, 3, -25], size: [50, 6, 1] },
    { pos: [0, 3,  25], size: [50, 6, 1] },
    { pos: [-25, 3, 0], size: [1, 6, 50] },
    { pos: [ 25, 3, 0], size: [1, 6, 50] },
  ];

  for (var i = 0; i < walls.length; i++) {
    var w = walls[i];
    var entity = new pc.Entity('wall');
    entity.addComponent('render', { type: 'box', size: new pc.Vec3(w.size[0], w.size[1], w.size[2]) });
    entity.render.meshInstances[0].material = wallMat;
    entity.setPosition(w.pos[0], w.pos[1], w.pos[2]);
    this.root.addChild(entity);
  }
};

// ---- Lighting ----
MapBuilder.prototype._createLighting = function () {
  var sun = new pc.Entity('sun');
  sun.addComponent('light', {
    type: 'directional',
    color: new pc.Color(1, 0.92, 0.78),
    intensity: 1.3,
    castShadows: false
  });
  sun.setEulerAngles(50, 30, 0);
  this.root.addChild(sun);

  var ambient = new pc.Entity('ambient');
  ambient.addComponent('light', {
    type: 'ambient',
    color: new pc.Color(0.55, 0.50, 0.45),
    intensity: 0.7
  });
  this.root.addChild(ambient);
};

// ---- Spawn Markers ----
MapBuilder.prototype._createSpawnMarkers = function () {
  var pMat = new pc.StandardMaterial();
  pMat.diffuse = new pc.Color(0.2, 0.4, 0.9);
  pMat.emissive = new pc.Color(0.08, 0.15, 0.35);
  pMat.opacity = 0.35;
  pMat.blendType = pc.BLEND_NORMAL;
  pMat.update();

  var policeMarker = new pc.Entity('police_spawn');
  policeMarker.addComponent('render', { type: 'box', size: new pc.Vec3(6, 0.04, 5) });
  policeMarker.render.meshInstances[0].material = pMat;
  policeMarker.setPosition(-5, 0.02, -20);
  this.root.addChild(policeMarker);

  var tMat = new pc.StandardMaterial();
  tMat.diffuse = new pc.Color(0.9, 0.2, 0.2);
  tMat.emissive = new pc.Color(0.35, 0.06, 0.06);
  tMat.opacity = 0.35;
  tMat.blendType = pc.BLEND_NORMAL;
  tMat.update();

  var thiefMarker = new pc.Entity('thief_spawn');
  thiefMarker.addComponent('render', { type: 'box', size: new pc.Vec3(6, 0.04, 5) });
  thiefMarker.render.meshInstances[0].material = tMat;
  thiefMarker.setPosition(5, 0.02, 20);
  this.root.addChild(thiefMarker);
};
