'use strict';

module.exports = {

	countRadiantAfks: function (match) {
		var totalAfks = 0;
		for (var i=0; i<match.players.length; i++) {
			var player = match.players[i];

			if (this.isRadiant(player) && this.isAfk(player)) {
				totalAfks ++;
			}
		}
		return totalAfks;
	},

	countDireAfks: function (match) {
		var totalAfks = 0;
		for (var i=0; i<match.players.length; i++) {
			var player = match.players[i];

			if (this.isDire(player) && this.isAfk(player)) {
				totalAfks ++;
			}
		}
		return totalAfks;
	},

	isRadiant: function (player) {
		return player.player_slot < 100;
	},

	isDire: function (player) {
		return !this.isRadiant(player);
	},

	isAfk: function (player) {
		var leaverStatus = player.leaver_status != undefined ? parseInt(player.leaver_status, 10) : 99; //leaverStatus NULL = BOT
		return (leaverStatus > 1); //0 = connected, 1 = DC but reconnected. 2 = DC too long, 3 = Abandoned,  4 = AFK, 5 = Never connected
	},

	findPlayerWithId: function(playerId, match) {
		for (var i=0; i<match.players.length; i++) {
			var player = match.players[i];

			if (player.account_id == playerId) {
				return player;
			}
		}
	},

	playerWon: function(playerId, match) {
		var player = this.findPlayerWithId(playerId, match);
		return (this.isRadiant(player) && match.radiant_win) || (this.isDire(player) && !match.radiant_win);
	},

	alliesAfk: function(playerId, match) {
		var player = this.findPlayerWithId(playerId, match);
		if (this.isRadiant(player)) {
			return this.countRadiantAfks(match);
		} else {
			return this.countDireAfks(match);
		}
	},

	enemiesAfk: function(playerId, match) {
		var player = this.findPlayerWithId(playerId, match);
		if (this.isRadiant(player)) {
			return this.countDireAfks(match);
		} else {
			return this.countRadiantAfks(match);
		}
	}

};
