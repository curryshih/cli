const util = require('util');

const {
	spawn, spawnSync, exec, execSync,
} = require('child_process');
const execPromise = util.promisify(require('child_process').exec);

module.exports = {
	process: {
		spawn, spawnSync, exec, execSync, execPromise,
	},
	log: {
		ln(...args) {
			console.log(...args);
		},
		waiter(msg = 'Loading...', dot = '.') {
			process.stdout.write(msg);
			const lid = setInterval(() => {
				process.stdout.write(dot);
			}, 1000);
			return (...msgs) => {
				clearInterval(lid);
				console.log(...msgs);
			};
		},
	},
};

