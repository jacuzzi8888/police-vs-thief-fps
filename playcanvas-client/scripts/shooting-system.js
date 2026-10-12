/**
 * Phase 5: Shooting System
 * Handles fire input, muzzle flash, ammo management, and reload.
 * Server-authoritative for hit detection.
 */
var ShootingSystem = function (app, camera, networkManager, mobileControls) {
  this.app = app;
  this.camera = camera;
  this.network = networkManager;
  this.mobile = mobileControls;

  this.ammo = 30;
  this.maxAmmo = 30;
  this.isReloading = false;
  this.fireRate = 0.2;
  this.lastFireTime = 0;
  this.isMouseDown = false;
  this.isMobileFiring = false;

  // Muzzle flash entity
  this.muzzleFlash = null;
  this._createMuzzleFlash();
  this._bindInputs();

  // Wire mobile controls
  var self = this;
  if (this.mobile) {
    this.mobile.onFire = function () { self.isMobileFiring = true; };
    this.mobile.onReload = function () { self.reload(); };
  }
};

ShootingSystem.prototype._createMuzzleFlash = function () {
  this.muzzleFlash = new pc.Entity('muzzle-flash');
  this.muzzleFlash.addComponent('render', {
    type: 'sphere',
    radius: 0.05
  });
  var mat = new pc.StandardMaterial();
  mat.diffuse = new pc.Color(1, 0.8, 0);
  mat.emissive = new pc.Color(1, 0.8, 0);
  mat.update();
  this.muzzleFlash.render.meshInstances[0].material = mat;
  this.muzzleFlash.enabled = false;

  // Attach to camera
  this.camera.addChild(this.muzzleFlash);
  this.muzzleFlash.setLocalPosition(0.2, -0.15, -0.5);
};

ShootingSystem.prototype._bindInputs = function () {
  var self = this;
  var canvas = this.app.graphicsDevice.canvas;

  canvas.addEventListener('mousedown', function (e) {
    if (e.button === 0) self.isMouseDown = true;
  });

  canvas.addEventListener('mouseup', function (e) {
    if (e.button === 0) self.isMouseDown = false;
  });

  window.addEventListener('keydown', function (e) {
    if (e.code === 'KeyR') self.reload();
  });
};

ShootingSystem.prototype.reload = function () {
  if (this.isReloading || this.ammo >= this.maxAmmo) return;
  this.isReloading = true;
  document.getElementById('reload-indicator').classList.remove('hidden');

  this.network.sendReload();

  var self = this;
  setTimeout(function () {
    self.isReloading = false;
    document.getElementById('reload-indicator').classList.add('hidden');
  }, 2000);
};

ShootingSystem.prototype.fire = function () {
  if (this.isReloading) return;
  if (this.ammo <= 0) {
    this.reload();
    return;
  }

  var now = Date.now();
  if (now - this.lastFireTime < this.fireRate * 1000) return;
  this.lastFireTime = now;
  this.ammo--;

  // Send to server
  this.network.sendShoot();

  // Muzzle flash
  this._showMuzzleFlash();

  // Camera recoil
  this._applyRecoil();
};

ShootingSystem.prototype._showMuzzleFlash = function () {
  if (!this.muzzleFlash) return;
  this.muzzleFlash.enabled = true;
  var self = this;
  setTimeout(function () {
    if (self.muzzleFlash) self.muzzleFlash.enabled = false;
  }, 50);
};

ShootingSystem.prototype._applyRecoil = function () {
  // Small upward kick
  var pitch = this.camera.getEulerAngles().x;
  this.camera.setEulerAngles(pitch + 0.5, this.camera.getEulerAngles().y, 0);
};

ShootingSystem.prototype.setAmmo = function (ammo) {
  this.ammo = ammo;
};

ShootingSystem.prototype.update = function () {
  // Auto-fire on hold
  if (this.isMouseDown) this.fire();
  if (this.isMobileFiring) {
    this.fire();
    this.isMobileFiring = false;
  }
};
