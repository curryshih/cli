module.exports = async (argv, tools) => {
	const { log } = tools;
	const svcName = argv._[2];
	if (svcName && !svcName.match(tools.regex.name)) {
		throw new Error('Bad service name');
	}

	const { rootDir, meta } = await tools.getRootMeta();
	const manifests = await tools.findServices(rootDir);
	let build = [];

	// If svcName exist, find the root and find the service
	if (svcName) {
		if (!manifests[svcName]) {
			throw new Error(`Service ${svcName} does not exists!`);
		}
		build.push(manifests[svcName]);
	} else {
	// If svcName does not exist
	//  * If inside a service, build that service
	//  * Otherwise if inside a root, build all service
		const b = tools.getServiceManifest();
		if (b) {
			log.ln(`Detect current service: ${b.manifest.service.name.green}`);
			build.push(b);
		} else {
			build = Object.values(manifests);
		}
	}

	const shell = true;
	const gitSHA = tools.process.execSync('git rev-parse --short HEAD', { cwd: rootDir, shell });
	const ldFlags = `-X ${meta.package}/src.GitSHA=${(gitSHA || '').toString().trim()}`;

	if (argv.parallel) {
		await Promise.all(build.map((b) => {
			const { svcDir, manifest } = b;
			log.ln(`About to build ${manifest.service.name.yellow} at ${svcDir.cyan}...`);
			const cmd = `go build -i -o .build/${manifest.service.name} -ldflags "${ldFlags}" main.go`;
			return tools.process.execPromise(cmd, { cwd: svcDir, shell });
		}));
	} else {
		for (let i = 0; i < build.length; i += 1) {
			const { svcDir, manifest } = build[i];
			log.ln(`About to build ${manifest.service.name.yellow} at ${svcDir.cyan}...`);
			const cmd = `go build -i -o .build/${manifest.service.name} -ldflags "${ldFlags}" main.go`;
			await tools.process.execPromise(cmd, { cwd: svcDir, shell });
		}
	}
};

