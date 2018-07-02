module.exports = async (argv, tools) => {
	const target = argv._[2] || 'project';
	if (target === 'project') {
		const manifests = await tools.findProjects();
		Object.keys(manifests).forEach((pjn) => {
			tools.log.ln(`  ${pjn.yellow} located at ${manifests[pjn].rootDir}`);
		});
		return;
	}
	if (target === 'service') {
		const { rootDir, meta } = await tools.getRootMeta();
		if (!rootDir || !meta) {
			tools.log.ln('  Must be in a project to run this command');
			return;
		}
		const confDirs = tools.getConfigDirs(rootDir, meta);
		const mans = await tools.findServices(rootDir, confDirs);
		Object.keys(mans).forEach((svn) => {
			tools.log.ln(`  ${svn.yellow} located at ${mans[svn].svcDir}`);
		});
	}
};
