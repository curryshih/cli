const flagtpl = require('./template');

module.exports = async (argv, tools) => {
	const waiterEnd = tools.log.waiter('Start munching...');
	try {
		const { svcDir, manifest } = tools.getServiceManifest();
		if (!manifest.metadata) manifest.metadata = {};
		if (!manifest.metadata.flags) manifest.metadata.flags = {};

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
