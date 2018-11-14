module.exports = async (argv, tools) => {
	let rootMeta = {};
	try {
		rootMeta = await tools.getRootMeta();
	} catch (e) {
		// Mostly because you can not find a root or services
	}

	const { rootDir, meta } = rootMeta;
	// If there is a project
	if (rootDir) {
		if (!argv._[2]) {
			tools.log.ln(rootDir);
			return;
		}
		const confDirs = tools.getConfigDirs(rootDir, meta);
		const manifests = await tools.findServices(rootDir, confDirs);
		const services = Object.keys(manifests).filter(n => n.indexOf(argv._[2]) >= 0);
		if (services.length === 0) tools.log.fatal('Can not find any service'.red);
		if (services.length > 1) {
			for (let i = 0; i < services.length; i += 1) {
				if (services[i] === argv._[2]) {
					tools.log.ln(manifests[services[i]].svcDir);
					return;
				}
			}
			tools.log.fatal(`There are at least two services matched, like ${services[0]}, ${services[1]}`.red);
		}
		if (services.length === 1) {
			tools.log.ln(manifests[services[0]].svcDir);
			return;
		}
	}

	if (!argv._[2]) throw new Error('Not in a project, need a project name to navigate to');
	const manifests = await tools.findProjects();
	const roots = Object.keys(manifests).filter(n => n.indexOf(argv._[2]) >= 0);
	if (roots.length === 0) tools.log.fatal('Can not find any project'.red);
	if (roots.length > 1) {
		for (let i = 0; i < roots.length; i += 1) {
			if (roots[i] === argv._[2]) {
				tools.log.ln(manifests[roots[i]].rootDir);
				return;
			}
		}
		tools.log.fatal(`There are at least two projects matched, like ${roots[0]}, ${roots[1]}...`.red);
	}
	if (roots.length === 1) {
		tools.log.ln(manifests[roots[0]].rootDir);
	}
};
