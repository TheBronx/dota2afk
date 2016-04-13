'use strict';

var Sequelize = require('sequelize');
var MatchMapper = require('./MatchMapper.js');

module.exports = function(dbconfig) {

	var DROP_TABLES = false; // delete tables if exist

	var sequelize = new Sequelize(dbconfig.name, dbconfig.username, dbconfig.password, {
		host: dbconfig.host,
		dialect: dbconfig.dialect,

		pool: {
			max: 5,
			min: 0,
			idle: 10000
		}
	});

	this.init = function(callback) {
		Match.sync({force: DROP_TABLES}).then(function () {
			PlayerMatch.sync({force: DROP_TABLES}).then(function () {
				console.log('Tables created');
				callback();
			});
		});
	};

	this.saveMatch = function(match, callback) {
		console.log("[Persistence] save match " + match.match_id);

		Match.findOrCreate(
			{
				where: {id: match.match_id},
				defaults: MatchMapper.mapToDTO(match)
			}
		).spread(function(match, created) {
			if (callback) callback(null, match);
		}).catch(function(error) {
			if (callback) callback(error);
		});
	};

	this.savePlayerMatch = function(accountId, match, callback) {
		console.log("[Persistence] save player match " + match.match_id);

		PlayerMatch.findOrCreate(
			{
				where: {player_id: accountId, match_id: match.match_id},
				defaults: MatchMapper.mapToPlayerMatchDTO(accountId, match)
			}
		).spread(function(playerMatch, created) {
			if (callback) callback(null, playerMatch);
		}).catch(function(error) {
			if (callback) callback(error);
		});
	};

	this.countPlayerMatches = function(accountId, callback) {
		PlayerMatch.count({where: {player_id: accountId}}).then(function(count) {
			callback(null, count);
		});
	};

	this.countPlayerMatchesWithAfk = function(accountId, callback) {
		PlayerMatch.count({where: {
			player_id: accountId,
			$or: [
				{
					allies_afk: {
						$gt: 0
					}
				},
				{
					enemies_afk: {
						$gt: 0
					}
				}
			]
		}}).then(function(count) {
			callback(null, count);
		});
	};

	this.countPlayerMatchesWithAlliesAfk = function(accountId, callback) {
		PlayerMatch.count({where: {
			player_id: accountId,
			allies_afk: {$gt: 0},
			enemies_afk: 0
		}}).then(function(count) {
			callback(null, count);
		});
	};

	this.countWonPlayerMatchesWithAlliesAfk = function(accountId, callback) {
		PlayerMatch.count({where: {
			player_id: accountId,
			allies_afk: {$gt: 0},
			enemies_afk: 0,
			win: true
		}}).then(function(count) {
			callback(null, count);
		});
	};

	this.countPlayerMatchesWithEnemiesAfk = function(accountId, callback) {
		PlayerMatch.count({where: {
			player_id: accountId,
			enemies_afk: {$gt: 0},
			allies_afk: 0
		}}).then(function(count) {
			callback(null, count);
		});
	};

	this.countWonPlayerMatchesWithEnemiesAfk = function(accountId, callback) {
		PlayerMatch.count({where: {
			player_id: accountId,
			enemies_afk: {$gt: 0},
			allies_afk: 0,
			win: true
		}}).then(function(count) {
			callback(null, count);
		});
	};




	var Match = sequelize.define('match', {
		id: {
			type: Sequelize.BIGINT,
			primaryKey: true
		},
		radiant_afks: {
			type: Sequelize.INTEGER
		},
		dire_afks: {
			type: Sequelize.INTEGER
		},
		radiant_win: {
			type: Sequelize.BOOLEAN
		},
		game_mode: {
			type: Sequelize.INTEGER
		},
		start_time: {
			type: Sequelize.INTEGER
		},
		duration: {
			type: Sequelize.INTEGER
		},
		human_players: {
			type: Sequelize.INTEGER
		},
		radiant_kills: {
			type: Sequelize.INTEGER
		},
		dire_kills: {
			type: Sequelize.INTEGER
		}
	}, {
		freezeTableName: true // Model tableName will be the same as the model name
	});

	var PlayerMatch = sequelize.define('player_match', {
		player_id: {
			type: Sequelize.BIGINT
		},
		match_id: {
			type: Sequelize.BIGINT,

			references: {
				model: Match,
				key: 'id',
				// This declares when to check the foreign key constraint. PostgreSQL only.
				deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
			}
		},
		win: {
			type: Sequelize.BOOLEAN
		},
		allies_afk: {
			type: Sequelize.INTEGER
		},
		enemies_afk: {
			type: Sequelize.INTEGER
		}
	}, {
		freezeTableName: true // Model tableName will be the same as the model name
	});
};
