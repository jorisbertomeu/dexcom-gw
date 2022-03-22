const bodyParser = require('body-parser');
const compress = require('compression');
const DexcomJS = require('dexcom-js');
const express = require('express');
const cors = require('cors');
const app = express();

const path = require('path');

// import .env variables
require('dotenv').config({
	path: path.join(__dirname, './.env'),
	allowEmptyValues: true
});
const port = parseInt(process.env.SERVER_PORT);

const secondsPerDay         = 86400;
const millisecondsPerSecond = 1000;

DexcomJS.setOptions({
  clientId: process.env.DEXCOM_CLIENTID,
  clientSecret: process.env.DEXCOM_CLIENTSECRET,
  redirectUri: 'https://bertom.eu/dexcom-gw/oauth', //Useless for our use-case
  apiUri: `https://${process.env.DEXCOM_URI}`,
});

let oauthTokens = {
	timestamp: Date.now(),
	dexcomOAuthToken: {
		access_token:  'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIwMDc4ZjM5Mi1jMmM4LTQ5NjktYWNiNy0zOWVhOGQ0Yzk4OGMiLCJhdWQiOiJodHRwczovL3NhbmRib3gtYXBpLmRleGNvbS5jb20iLCJzY29wZSI6WyJlZ3YiLCJjYWxpYnJhdGlvbiIsImRldmljZSIsImV2ZW50Iiwic3RhdGlzdGljcyIsIm9mZmxpbmVfYWNjZXNzIl0sImlzcyI6Imh0dHBzOi8vc2FuZGJveC1hcGkuZGV4Y29tLmNvbSIsImV4cCI6MTY0Nzk2MTk5MiwiaWF0IjoxNjQ3OTU0NzkyLCJjbGllbnRfaWQiOiJrcWVpMHd6Qlc0czMxaFI1YWlUTDhUS2g5UDZJZFVNMSJ9.kRlQI9iU3T3052226E2buMKyzJhDShNegk41d1Ssxv46jrJE_OB3U01UCihTXLIRAqrK3kxTji_uVgTTW0nIMY_xfVaaXpEfJd0cLDg6glIP8Ez5otbo2wSnmKiWnHJb3iJ0jlyv5uB07hY1odwM4zSq6JIuk68h0uPqU61nRAbmXxoXGNAMBr09CrpqKk0-ILmgKKf88djhWg9TyOptSHn3foQom5JeJxBgBZkazC7VD49O7sHd_mQfg_XQMT47fRe3tpU-h1NkGhgldPkdfS4GMhCytr_ybCLFcTVoAT9M8VdzUSJWcHi-mvNI1ZZGKbxgcdwB51cklrjUFkDOUw',
		expires_in:    7200,
		token_type:    'Bearer',
		refresh_token: 'ea55b93fb6ca5d5b22032c37bfd28422'
	}
}

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(cors());
app.options('*', cors());

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
	res.header('Access-Control-Allow-Methods', 'PUT, PATCH, POST, GET, DELETE, OPTIONS');
	next();
});

app.get('/', async (req, res, next) => {
	const endDate   = new Date().getTime();
	const startDate = endDate - (secondsPerDay * millisecondsPerSecond);

	console.log(`From ${(new Date(startDate)).toUTCString()} to ${(new Date(endDate)).toUTCString()}`)
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
	console.log(`Server listening on port ${port}`)
})