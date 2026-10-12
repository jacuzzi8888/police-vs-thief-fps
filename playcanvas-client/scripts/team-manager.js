/**
 * Phase 4: Team Manager
 * Handles team assignment visuals and spawn logic.
 * Team 0 = Police (blue), Team 1 = Thief (red)
 */
var TeamManager = function () {
  this.myTeam = -1;
  this.POLICE = 0;
  this.THIEF = 1;

  this.teamColors = {
    police: new pc.Color(0.2, 0.4, 0.9),
    thief: new pc.Color(0.9, 0.2, 0.2)
  };
};

TeamManager.prototype.setTeam = function (team) {
  this.myTeam = team;
  var label = document.getElementById('team-label');
  if (team === this.POLICE) {
    label.textContent = 'POLICE';
    label.className = 'police';
  } else {
    label.textContent = 'THIEF';
    label.className = 'thief';
  }
};

TeamManager.prototype.getTeamName = function (team) {
  return team === this.POLICE ? 'Police' : 'Thief';
};

TeamManager.prototype.getTeamColor = function (team) {
  return team === this.POLICE ? this.teamColors.police : this.teamColors.thief;
};
