const util = require('util');
const path = require('path');
const fs = require('fs');
const yaml = require('node-yaml');
const mkdirp = require('mkdirp');

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
	regex: {
		path: /^[a-z]([a-z0-9_.-]+\/{0,1})+[a-z]+[a-z0-9]*$/,
		name: /^[a-zA-Z]([a-zA-Z0-9]+)$/,
	},
	async getRootMeta() {
		const goPath = process.env.GOPATH;
		if (!goPath) {
			throw new Error('GOPATH must be set!');
		}
		let rPath = 'root.yaml';

		while (rPath) {
			const aPath = path.resolve(rPath);

			if (aPath.indexOf(goPath) !== 0) {
				throw new Error('You are not inside a GOKU project folder!');
			}
			if (fs.existsSync(aPath)) {
				const rootDir = path.dirname(aPath);
				try {
					const meta = yaml.readSync(aPath);
					return { rootDir, meta };
				} catch (e) {
					throw new Error('Malformed root.yaml');
				}
			}
			rPath = `../${rPath}`;
		}
		return {};
	},
	writeFilePath(f, c, o) {
		const dir = path.dirname(f);
		if (!fs.existsSync(dir)) {
			mkdirp(dir);
		}
		return fs.writeFileSync(f, c, o);
	},
	mkdirp(dir) {
		if (!fs.existsSync(dir)) {
			mkdirp.sync(dir);
			return true;
		}
		return false;
	},
	async wait(time) {
		const msec = parseInt(time, 10);
		return new Promise((resolve) => {
			setTimeout(() => resolve(), msec * 1000);
		});
	},
	generator: {
		init() {
			const gens = {};
			const succ = function* succ(start) {
				let idx = start;
				while (idx < Infinity) {
					yield idx += 1;
				}
			};
			return (num) => {
				if (!gens[num]) gens[num] = succ(num);
				return gens[num].next().value;
			};
		},
	},
};

