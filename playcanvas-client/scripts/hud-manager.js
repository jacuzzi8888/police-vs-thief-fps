/**
 * Phase 7: HUD Manager
 * Updates health bar, ammo counter, team scores, and kill feed.
 */
var HudManager = function () {
  this._healthBar = document.getElementById('health-bar');
  this._ammoCurrent = document.getElementById('ammo-current');
  this._ammoMax = document.getElementById('ammo-max');
  this._policeScore = document.getElementById('police-score');
  this._thiefScore = document.getElementById('thief-score');
  this._killFeed = document.getElementById('kill-feed');
  this._hud = document.getElementById('hud');
  this._deathScreen = document.getElementById('death-screen');
  this._deathInfo = document.getElementById('death-info');
  this._respawnTimer = document.getElementById('respawn-timer');

  this.killFeedEntries = [];
  this.maxKillFeed = 5;
};

HudManager.prototype.show = function () {
  this._hud.classList.remove('hidden');
};

HudManager.prototype.hide = function () {
  this._hud.classList.add('hidden');
};

HudManager.prototype.updateHealth = function (health) {
  var pct = Math.max(0, Math.min(100, health));
  this._healthBar.style.width = pct + '%';
  if (pct > 60) {
    this._healthBar.style.background = '#33cc33';
  } else if (pct > 30) {
    this._healthBar.style.background = '#ddaa22';
  } else {
    this._healthBar.style.background = '#dd3333';
  }
};

HudManager.prototype.updateAmmo = function (current, max) {
  this._ammoCurrent.textContent = current;
  this._ammoMax.textContent = max || 30;
};

HudManager.prototype.updateScore = function (police, thief) {
  this._policeScore.textContent = police;
  this._thiefScore.textContent = thief;
};

HudManager.prototype.addKillMessage = function (message) {
  var entry = document.createElement('div');
  entry.className = 'kill-entry';
  entry.textContent = message;
  this._killFeed.appendChild(entry);
  this.killFeedEntries.push(entry);
  if (this.killFeedEntries.length > this.maxKillFeed) {
    var old = this.killFeedEntries.shift();
    if (old && old.parentNode) old.parentNode.removeChild(old);
  }
  setTimeout(function () {
    if (entry.parentNode) entry.parentNode.removeChild(entry);
    var idx = this.killFeedEntries.indexOf(entry);
    if (idx !== -1) this.killFeedEntries.splice(idx, 1);
  }.bind(this), 5000);
};

HudManager.prototype.showDeathScreen = function (killerMessage) {
  this._deathScreen.classList.remove('hidden');
  this._deathInfo.textContent = killerMessage || 'You were eliminated!';
  var timer = 3;
  this._respawnTimer.textContent = timer;
  var self = this;
  var interval = setInterval(function () {
    timer--;
    self._respawnTimer.textContent = timer;
    if (timer <= 0) clearInterval(interval);
  }, 1000);
};

HudManager.prototype.hideDeathScreen = function () {
  this._deathScreen.classList.add('hidden');
};
