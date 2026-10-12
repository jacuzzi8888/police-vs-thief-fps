/**
 * Phase 1: First-Person Controller
 * Handles WASD movement, mouse look, pointer lock, and jumping.
 * Also reads input state from mobile controls when available.
 */
var FpsController = function (app, camera, ground) {
  this.app = app;
  this.camera = camera;
  this.ground = ground;

  // Movement state
  this.speed = 8;
  this.jumpForce = 8;
  this.gravity = -20;
  this.velocity = new pc.Vec3(0, 0, 0);
  this.position = new pc.Vec3(0, 1.6, 0);
  this.yaw = 0;
  this.pitch = 0;
  this.isGrounded = true;

  // Input state
  this.keys = { w: false, a: false, s: false, d: false, space: false };
  this.mouseDx = 0;
  this.mouseDy = 0;
  this.lookSensitivity = 0.002;

  // Mobile input (set by mobile-controls.js)
  this.mobileMove = { x: 0, y: 0 };
  this.mobileLook = { dx: 0, dy: 0 };
  this.mobileJump = false;
  this.mobileFire = false;

  // State
  this.isActive = false;
  this.isMobile = this._detectMobile();

  this._bindEvents();
};

FpsController.prototype._detectMobile = function () {
  return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
};

FpsController.prototype._bindEvents = function () {
  var self = this;
  var canvas = this.app.graphicsDevice.canvas;

  // Keyboard
  window.addEventListener('keydown', function (e) {
    if (!self.isActive) return;
    switch (e.code) {
      case 'KeyW': self.keys.w = true; break;
      case 'KeyA': self.keys.a = true; break;
      case 'KeyS': self.keys.s = true; break;
      case 'KeyD': self.keys.d = true; break;
      case 'Space': self.keys.space = true; break;
    }
  });

  window.addEventListener('keyup', function (e) {
    switch (e.code) {
      case 'KeyW': self.keys.w = false; break;
      case 'KeyA': self.keys.a = false; break;
      case 'KeyS': self.keys.s = false; break;
      case 'KeyD': self.keys.d = false; break;
      case 'Space': self.keys.space = false; break;
    }
  });

  // Mouse look (only on desktop)
  if (!this.isMobile) {
    canvas.addEventListener('click', function () {
      if (self.isActive) canvas.requestPointerLock();
    });

    document.addEventListener('pointerlockchange', function () {
      // Pointer lock changed
    });

    document.addEventListener('mousemove', function (e) {
      if (document.pointerLockElement === canvas) {
        self.mouseDx += e.movementX;
        self.mouseDy += e.movementY;
      }
    });
  }
};

FpsController.prototype.activate = function () {
  this.isActive = true;
};

FpsController.prototype.deactivate = function () {
  this.isActive = false;
  this.keys = { w: false, a: false, s: false, d: false, space: false };
};

FpsController.prototype.setPosition = function (x, y, z) {
  this.position.set(x, y, z);
  this.camera.setPosition(this.position);
};

FpsController.prototype.update = function (dt) {
  if (!this.isActive) return;

  // Apply mouse look
  this.yaw -= this.mouseDx * this.lookSensitivity;
  this.pitch -= this.mouseDy * this.lookSensitivity;
  this.pitch = pc.math.clamp(this.pitch, -Math.PI / 2.2, Math.PI / 2.2);
  this.mouseDx = 0;
  this.mouseDy = 0;

  // Mobile look input
  if (this.isMobile) {
    this.yaw -= this.mobileLook.dx * 0.005;
    this.pitch -= this.mobileLook.dy * 0.005;
    this.pitch = pc.math.clamp(this.pitch, -Math.PI / 2.2, Math.PI / 2.2);
    this.mobileLook.dx = 0;
    this.mobileLook.dy = 0;
  }

  // Apply rotation to camera
  this.camera.setEulerAngles(
    this.pitch * pc.math.RAD_TO_DEG,
    this.yaw * pc.math.RAD_TO_DEG,
    0
  );

  // Calculate movement direction from yaw
  var sinYaw = Math.sin(this.yaw);
  var cosYaw = Math.cos(this.yaw);
  var forward = new pc.Vec3(-sinYaw, 0, -cosYaw);
  var right = new pc.Vec3(cosYaw, 0, -sinYaw);
  forward.y = 0;
  forward.normalize();
  right.y = 0;
  right.normalize();

  // Input (combine keyboard + mobile)
  var moveX = 0, moveZ = 0;
  if (this.keys.w) moveZ -= 1;
  if (this.keys.s) moveZ += 1;
  if (this.keys.a) moveX -= 1;
  if (this.keys.d) moveX += 1;

  // Mobile joystick input
  moveX += this.mobileMove.x;
  moveZ += this.mobileMove.y;

  var moveDir = new pc.Vec3(0, 0, 0);
  moveDir.addScaled(forward, -moveZ);
  moveDir.addScaled(right, moveX);
  if (moveDir.length() > 0) moveDir.normalize();

  // Apply horizontal movement
  this.position.x += moveDir.x * this.speed * dt;
  this.position.z += moveDir.z * this.speed * dt;

  // Jump
  if ((this.keys.space || this.mobileJump) && this.isGrounded) {
    this.velocity.y = this.jumpForce;
    this.isGrounded = false;
    this.mobileJump = false;
  }

  // Gravity
  this.velocity.y += this.gravity * dt;
  this.position.y += this.velocity.y * dt;

  // Ground collision (eye level at 1.6)
  if (this.position.y <= 1.6) {
    this.position.y = 1.6;
    this.velocity.y = 0;
    this.isGrounded = true;
  }

  // Apply position
  this.camera.setPosition(this.position);

  return {
    x: this.position.x,
    y: this.position.y,
    z: this.position.z,
    rotY: this.yaw,
    moveX: moveX,
    moveZ: moveZ
  };
};
