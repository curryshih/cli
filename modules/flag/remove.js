const flagtpl = require('./template');
const yaml = require('node-yaml');

module.exports = async (argv, tools) => {
	const { log } = tools;
	const name = argv._[2] || '';
	if (name === '') {
		log.ln('Syntax: gok flag remove name');
		throw new Error('Bad syntax');
	}

	const waiterEnd = tools.log.waiter('Start munching...');
	try {
		const { svcDir, manifest } = tools.getServiceManifest();
		if (!manifest.metadata) manifest.metadata = {};
		if (!manifest.metadata.flags) manifest.metadata.flags = {};
		delete manifest.metadata.flags[name];

		// manifest.yaml
		yaml.writeSync(`${svcDir}/manifest.yaml`, manifest);

		// Flags file
		tools.mkdirp(`${svcDir}/args`);
		const flagfile = flagtpl(manifest.metadata.flags);
		tools.writeFilePath(`${svcDir}/args/flag.go`, flagfile);
		tools.process.execSync(`go fmt ${svcDir}/args/flag.go`);

		waiterEnd(' ok.');
	} catch (e) {
		waiterEnd(' ng.'.red);
		if (process.env.GOKUMS_VERBOSE) console.log(e.stack);
		throw e;
	}
};
