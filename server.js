const DexcomJS = require('dexcom-js');
const express = require('express');
const app = express();
const port = 3000;

const secondsPerDay         = 86400;
const millisecondsPerSecond = 1000;

let oauthTokens = {
	timestamp: Date.now(),
	dexcomOAuthToken: {
		access_token:  'your access token',
		expires_in:    timeToLiveInSeconds,
		token_type:    'Bearer',
		refresh_token: 'your refresh token'
	}
}

app.get('/', async (req, res, next) => {
	const endDate   = new Date().getTime();
	const startDate = endDate - (secondsPerDay * millisecondsPerSecond); 

	try {
		const results = await DexcomJS.getStatistics(oauthTokens, startDate, endDate);

		if (('statistics' in results) && results.statistics.nValues) {
			// Do whatever is appropriate...
		}

		if ('oauthTokens' in results) {
			oauthTokens = results.oauthTokens;
		}
		res.json(results);
	} catch(e) {
		console.log(e);
		next(e);
	}
})

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`)
})