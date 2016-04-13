'use strict';

var MatchUtils = require('./MatchUtils.js');

module.exports = {

	mapToDTO: function(match) {
		return {
			id: match.match_id,
			radiant_afks: MatchUtils.countRadiantAfks(match),
			dire_afks: MatchUtils.countDireAfks(match),
			radiant_win: match.radiant_win == true,
			game_mode: match.game_mode,
			start_time: match.start_time,
			duration: match.duration,
			human_players: match.human_players,
			radiant_kills: match.radiant_score,
			dire_kills: match.dire_score
		};
	},

	mapToPlayerMatchDTO: function(accountId, match) {
		return {
			player_id: accountId,
			match_id: match.match_id,
			win: MatchUtils.playerWon(accountId, match),
			allies_afk: MatchUtils.alliesAfk(accountId, match),
			enemies_afk: MatchUtils.enemiesAfk(accountId, match)
		};
	}

};
