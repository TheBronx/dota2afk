'use strict';

var request = require('request');

/**
 * API documentation
 * http://dev.dota2.com/showthread.php?t=58317
 */
module.exports = function(apikey) {
	var _this = this;
	this.api = new Api(apikey);

	this.getMatchIdsForAccount = function (accountId, callback) {
		var userMatches = new UserMatchesPaginator(accountId, _this.api);
		userMatches.getAllMatches(function(err, ids) {
			if (err) {
				callback(err);
			} else {
				callback(null, ids);
			}
		});
	};

	this.getMatchDetail = function(matchId, callback) {
		var url = 'https://api.steampowered.com/IDOTA2Match_570/GetMatchDetails/V001/' +
			'?match_id=' + matchId;

		_this.api.call(url, function (err, json) {
			if (err) {
				callback(err);
			} else {
				callback(null, json.result);
			}
		});
	};
};

var Api = function(apikey) {
	var _this = this;
	var rateLimit = 1000 + 100; //Dota Api rate limit: 1 request per second
	var lastApiCallTimestamp = 0;

	this.call = function(url, callback) {
		url = addApikey(url);

		var timestamp = new Date().getTime();
		var delayMs = timestamp - lastApiCallTimestamp;
		if (delayMs < rateLimit) {
			var wait = rateLimit - delayMs;

			setTimeout(function() {
				_this.call(url, callback);
			}, wait);

			return;
		}

		console.log("[API] Calling " + url);
		lastApiCallTimestamp = new Date().getTime();
		request({'url':url, 'gzip':true}, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				var json = JSON.parse(body);
				if (!json || !json.result) {
					error = "Empty response";
				}
				callback(error, json);
			} else {
				if (!response) {
					response = {
						'statusCode': 'WTF'
					}
				}
				if (!response.statusCode) response.statusCode = 'unknown';
				console.log('[API] error: ' + error + '. status: ' + response.statusCode + '. On call: ' + url);
				if (!error) { //empty error but status != 200
					error = 'error, http status: ' + response.statusCode;
				}
				//retry in 5 seconds
				setTimeout(function() {
					_this.call(url, callback);
				}, 5000);
			}
		})
	};

	function addApikey(url) {
		if (url.includes('key=')) return url;

		return url + '&key=' + apikey;
	}
};

var UserMatchesPaginator = function(accountId, api) {
	var _this = this;
	var matches = [];

	this.getAllMatches = function(callback) {
		var url = 'https://api.steampowered.com/IDOTA2Match_570/GetMatchHistory/V001/?account_id=' + accountId;
		api.call(url, function(err, json) {
			var ids = getIds(json.result.matches);
			matches = matches.concat(ids);

			if (json.result.results_remaining > 0) {
				var startAtMatchId = ids[ids.length - 1];
				_this.getMatchesStartingAt(startAtMatchId - 1, callback);
			} else {
				callback(null, matches);
			}
		});
	};

	this.getMatchesStartingAt = function(matchId, callback) {
		var url = 'https://api.steampowered.com/IDOTA2Match_570/GetMatchHistory/V001/?account_id=' + accountId + '&start_at_match_id=' + matchId;
		api.call(url, function(err, json) {
			var ids = getIds(json.result.matches);
			matches = matches.concat(ids);

			if (json.result.results_remaining > 0) {
				var startAtMatchId = ids[ids.length - 1];
				_this.getMatchesStartingAt(startAtMatchId - 1, callback);
			} else {
				callback(null, matches);
			}
		});
	};

	function getIds(matches) {
		var matchIds = [];
		for (var i=0; i<matches.length; i++) {
			matchIds.push(matches[i].match_id);
		}
		return matchIds;
	}
};
