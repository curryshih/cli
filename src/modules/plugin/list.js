module.exports = async (argv, tools) => {
	const { log } = tools;

	try {
		const { rootDir, meta } = await tools.getRootMeta();
		if (!rootDir) {
			log.ln('You need to be in a project folder to perform this');
			throw new Error('Bad folder');
		}
		const plugins = tools.getPlugins(rootDir, meta);
		if (plugins.length === 0) {
			log.ln(`You don't have any plugins, please add with ${'gok plugin add package'.yellow}`);
		}
		plugins.forEach((p) => {
			log.ln(` - ${p}`);
		});
	} catch (e) {
		if (process.env.GOKUMS_VERBOSE) console.log(e.stack);
		throw e;
	}
};
