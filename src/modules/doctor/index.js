require('colors');
const rp = require('request-promise-native');
const yaml = require('node-yaml');
const ojp = require('object-path');
const version = require('../../../version');
const fs = require('fs');

module.exports = async (argv, tools) => {
	const { log } = tools;
	let rootDir = null;
	let meta = null;
	try {
		({ rootDir, meta } = await tools.getRootMeta());
	} catch (e) {
		// Ignore error
	}

	// @ Check cli version
	let stopWaiting = log.waiter('Checking gokums-cli...');
	try {
		const resp = await rp('https://raw.githubusercontent.com/gokums/cli/master/version.json');
		const resj = JSON.parse(resp);
		if (resj.version !== version.version) {
			stopWaiting(` There is new version ${resj.version}, please update with ${'npm update gokums-cli -g'.red}`);
		} else {
			stopWaiting(` You're using latest ${version.version.green}`);
		}
	} catch (err) {
		stopWaiting(` ${'NG'.red}: ${err.toString()}`);
	}

	// @ Check node
	stopWaiting = log.waiter('Checking Node.js... ');
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

	// @ Check go
	stopWaiting = log.waiter('Checking Golang... ');
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

	// @ Check gcloud tool
	stopWaiting = log.waiter('Checking gcloud... ');
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

	// @ Check kubectl tool
	stopWaiting = log.waiter('Checking kubectl... ');
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

	// @ Check protoc tool
	stopWaiting = log.waiter('Checking protoc... ');
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

	// @ Check git
	stopWaiting = log.waiter('Checking git... ');
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

	// @ Check docker
	stopWaiting = log.waiter('Checking docker... ');
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

	// @ Check dep
	stopWaiting = log.waiter(`Checking Golang dependency manager ${'dep'.cyan}... `);
	try {
		if (!rootDir) {
			const depVersion = tools.process.execSync('dep version', { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();
			if (!depVersion) {
				stopWaiting(` ${'NG'.red}, please install dep`);
			} else {
				stopWaiting(` ${'OK'.yellow} please run again inside a project to check dependency`);
			}
		} else {
			const depStatus = tools.process.execSync('dep status -json', { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();
			if (!depStatus) {
				stopWaiting(` ${'NG'.red}, please install dep`);
			} else {
				JSON.parse(depStatus);
				stopWaiting(` ${'OK'.green}`);
			}
		}
	} catch (err) {
		stopWaiting(` ${'NG'.red}: ${err.toString()}`);
		console.log('Please run dep status to solve the problem'.yellow);
	}

	// @ Check make
	stopWaiting = log.waiter('Checking make version... ');
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

	// @ Check GOPATH
	stopWaiting = log.waiter('Checking GOPATH... ');
	if (!process.env.GOPATH) {
		stopWaiting(` ${'NG'.red}, please set up GOPATH environment varialbe`);
	} else {
		stopWaiting(` ${'OK'.green}`);
	}

	// @ Check plugins
	log.ln('Checking plugins...');
	const plugins = tools.getPlugins(rootDir, meta);
	let plug = 'github.com/golang/protobuf/protoc-gen-go';
	if (plugins.indexOf(plug) < 0) {
		log.ln(`  Please install protoc-gen-go with ${'gok plugin add'.yellow} ${plug.yellow}`.cyan);
	}
	plug = 'github.com/grpc-ecosystem/grpc-gateway/protoc-gen-grpc-gateway';
	if (plugins.indexOf(plug) < 0) {
		log.ln(`  Please install protoc-gen-grpc-gateway with ${'gok plugin add'.yellow} ${plug.yellow}`.cyan);
	}
	plug = 'github.com/gokums/go-proto-validators/protoc-gen-govalidators';
	if (plugins.indexOf(plug) < 0) {
		log.ln(`  You may want to install protoc-gen-govalidators with ${'gok plugin add'.yellow} ${plug.yellow}`);
	}
	plug = 'github.com/grpc-ecosystem/grpc-gateway/protoc-gen-swagger';
	if (plugins.indexOf(plug) < 0) {
		log.ln(`  You may want to install protoc-gen-swagger with ${'gok plugin add'.yellow} ${plug.yellow}`);
	}
};
