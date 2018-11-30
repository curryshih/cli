const tools = require('./tools');
const deepExtend = require('deep-extend');
const ojp = require('object-path');
const os = require('os');

const tplData = {
	generators: {},
	mem: {},
};

const tplTools = {
	next(schema, start) {
		if (tplData.generators[schema]) return tplData.generators[schema].next().value;
		tplData.generators[schema] = tools.generator(start);
		return start;
	},
	set(key, val) {
		tplData.mem[key] = val;
	},
	get(key) {
		return ojp.get(tplData.mem, key, null);
	},
	which(prog) {
		try {
			return tools.process.execSync(`which ${prog}`).toString().trim();
		} catch (e) {
			return '';
		}
	},
	cancel(err) {
		throw new Error(err);
	},
};

module.exports = {
	tools: tplTools,
	tplMeta(argv, rootDir, rootMan, svcDir, svcMan, gitSHA) {
		const projectVars = ojp.get(rootMan, 'metadata.vars', {});
		const svcVars = ojp.get(svcMan, 'metadata.vars', {});
		const vars = deepExtend(projectVars, svcVars);
		const dirs = ojp.get(rootMan, 'config.dirs');

		const { GOPATH } = process.env;
		const rootDirFromGoPath = rootDir.split(GOPATH)[1];
		const svcDirFromGoPath = (svcDir || '').split(GOPATH)[1];
		const svcDirFromRoot = (svcDir || '').split(rootDir)[1];

		const theMeta = {
			project: {
				package: rootMan.package,
				name: rootMan.project,
				gitSHA: gitSHA.toString().trim(),
				dirs,
				rootDir,
				rootDirFromGoPath,
				svcDir,
				svcDirFromRoot,
				svcDirFromGoPath,
			},
			service: ojp.get(svcMan, 'service', {}),
			argv,
			timestamp: Date.now(),
			env: process.env,
			tools: tplTools,
			os,
		};
		const tplVars = tools.deepTemplate(vars, theMeta);
		theMeta.vars = tplVars;
		return theMeta;
	},
};
