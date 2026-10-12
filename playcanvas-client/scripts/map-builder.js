/**
 * Phase 6: Map Builder
 * Procedurally builds a low-poly Lagos-inspired neighborhood map.
 * Includes streets, buildings with arched windows, cover objects, and team spawn areas.
 */
var MapBuilder = function (app, sceneRoot) {
  this.app = app;
  this.root = sceneRoot;
};

MapBuilder.prototype.build = function () {
  this._createGround();
  this._createBoundaryWalls();
  this._createBuildings();
  this._createCoverObjects();
  this._createLighting();
  this._createSpawnMarkers();
};

MapBuilder.prototype._createGround = function () {
  var ground = new pc.Entity('ground');
  ground.addComponent('render', {
    type: 'box',
    size: new pc.Vec3(80, 0.2, 80)
  });
  var mat = new pc.StandardMaterial();
  mat.diffuse = new pc.Color(0.45, 0.38, 0.28); // Sandy earth
  mat.update();
  ground.render.meshInstances[0].material = mat;
  ground.setPosition(0, -0.1, 0);
  this.root.addChild(ground);
};

MapBuilder.prototype._createBoundaryWalls = function () {
  var wallMat = new pc.StandardMaterial();
  wallMat.diffuse = new pc.Color(0.5, 0.45, 0.4);
  wallMat.update();

  var walls = [
    { pos: [0, 2, -40], size: [80, 4, 1] },
    { pos: [0, 2, 40], size: [80, 4, 1] },
    { pos: [-40, 2, 0], size: [1, 4, 80] },
    { pos: [40, 2, 0], size: [1, 4, 80] }
  ];

  walls.forEach(function (w, i) {
    var entity = new pc.Entity('wall_' + i);
    entity.addComponent('render', { type: 'box', size: new pc.Vec3(w.size[0], w.size[1], w.size[2]) });
    entity.render.meshInstances[0].material = wallMat;
    entity.setPosition(w.pos[0], w.pos[1], w.pos[2]);
    this.root.addChild(entity);
  }.bind(this));
};

MapBuilder.prototype._createBuildings = function () {
  // Lagos-inspired buildings with warm colors
  var buildingConfigs = [
    // Police side buildings (left)
    { pos: [-30, 3, -20], size: [10, 6, 8], color: [0.7, 0.65, 0.5] },
    { pos: [-25, 4, -10], size: [8, 8, 6], color: [0.8, 0.75, 0.6] },
    { pos: [-30, 2.5, 10], size: [10, 5, 8], color: [0.75, 0.6, 0.45] },
    { pos: [-20, 3, 20], size: [8, 6, 10], color: [0.65, 0.6, 0.55] },

    // Thief side buildings (right)
    { pos: [30, 3, 20], size: [10, 6, 8], color: [0.6, 0.55, 0.5] },
    { pos: [25, 4, 10], size: [8, 8, 6], color: [0.7, 0.6, 0.45] },
    { pos: [30, 2.5, -10], size: [10, 5, 8], color: [0.75, 0.7, 0.55] },
    { pos: [20, 3, -20], size: [8, 6, 10], color: [0.65, 0.55, 0.4] },

    // Center buildings
    { pos: [0, 5, -15], size: [6, 10, 6], color: [0.8, 0.75, 0.65] },
    { pos: [0, 5, 15], size: [6, 10, 6], color: [0.7, 0.65, 0.55] },
    { pos: [-10, 3, 0], size: [6, 6, 6], color: [0.75, 0.65, 0.5] },
    { pos: [10, 3, 0], size: [6, 6, 6], color: [0.7, 0.6, 0.45] }
  ];

  buildingConfigs.forEach(function (cfg, i) {
    this._createBuilding(cfg.pos, cfg.size, cfg.color, i);
  }.bind(this));
};

MapBuilder.prototype._createBuilding = function (pos, size, color, index) {
  var entity = new pc.Entity('building_' + index);
  entity.addComponent('render', {
    type: 'box',
    size: new pc.Vec3(size[0], size[1], size[2])
  });
  var mat = new pc.StandardMaterial();
  mat.diffuse = new pc.Color(color[0], color[1], color[2]);
  mat.update();
  entity.render.meshInstances[0].material = mat;
  entity.setPosition(pos[0], pos[1], pos[2]);
  this.root.addChild(entity);

  // Add arched window details (small boxes recessed into walls)
  this._addWindowDetails(entity, size);
};

MapBuilder.prototype._addWindowDetails = function (parent, size) {
  var windowMat = new pc.StandardMaterial();
  windowMat.diffuse = new pc.Color(0.15, 0.15, 0.2);
  windowMat.update();

  var windowCount = Math.floor(size[0] / 2.5);
  for (var i = 0; i < windowCount; i++) {
    var w = new pc.Entity('window_' + i);
    w.addComponent('render', { type: 'box', size: new pc.Vec3(0.8, 1.2, 0.1) });
    w.render.meshInstances[0].material = windowMat;
    var xOffset = (i - (windowCount - 1) / 2) * 2.5;
    w.setLocalPosition(xOffset, 0, size[2] / 2 + 0.05);
    parent.addChild(w);
  }
};

