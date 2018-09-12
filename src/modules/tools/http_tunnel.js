const http = require('http');
const repl = require('repl');
const ngrok = require('ngrok');

async function createServer() {
	const server = http.createServer((req, res) => {
		let rawBody;
		const done = () => {
			res.writeHead(200, {});
			res.end('OK!');
		};

		rawBody = '';
		req.on('data', (chunk) => {
			rawBody += chunk;
		});
		req.on('end', (chunk) => {
			if (chunk) rawBody += chunk;
			console.log('------------------------------'.cyan);
			console.log('>>>>HEADERS'.yellow);
			console.log(req.headers);
			try {
				const body = JSON.parse(rawBody);
				console.log('>>>>JSON-BODY'.yellow);
				console.log(JSON.stringify(body, null, ' '));
			} catch (err) {
				console.log('>>>>RAW-BODY'.yellow);
				console.log(rawBody);
			}
			done();
		});
	});

	return new Promise((resolve, reject) => {
		server.listen(3456, (err) => {
			if (err) return reject(err);
			return resolve(server);
		});
	});
}

module.exports = async (argv) => {
	console.log('Creating local logging server'.cyan);
	const server = await createServer();
	console.log('Tunneling logging server...'.cyan);
	const options = { addr: 3456 };
	if (argv.proto) options.proto = argv.proto;
	if (argv.addr) options.addr = argv.addr;
	if (argv.auth) options.auth = argv.auth;
	if (argv.subdomain) options.subdomain = argv.subdomain;
	if (argv.authtoken) options.authtoken = argv.authtoken;
	if (argv.region) options.region = argv.region;

	const url = await ngrok.connect(options);
	console.log(`Remote at ${url.yellow}`.green);

	console.log(`Navigate to ${'http://127.0.0.1:4040/'.yellow} to inspect`);

	const rs = repl.start();

	rs.rli.on('close', () => {
		console.log('Closing server & tunnel...'.green);
		ngrok.disconnect();
		server.close();
	});
};
