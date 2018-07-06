const ojp = require('object-path');
const checkStep = require('./lib/checkStep');
const tplTools = require('../../tpltools');
const deepExtend = require('deep-extend');

module.exports = async (argv, tools) => {
	if (argv._.length < 3) {
		throw new Error('Tasks not found');
	}
	const { svcDir, manifest } = tools.getServiceManifest();

	const { rootDir, meta } = await tools.getRootMeta();
	if (!rootDir || !meta) {
		throw new Error('Invalid gokumns project');
	}

	const rootTasks = { ...meta.metadata.tasks };
	const mergedTasks = deepExtend(rootTasks, ojp.get(manifest, 'metadata.tasks'));

	const shell = true;
	const gitSHA = tools.process.execSync('git rev-parse --short HEAD', { cwd: rootDir, shell });

	const theMeta = tplTools.tplMeta(argv, rootDir, meta, svcDir, manifest, gitSHA);

	const tasks = [];
	for (let i = 2; i < argv._.length; i += 1) {
		if (!mergedTasks[argv._[i]]) throw new Error(`Task ${argv._[i]} not found!`);
		tasks.push(argv._[i]);
	}

	const cwd = svcDir || rootDir;

	for (let i = 0; i < tasks.length; i += 1) {
		const theTask = mergedTasks[tasks[i]];
		const options = {
			stdio: 'inherit',
			cwd,
			shell,
			env: { ...process.env, ...theTask.env },
		};

		// Backward compatible
		if (theTask.args && theTask.cmd) {
			const theArgs = (theTask.args || []).join(' ');
			const tplCmd = `${theTask.cmd} ${theArgs}`;
			const cmd = tools.template(tplCmd, theMeta);
			console.log(`About to run: ${cmd.cyan}`);
			tools.process.spawnSync(cmd, options);
		}

		const { steps } = theTask;
		if (!steps || steps.length <= 0) continue;
		for (let j = 0; j < steps.length; j += 1) {
			const { runable, name, cmd } = await checkStep(steps[j], theMeta);
			if (runable) {
				console.log(`About to run: ${(name || cmd).cyan}`);
				tools.process.spawnSync(cmd, options);
			} else {
				console.log(`Ignore: ${(name || cmd).cyan}`);
			}
		}
	}
};

