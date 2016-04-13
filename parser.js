'use strict';

var config = require('./config.json');
var Dota2Api = require('./Dota2Api');
var Persistence = require('./Persistence');

if (process.argv.length < 3) return console.log('Missing parameter account_id');

var api = new Dota2Api(config['dota.apikey']);
var persistence = new Persistence(config['database']);

persistence.init(function() {
	var accountId = process.argv[2];

	api.getMatchIdsForAccount(accountId, function(err, matches) {
		if (err) {
			console.err(err);
			return;
		}

		for (var i=0; i<matches.length; i++) {
			api.getMatchDetail(matches[i], function(err, match) {
				if (err) {
					console.log(err);
				} else {
					persistence.saveMatch(match, function(err, result) {
						if (err) {
							console.log("Error saving match with id " + match.match_id);
						} else {
							persistence.savePlayerMatch(accountId, match, function(err, result) {
								if (err) {
									console.log("Error saving player match with id " + match.match_id);
								}
							});
						}
					});
				}
			});
		}
	});

});
