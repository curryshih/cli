module.exports = async (argv, tools) => {
	try {
		const { rootDir, meta } = await tools.getRootMeta();
		const confDirs = tools.getConfigDirs(rootDir, meta);
		if (rootDir) {
			if (!argv._[2]) {
				tools.log.ln(rootDir);
				return;
			}
			const manifests = await tools.findServices(rootDir, confDirs);
			const services = Object.keys(manifests).filter(n => n.indexOf(argv._[2]) >= 0);
			if (services.length > 1) throw new Error(`There are at least two services matched, like ${services[0]}, ${services[1]}`);
			if (services.length === 1) {
				tools.log.ln(manifests[services[0]].svcDir);
				return;
			}
		}
	} catch (e) {
		// Mostly because you can not find a root or services
	}

	if (!argv._[2]) throw new Error('Not in a project, need a project name to navigate to');
	const manifests = await tools.findProjects();
	const roots = Object.keys(manifests).filter(n => n.indexOf(argv._[2]) >= 0);
	if (roots.length > 1) throw new Error(`There are at least two projects matched, like ${roots[0]}, ${roots[1]}`);
	if (roots.length === 1) {
		tools.log.ln(manifests[roots[0]].rootDir);
	}
};
