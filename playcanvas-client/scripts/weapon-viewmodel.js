/**
 * Weapon Viewmodel - First-person gun rendered on camera
 * Low-poly assault rifle matching the reference image style.
 */
var WeaponViewmodel = function (app, camera) {
  this.app = app;
  this.camera = camera;
  this.root = new pc.Entity('weapon_root');
  this.recoilOffset = 0;
  this.bobTime = 0;
  this._build();
  camera.addChild(this.root);
};

WeaponViewmodel.prototype._build = function () {
  var root = this.root;
  var darkGray = [0.18, 0.18, 0.20];
  var medGray = [0.28, 0.28, 0.30];
  var lightGray = [0.38, 0.38, 0.40];
  var wood = [0.45, 0.32, 0.18];
  var black = [0.08, 0.08, 0.10];

  // Main receiver body
  var receiver = this._part([0.06, 0.10, 0.55], darkGray, 0.02, -0.08, -0.35);
  root.addChild(receiver);

  // Top rail
  var rail = this._part([0.04, 0.025, 0.45], medGray, 0.02, -0.025, -0.32);
  root.addChild(rail);

  // Rail notches
  for (var n = 0; n < 8; n++) {
    var notch = this._part([0.045, 0.012, 0.015], black, 0.02, -0.012, -0.15 - n * 0.05);
    root.addChild(notch);
  }

  // Barrel
  var barrel = this._part([0.03, 0.03, 0.35], medGray, 0.02, -0.07, -0.72);
  root.addChild(barrel);

  // Barrel shroud
  var shroud = this._part([0.045, 0.045, 0.20], darkGray, 0.02, -0.07, -0.55);
  root.addChild(shroud);

  // Muzzle brake
  var muzzle = this._part([0.035, 0.035, 0.06], black, 0.02, -0.07, -0.92);
  root.addChild(muzzle);

  // Front sight
  var fSight = this._part([0.015, 0.04, 0.015], black, 0.02, 0.00, -0.80);
  root.addChild(fSight);

  // Rear sight
  var rSight = this._part([0.035, 0.035, 0.015], black, 0.02, 0.00, -0.12);
  root.addChild(rSight);

  // Magazine
  var mag = this._part([0.04, 0.14, 0.07], darkGray, 0.02, -0.20, -0.30);
  root.addChild(mag);

  // Magazine well
  var magWell = this._part([0.05, 0.04, 0.08], medGray, 0.02, -0.14, -0.30);
  root.addChild(magWell);

  // Trigger guard
  var tGuard = this._part([0.035, 0.05, 0.06], darkGray, 0.02, -0.16, -0.22);
  root.addChild(tGuard);

  // Grip (wood-textured)
  var grip = this._part([0.035, 0.10, 0.04], wood, 0.02, -0.19, -0.12);
  grip.setLocalEulerAngles(12, 0, 0);
  root.addChild(grip);

  // Stock
  var stock = this._part([0.04, 0.06, 0.18], wood, 0.02, -0.07, 0.12);
  root.addChild(stock);

  // Stock end plate
  var endPlate = this._part([0.045, 0.08, 0.02], darkGray, 0.02, -0.07, 0.22);
  root.addChild(endPlate);

  // Handguard (lower)
  var handguard = this._part([0.05, 0.055, 0.22], darkGray, 0.02, -0.09, -0.48);
  root.addChild(handguard);

  // Position the whole weapon relative to camera
  root.setLocalPosition(0.20, -0.18, -0.40);
  root.setLocalEulerAngles(-1, 0, 0);
};

WeaponViewmodel.prototype._part = function (size, color, x, y, z) {
  var e = new pc.Entity('wpn');
  e.addComponent('render', { type: 'box', size: new pc.Vec3(size[0], size[1], size[2]) });
  var m = new pc.StandardMaterial();
  m.diffuse = new pc.Color(color[0], color[1], color[2]);
  m.update();
  e.render.meshInstances[0].material = m;
  e.setLocalPosition(x, y, z);
  return e;
};

WeaponViewmodel.prototype.setRecoil = function (amount) {
  this.recoilOffset = amount;
};

WeaponViewmodel.prototype.update = function (dt, isMoving) {
  // Bob when moving
  if (isMoving) {
    this.bobTime += dt * 8;
  } else {
    this.bobTime += dt * 2;
  }
  var bobX = Math.sin(this.bobTime) * (isMoving ? 0.003 : 0.001);
  var bobY = Math.abs(Math.sin(this.bobTime * 2)) * (isMoving ? 0.005 : 0.001);

  // Recoil recovery
  this.recoilOffset *= 0.85;

  this.root.setLocalPosition(
    0.20 + bobX,
    -0.18 + bobY + this.recoilOffset * 0.02,
    -0.40 + this.recoilOffset * 0.04
  );

  // Recoil rotation
  this.root.setLocalEulerAngles(
    -1 - this.recoilOffset * 2,
    0,
    0
  );
};
