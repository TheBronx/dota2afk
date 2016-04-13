'use strict';

var async = require('async');
var config = require('./config.json');
var Persistence = require('./Persistence');

if (process.argv.length < 3) return console.log('Missing parameter account_id');

var persistence = new Persistence(config['database']);

persistence.init(function() {

	var accountId = process.argv[2];

	showStats(accountId);

	function showStats(accountId) {
		async.series([
			persistence.countPlayerMatches.bind(null, accountId),
			persistence.countPlayerMatchesWithAfk.bind(null, accountId),
			persistence.countPlayerMatchesWithAlliesAfk.bind(null, accountId),
			persistence.countWonPlayerMatchesWithAlliesAfk.bind(null, accountId),
			persistence.countPlayerMatchesWithEnemiesAfk.bind(null, accountId),
			persistence.countWonPlayerMatchesWithEnemiesAfk.bind(null, accountId)
		], function(err, results) {
			if (err) return console.log(err);

			console.log('Account ID ' + accountId);
			console.log('Total matches analyzed: ' + results[0]);
			console.log('Total matches with at least one afk (in any of the teams or both): ' + results[1]);
			console.log('Matches with afks only in your team: ' + results[2]);
			console.log('\tYou won: ' + results[3] + ' of those games');
			console.log('Matches with afks only in the enemy team: ' + results[4]);
			console.log('\tYou won: ' + results[5] + ' of those games');
		});
	}

});
