const ojp = require('object-path');

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
		const logFn = (svn) => {
			if (argv['name-only']) {
				tools.log.ln(svn);
			} else if (argv['dir-only']) {
				tools.log.ln(mans[svn].svcDir);
			} else {
				tools.log.ln(`  ${svn.yellow} located at ${mans[svn].svcDir}`);
			}
		};
		const tags = (argv.tags || '').split(',');
		Object.keys(mans).forEach((svn) => {
			const svc = mans[svn];
			const svcTags = ojp.get(svc, 'manifest.service.tags', []);
			if (argv.tags) {
				if (tags.find(t => svcTags.indexOf(t) >= 0)) {
					logFn(svn);
				}
				return;
			}
			logFn(svn);
		});
	}
};
