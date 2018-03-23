const flagtpl = require('./template');
const yaml = require('node-yaml');

const types = ['String', 'Int', 'Int64', 'Bool', 'Float64', 'Duration', 'Uint', 'Uint6'];

module.exports = async (argv, tools) => {
	const { log } = tools;
	const name = argv._[2] || '';
	const type = (argv.t || 'String').toLowerCase().replace(/^.| ./g, m => m.toUpperCase());
	const value = argv.v || '';
	const usage = argv.u || '';
	if (name === '' || types.indexOf(type) < 0) {
		log.ln('Syntax: gok flag add name -t Type -v defaultValue -u usage');
		log.ln('  Type default to String, must be one of String, Int, Int64, Bool, Float64, Duration, Uint, Uint6');
		log.ln('Example: gok flag add host -t String -v "127.0.0.1" -u "This is your host"');
		throw new Error('Bad syntax');
	}

	const waiterEnd = tools.log.waiter('Start munching...');
	try {
		const { svcDir, manifest } = tools.getServiceManifest();
		if (!manifest.metadata) manifest.metadata = {};
		if (!manifest.metadata.flags) manifest.metadata.flags = {};
		manifest.metadata.flags[name] = { type, value, usage };

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
