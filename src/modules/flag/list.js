const columnify = require('columnify');

module.exports = async (argv, tools) => {
	const { log } = tools;

	try {
		const { manifest } = tools.getServiceManifest();
		if (!manifest) {
			log.ln('You need to be in a service folder to perform this');
			throw new Error('Bad folder');
		}
		if (!manifest.metadata) manifest.metadata = {};
		if (!manifest.metadata.flags) manifest.metadata.flags = {};
		const columns = [];
		Object.keys(manifest.metadata.flags).forEach((name) => {
			const { type, value, usage } = manifest.metadata.flags[name];
			columns.push({
				name,
				type,
				Default: value,
				usage,
			});
		});
		log.ln(columnify(columns, {
			columnSplitter: ' \t',
		}));
	} catch (e) {
		if (process.env.GOKUMS_VERBOSE) console.log(e.stack);
		throw e;
	}
};
