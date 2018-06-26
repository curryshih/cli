const ojp = require('object-path');
const checkStep = require('./lib/checkStep');
const deepExtend = require('deep-extend');

module.exports = async (argv, tools) => {
	if (argv._.length <= 1) {
		throw new Error('Tasks not found');
	}
	const { svcDir, manifest } = tools.getServiceManifest();
	// if (!svcDir || !manifest) {
	// 	throw new Error('This command must be inside a gokumns service');
	// }
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
	const { GOPATH } = process.env;
	const rootDirFromGoPath = rootDir.split(GOPATH)[1];
	const svcDirFromGoPath = (svcDir || '').split(GOPATH)[1];
	const svcDirFromRoot = (svcDir || '').split(rootDir)[1];

	const theMeta = {
		project: {
			package: meta.package,
			name: meta.project,
			gitSHA: gitSHA.toString().trim(),
			dirs: meta.dirs,
			rootDir,
			rootDirFromGoPath,
			svcDir,
			svcDirFromRoot,
			svcDirFromGoPath,
		},
		vars,
		service: ojp.get(manifest, 'service', {}),
		argv,
		timestamp: Date.now(),
		env: process.env,
	};

	const tasks = [];
	for (let i = 1; i < argv._.length; i += 1) {
		if (!mergedTasks[argv._[i]]) throw new Error(`Task ${argv._[i]} not found!`);
		tasks.push(argv._[i]);
	}

	for (let i = 0; i < tasks.length; i += 1) {
		const theTask = mergedTasks[tasks[i]];
		const options = {
			stdio: ['pipe', 'pipe', 'pipe'],
			cwd: svcDir,
			shell,
			env: { ...process.env, ...theTask.env },
		};

		// Backward compatible
		if (theMeta.args && theTask.cmd) {
			const theArgs = (theTask.args || []).join(' ');
			const tplCmd = `${theTask.cmd} ${theArgs}`;
			const cmd = tools.template(tplCmd, theMeta);
			console.log(`About to run: ${cmd.cyan}`);
			await tools.process.execPromise(cmd, options);
		}

		const { steps } = theTask;
		if (!steps || steps.length <= 0) continue;
		for (let j = 0; j < steps.length; j += 1) {
			const { runable, name, cmd } = await checkStep(steps[j], theMeta);
			if (runable) {
				console.log(`About to run: ${(name || cmd).cyan}`);
				await tools.process.execPromise(cmd, options);
			} else {
				console.log(`Ignore: ${(name || cmd).cyan}`);
			}
		}
	}
};
