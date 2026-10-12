/**
 * Phase 8: Menu Manager
 * Handles the main menu, join flow, and transitions to gameplay.
 */
var MenuManager = function () {
  this._menu = document.getElementById('main-menu');
  this._nameInput = document.getElementById('player-name');
  this._joinBtn = document.getElementById('btn-join');
  this._status = document.getElementById('connection-status');
  this._onJoin = null;
};

MenuManager.prototype.show = function () {
  this._menu.classList.remove('hidden');
};

MenuManager.prototype.hide = function () {
  this._menu.classList.add('hidden');
};

MenuManager.prototype.onJoin = function (callback) {
  this._onJoin = callback;
  var self = this;

  this._joinBtn.addEventListener('click', function () {
    var name = self._nameInput.value.trim() || 'Player';
    self._status.textContent = 'Connecting...';
    self._joinBtn.disabled = true;
    if (self._onJoin) self._onJoin(name);
  });

  // Allow Enter key to submit
  this._nameInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') self._joinBtn.click();
  });
};

MenuManager.prototype.setStatus = function (text) {
  this._status.textContent = text;
};

MenuManager.prototype.enableJoin = function () {
  this._joinBtn.disabled = false;
};

MenuManager.prototype.getPlayerName = function () {
  return this._nameInput.value.trim() || 'Player';
};
