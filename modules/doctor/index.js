require('colors');
const rp = require('request-promise-native');
const version = require('../../version');

module.exports = async (argv, tools) => {
	// Check cli version
	let stopWaiting = tools.log.waiter('Checking gok-cli...');
	try {
		const resp = await rp('https://raw.githubusercontent.com/gokums/cli/master/version.json');
		const resj = JSON.parse(resp);
		if (resj.version !== version.version) {
			stopWaiting(` There is new version ${resj.version}, please update with ${'npm update gok-cli -g'.red}`);
		} else {
			stopWaiting(` You're using latest ${version.version.green}`);
		}
	} catch (err) {
		stopWaiting(` ${'NG'.red}: ${err.toString()}`);
	}

	// Check node
	stopWaiting = tools.log.waiter('Checking Node.js... ');
	try {
		const nodeVersion = tools.process.execSync('node --version', { stdio: ['pipe', 'pipe', 'ignore'] }).toString().replace('v', '').trim();
		if (nodeVersion < '8.0.0') {
			stopWaiting(` version ${nodeVersion} ${'NG'.red}, expect >= 8.0.0`);
		} else {
			stopWaiting(` version ${nodeVersion} ${'OK'.green}`);
		}
	} catch (err) {
		stopWaiting(` ${'NG'.red}: ${err.toString()}`);
	}

	// Check go
	stopWaiting = tools.log.waiter('Checking Golang... ');
	try {
		const goVersion = tools.process.execSync('go version', { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();
		if (!goVersion) {
			stopWaiting(`${goVersion} ${'NG'.red}`);
		} else {
			stopWaiting(`${goVersion} ${'OK'.green}`);
		}
	} catch (err) {
		stopWaiting(` ${'NG'.red}: ${err.toString()}`);
	}

	// Check gcloud tool
	stopWaiting = tools.log.waiter('Checking gcloud... ');
	try {
		const gcloudVersion = tools.process.execSync('gcloud version', { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();
		if (!gcloudVersion) {
			stopWaiting(` ${'NG'.red}, please install gcloud`);
		} else {
			stopWaiting(` ${'OK'.green}`);
		}
	} catch (err) {
		stopWaiting(` ${'NG'.red}: ${err.toString()}`);
	}

	// Check kubectl tool
	stopWaiting = tools.log.waiter('Checking kubectl... ');
	try {
		const kubectlVersion = tools.process.execSync('kubectl version', { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();
		if (!kubectlVersion) {
			stopWaiting(` ${'NG'.red}, please install kubectl`);
		} else {
			stopWaiting(` ${'OK'.green}`);
		}
	} catch (err) {
		stopWaiting(` ${'NG'.red}: ${err.toString()}`);
	}

	// Check protoc tool
	stopWaiting = tools.log.waiter('Checking protoc... ');
	try {
		const protocVersion = tools.process.execSync('protoc --version', { stdio: ['pipe', 'pipe', 'ignore'] }).toString().replace('libprotoc', '').trim();
		if (protocVersion < '3.5.0') {
			stopWaiting(` version ${protocVersion} ${'NG'.red}, expect >= 3.5.0`);
		} else {
			stopWaiting(` version ${protocVersion} ${'OK'.green}`);
		}
	} catch (err) {
		stopWaiting(` ${'NG'.red}: ${err.toString()}`);
	}

	// Check git
	stopWaiting = tools.log.waiter('Checking git... ');
	try {
		const gitVersion = tools.process.execSync('git version', { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();
		if (!gitVersion) {
			stopWaiting(` ${'NG'.red}, please install git`);
		} else {
			stopWaiting(` ${'OK'.green}`);
		}
	} catch (err) {
		stopWaiting(` ${'NG'.red}: ${err.toString()}`);
	}

	// Check docker
	stopWaiting = tools.log.waiter('Checking docker... ');
	try {
		const dockerVersion = tools.process.execSync('docker version', { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();
		if (!dockerVersion) {
			stopWaiting(` ${'NG'.red}, please install docker`);
		} else {
			stopWaiting(` ${'OK'.green}`);
		}
	} catch (err) {
		stopWaiting(` ${'NG'.red}: ${err.toString()}`);
	}

	// Check dep
	stopWaiting = tools.log.waiter(`Checking Golang dependency manager ${'dep'.cyan}... `);
	try {
		const depVersion = tools.process.execSync('dep version', { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();
		if (!depVersion) {
			stopWaiting(` ${'NG'.red}, please install dep`);
		} else {
			stopWaiting(` ${'OK'.green}`);
		}
	} catch (err) {
		stopWaiting(` ${'NG'.red}: ${err.toString()}`);
	}

	// Check make
	stopWaiting = tools.log.waiter(`Checking make version... `);
	try {
		const makeVersion = tools.process.execSync('make --version', { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();
		if (!makeVersion) {
			stopWaiting(` ${'NG'.red}, please install make`);
		} else {
			stopWaiting(` ${'OK'.green}`);
		}
	} catch (err) {
		stopWaiting(` ${'NG'.red}: ${err.toString()}`);
	}

};
