const ojp = require('object-path');
const deepExtend = require('deep-extend');

module.exports = async (argv, tools) => {
	if (argv._.length <= 1) {
		throw new Error('Tasks not found');
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

	const projectVars = ojp.get(meta, 'metadata.vars', {});
	const svcVars = ojp.get(manifest, 'metadata.vars', {});
	const vars = deepExtend(projectVars, svcVars);

	const rootTasks = { ...meta.metadata.tasks };
	const mergedTasks = deepExtend(rootTasks, ojp.get(manifest, 'metadata.tasks'));

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
		vars,
		service: manifest.service,
		argv,
		env: process.env,
	};

	const tasks = [];
	for (let i = 1; i < argv._.length; i += 1) {
		if (!mergedTasks[argv._[i]]) throw new Error(`Task ${argv._[i]} not found!`);
		tasks.push(argv._[i]);
	}

	for (let i = 0; i < tasks.length; i += 1) {
		const theTask = mergedTasks[tasks[i]];
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
	}
};