MapBuilder.prototype._createCoverObjects = function () {
  // Crates, cars, market stalls for cover
  var coverConfigs = [
    // Crates scattered around
    { type: 'crate', pos: [-5, 0.5, -5], size: [1, 1, 1] },
    { type: 'crate', pos: [5, 0.5, 5], size: [1, 1, 1] },
    { type: 'crate', pos: [-5, 0.5, 5], size: [1, 1, 1] },
    { type: 'crate', pos: [5, 0.5, -5], size: [1, 1, 1] },
    { type: 'crate', pos: [0, 0.5, -5], size: [1.5, 1, 1.5] },
    { type: 'crate', pos: [0, 0.5, 5], size: [1.5, 1, 1.5] },
    { type: 'crate', pos: [-8, 0.5, 0], size: [1, 1, 1] },
    { type: 'crate', pos: [8, 0.5, 0], size: [1, 1, 1] },

    // Cars (simple box + cabin)
    { type: 'car', pos: [-12, 0.7, -5], size: [4, 1.4, 2] },
    { type: 'car', pos: [12, 0.7, 5], size: [4, 1.4, 2] },
    { type: 'car', pos: [-3, 0.7, 12], size: [4, 1.4, 2] },
    { type: 'car', pos: [3, 0.7, -12], size: [4, 1.4, 2] },

    // Market stalls (wide, low)
    { type: 'stall', pos: [-15, 0.75, 0], size: [3, 1.5, 1.5] },
    { type: 'stall', pos: [15, 0.75, 0], size: [3, 1.5, 1.5] },
    { type: 'stall', pos: [0, 0.75, -25], size: [4, 1.5, 2] },
    { type: 'stall', pos: [0, 0.75, 25], size: [4, 1.5, 2] }
  ];

  coverConfigs.forEach(function (cfg, i) {
    this._createCoverObject(cfg, i);
  }.bind(this));
};

MapBuilder.prototype._createCoverObject = function (cfg, index) {
  var entity = new pc.Entity('cover_' + index);
  var color;

  if (cfg.type === 'crate') {
    color = new pc.Color(0.55, 0.4, 0.2);
  } else if (cfg.type === 'car') {
    color = new pc.Color(0.3, 0.3, 0.35);
  } else {
    color = new pc.Color(0.6, 0.5, 0.3);
  }

  entity.addComponent('render', {
    type: 'box',
    size: new pc.Vec3(cfg.size[0], cfg.size[1], cfg.size[2])
  });
  var mat = new pc.StandardMaterial();
  mat.diffuse = color;
  mat.update();
  entity.render.meshInstances[0].material = mat;
  entity.setPosition(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
  this.root.addChild(entity);

  // Car cabin detail
  if (cfg.type === 'car') {
    var cabin = new pc.Entity('cabin');
    cabin.addComponent('render', {
      type: 'box',
      size: new pc.Vec3(cfg.size[0] * 0.5, cfg.size[1] * 0.6, cfg.size[2] * 0.8)
    });
    var cabMat = new pc.StandardMaterial();
    cabMat.diffuse = new pc.Color(0.25, 0.25, 0.3);
    cabMat.update();
    cabin.render.meshInstances[0].material = cabMat;
    cabin.setLocalPosition(0, cfg.size[1] * 0.5, 0);
    entity.addChild(cabin);
  }

  // Stall roof
  if (cfg.type === 'stall') {
    var roof = new pc.Entity('roof');
    roof.addComponent('render', {
      type: 'box',
      size: new pc.Vec3(cfg.size[0] + 0.5, 0.1, cfg.size[2] + 0.5)
    });
    var roofMat = new pc.StandardMaterial();
    roofMat.diffuse = new pc.Color(0.8, 0.3, 0.2);
    roofMat.update();
    roof.render.meshInstances[0].material = roofMat;
    roof.setLocalPosition(0, cfg.size[1] * 0.6, 0);
    entity.addChild(roof);
  }
};

MapBuilder.prototype._createLighting = function () {
  // Directional light (sun)
  var sun = new pc.Entity('sun');
  sun.addComponent('light', {
    type: 'directional',
    color: new pc.Color(1, 0.95, 0.85),
    intensity: 1.2,
    castShadows: false
  });
  sun.setEulerAngles(45, 30, 0);
  this.root.addChild(sun);

  // Ambient
  var ambient = new pc.Entity('ambient');
  ambient.addComponent('light', {
    type: 'ambient',
    color: new pc.Color(0.5, 0.55, 0.65),
    intensity: 0.6
  });
  this.root.addChild(ambient);
};

MapBuilder.prototype._createSpawnMarkers = function () {
  // Visual markers for spawn areas
  var policeMarker = new pc.Entity('police_spawn_marker');
  policeMarker.addComponent('render', {
    type: 'box',
    size: new pc.Vec3(12, 0.05, 8)
  });
  var pMat = new pc.StandardMaterial();
  pMat.diffuse = new pc.Color(0.2, 0.4, 0.9);
  pMat.emissive = new pc.Color(0.1, 0.2, 0.4);
  pMat.opacity = 0.4;
  pMat.blendType = pc.BLEND_NORMAL;
  pMat.update();
  policeMarker.render.meshInstances[0].material = pMat;
  policeMarker.setPosition(-15, 0.05, -28);
  this.root.addChild(policeMarker);

  var thiefMarker = new pc.Entity('thief_spawn_marker');
  thiefMarker.addComponent('render', {
    type: 'box',
    size: new pc.Vec3(12, 0.05, 8)
  });
  var tMat = new pc.StandardMaterial();
  tMat.diffuse = new pc.Color(0.9, 0.2, 0.2);
  tMat.emissive = new pc.Color(0.4, 0.1, 0.1);
  tMat.opacity = 0.4;
  tMat.blendType = pc.BLEND_NORMAL;
  tMat.update();
  thiefMarker.render.meshInstances[0].material = tMat;
  thiefMarker.setPosition(15, 0.05, 28);
  this.root.addChild(thiefMarker);
};
