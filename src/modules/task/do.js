const ojp = require('object-path');
const deepExtend = require('deep-extend');

module.exports = async (argv, tools) => {
	const task = argv._[1];
	if (!task) {
		throw new Error('Task not found');
	}
	const { svcDir, manifest } = tools.getServiceManifest();
	if (!svcDir || !manifest) {
		throw new Error('This command must be inside a gokumns service');
	}
	const { rootDir, meta } = await tools.getRootMeta();
	if (!rootDir || !meta) {
		throw new Error('Invalid gokumns project');
	}

	// Merge root tasks with service tasks
	// - -o ".build/<%=service.name%>"
	// - -ldflags -X <%=project.package%>/src.GitSHA=<%=project.GitSHA%>

	const rootTasks = { ...meta.metadata.tasks };
	const mergedTasks = deepExtend(rootTasks, ojp.get(manifest, 'metadata.tasks'));
	const theTask = mergedTasks[task];
	if (!theTask) {
		throw new Error(`Task ${task} not found...`);
	}

	const shell = true;
	const gitSHA = tools.process.execSync('git rev-parse --short HEAD', { cwd: rootDir, shell });

	const theMeta = {
		project: {
			package: meta.package,
			name: meta.project,
			gitSHA: gitSHA.toString().trim(),
			rootDir,
			svcDir,
		},
		service: manifest.service,
		argv,
	};

	const theArgs = (theTask.args || []).join(' ');
	const tplCmd = `${theTask.cmd} ${theArgs}`;
	const cmd = tools.template(tplCmd, theMeta);
	console.log(`About to run: ${cmd.cyan}...`);

	const options = {
		cwd: svcDir,
		shell,
		env: { ...process.env, ...theTask.env },
	};

	await tools.process.execPromise(cmd, options);
};
