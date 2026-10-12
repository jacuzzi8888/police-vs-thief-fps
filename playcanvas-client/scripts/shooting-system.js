/**
 * Phase 5: Shooting System
 * Handles fire input, muzzle flash, ammo management, and reload.
 * Server-authoritative for hit detection.
 */
var ShootingSystem = function (app, camera, networkManager, mobileControls, weaponViewmodel) {
  this.app = app;
  this.camera = camera;
  this.network = networkManager;
  this.mobile = mobileControls;
  this.weapon = weaponViewmodel;

  this.ammo = 30;
  this.maxAmmo = 30;
  this.isReloading = false;
  this.fireRate = 0.2;
  this.lastFireTime = 0;
  this.isMouseDown = false;
  this.isMobileFiring = false;

  this._bindInputs();

  var self = this;
  if (this.mobile) {
    this.mobile.onFire = function () { self.isMobileFiring = true; };
    this.mobile.onReload = function () { self.reload(); };
  }
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

  // Weapon recoil
  if (this.weapon) this.weapon.setRecoil(1.0);
};

ShootingSystem.prototype.setAmmo = function (ammo) {
  this.ammo = ammo;
};

ShootingSystem.prototype.update = function (isMoving) {
  // Auto-fire on hold
  if (this.isMouseDown) this.fire();
  if (this.isMobileFiring) {
    this.fire();
    this.isMobileFiring = false;
  }
  // Update weapon bob
  if (this.weapon) this.weapon.update(0.016, isMoving);
};
