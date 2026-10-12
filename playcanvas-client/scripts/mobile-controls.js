/**
 * Phase 2: Mobile Touch Controls
 * Virtual joystick for movement, touch drag for looking,
 * on-screen buttons for fire, jump, reload.
 */
var MobileControls = function (fpsController) {
  this.fps = fpsController;
  this.isMobile = fpsController.isMobile;

  this.joystickActive = false;
  this.joystickCenter = { x: 0, y: 0 };
  this.joystickPos = { x: 0, y: 0 };
  this.joystickRadius = 50;

  this.lookTouchId = null;
  this.lookLastPos = { x: 0, y: 0 };

  this._container = document.getElementById('mobile-controls');
  this._stick = document.getElementById('joystick-stick');
  this._base = document.getElementById('joystick-base');
  this._lookZone = document.getElementById('look-zone');
  this._joystickZone = document.getElementById('joystick-zone');
  this._btnFire = document.getElementById('btn-fire');
  this._btnJump = document.getElementById('btn-jump');
  this._btnReload = document.getElementById('btn-reload');

  if (this.isMobile) {
    this._container.classList.remove('hidden');
    this._bindTouch();
    this._bindButtons();
  }
};

MobileControls.prototype.show = function () {
  if (this.isMobile) this._container.classList.remove('hidden');
};

MobileControls.prototype.hide = function () {
  this._container.classList.add('hidden');
};

MobileControls.prototype._bindTouch = function () {
  var self = this;

  // === Left Joystick ===
  this._joystickZone.addEventListener('touchstart', function (e) {
    e.preventDefault();
    var touch = e.changedTouches[0];
    var rect = self._base.getBoundingClientRect();
    self.joystickCenter.x = rect.left + rect.width / 2;
    self.joystickCenter.y = rect.top + rect.height / 2;
    self.joystickActive = true;
    self._updateJoystick(touch);
  }, { passive: false });

  this._joystickZone.addEventListener('touchmove', function (e) {
    e.preventDefault();
    if (!self.joystickActive) return;
    for (var i = 0; i < e.changedTouches.length; i++) {
      self._updateJoystick(e.changedTouches[i]);
    }
  }, { passive: false });

  this._joystickZone.addEventListener('touchend', function (e) {
    e.preventDefault();
    self.joystickActive = false;
    self.joystickPos = { x: 0, y: 0 };
    self.fps.mobileMove = { x: 0, y: 0 };
    self._stick.style.transform = 'translate(-50%, -50%)';
  }, { passive: false });

  // === Right Look Zone ===
  this._lookZone.addEventListener('touchstart', function (e) {
    e.preventDefault();
    var touch = e.changedTouches[0];
    self.lookTouchId = touch.identifier;
    self.lookLastPos = { x: touch.clientX, y: touch.clientY };
  }, { passive: false });

  this._lookZone.addEventListener('touchmove', function (e) {
    e.preventDefault();
    for (var i = 0; i < e.changedTouches.length; i++) {
      var touch = e.changedTouches[i];
      if (touch.identifier === self.lookTouchId) {
        var dx = touch.clientX - self.lookLastPos.x;
        var dy = touch.clientY - self.lookLastPos.y;
        self.fps.mobileLook.dx += dx;
        self.fps.mobileLook.dy += dy;
        self.lookLastPos = { x: touch.clientX, y: touch.clientY };
      }
    }
  }, { passive: false });

  this._lookZone.addEventListener('touchend', function (e) {
    for (var i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === self.lookTouchId) {
        self.lookTouchId = null;
      }
    }
  }, { passive: false });
};

MobileControls.prototype._updateJoystick = function (touch) {
  var dx = touch.clientX - this.joystickCenter.x;
  var dy = touch.clientY - this.joystickCenter.y;
  var dist = Math.sqrt(dx * dx + dy * dy);

  if (dist > this.joystickRadius) {
    dx = (dx / dist) * this.joystickRadius;
    dy = (dy / dist) * this.joystickRadius;
    dist = this.joystickRadius;
  }

  this.joystickPos = { x: dx, y: dy };
  this.fps.mobileMove = {
    x: dx / this.joystickRadius,
    y: dy / this.joystickRadius
  };

  // Visual feedback
  this._stick.style.transform = 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px))';
};

MobileControls.prototype._bindButtons = function () {
  var self = this;

  this._btnFire.addEventListener('touchstart', function (e) {
    e.preventDefault();
    self.fps.mobileFire = true;
    if (self.onFire) self.onFire();
  }, { passive: false });

  this._btnJump.addEventListener('touchstart', function (e) {
    e.preventDefault();
    self.fps.mobileJump = true;
  }, { passive: false });

  this._btnReload.addEventListener('touchstart', function (e) {
    e.preventDefault();
    if (self.onReload) self.onReload();
  }, { passive: false });
};
