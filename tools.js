const util = require('util');
const path = require('path');
const fs = require('fs');
const yaml = require('node-yaml');
const mkdirp = require('mkdirp');
const os = require('os');

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
	getServiceManifest() {
		const goPath = process.env.GOPATH;
		if (!goPath) {
			throw new Error('GOPATH must be set!');
		}
		let mPath = 'manifest.yaml';

		while (mPath) {
			const aPath = path.resolve(mPath);

			if (aPath.indexOf(goPath) !== 0) {
				return {};
			}
			if (fs.existsSync(aPath)) {
				const svcDir = path.dirname(aPath);
				try {
					const manifest = yaml.readSync(aPath);
					return { svcDir, manifest };
				} catch (e) {
					throw new Error('Malformed manifest.yaml');
				}
			}
			mPath = `../${mPath}`;
		}
		return {};
	},
	cacheClear() {
		execSync(`rm -rf ${os.tmpdir()}/.gokums.*`);
	},
	cache(key, obj) {
		const tmpfn = `${os.tmpdir()}/.gokums.${key}.json`;
		try {
			if (!obj) {
				const content = fs.readFileSync(tmpfn);
				return JSON.parse(content);
			}
			this.writeFilePath(tmpfn, JSON.stringify(obj));
			return true;
		} catch (e) {
			this.cacheClear();
			return null;
		}
	},
	async findProjects() {
		const { stdout } = await execPromise(`find ${process.env.GOPATH}/src -type f -name root.yaml`);
		const files = stdout.split('\n').filter(f => !!f.trim());
		if (!files) {
			return [];
		}
		const mans = {};
		await Promise.all(files.map(async (fname) => {
			try {
				const manifest = yaml.readSync(fname);
				const rootDir = path.dirname(fname);
				mans[manifest.project] = { rootDir, manifest };
			} catch (e) {
				// Ignore non valid file
			}
		}));
		return mans;
	},
	async findServices(rootDir) {
		const { stdout } = await execPromise(`find ${rootDir}/src/service -type f -name manifest.yaml`);
		const files = stdout.split('\n').filter(f => !!f.trim());
		if (!files) {
			return [];
		}
		const mans = {};
		await Promise.all(files.map(async (fname) => {
			const manifest = yaml.readSync(fname);
			const svcDir = path.dirname(fname);
			mans[manifest.service.name] = { svcDir, manifest };
		}));
		return mans;
	},
	writeFilePath(f, c, o) {
		const dir = path.dirname(f);
		if (!fs.existsSync(dir)) {
			this.mkdirp(dir);
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

