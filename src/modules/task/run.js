const ojp = require('object-path');
const checkStep = require('./lib/checkStep');
const tplTools = require('../../tpltools');
const deepExtend = require('deep-extend');
const yaml = require('js-yaml');

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
	const gitSHA = tools.process.execSync('git rev-parse --short HEAD', { cwd: svcDir || rootDir, shell });

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
		const pipeOptions = {
			stdio: ['inherit', 'pipe', 'inherit'],
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
				if (cmd.indexOf('substeps.') === 0) {
					const substeps = ojp.get(theTask, cmd);
					let broken = false;
					for (let ssi = 0; ssi < substeps.length; ssi += 1) {
						const substep = await checkStep(substeps[ssi], theMeta);
						if (substep.runable) {
							console.log(`  ${cmd}: About to run: ${(substep.name || substep.cmd).cyan}`);
							const {
								pipe,
								store,
								storeYaml,
								storeJSON,
							} = substeps[ssi];
							const opts = pipe || store || storeYaml || storeJSON ? pipeOptions : options;
							const res = tools.process.spawnSync(
								substep.cmd,
								opts,
							);
							if (res.status !== 0) {
								console.log('Stop due to non-sucessfull exit in sub step.');
								broken = true;
								break;
							}
							if (substeps[ssi].break) {
								console.log('Stop due to break control');
								broken = true;
								break;
							}
							const stdout = res.stdout && res.stdout.toString().trim();

							if (pipe) theMeta.pipe = stdout;
							if (store) theMeta.tools.set(store, stdout);
							if (storeYaml) theMeta.tools.set(storeYaml, yaml.load(stdout));
							if (storeJSON) theMeta.tools.set(storeJSON, JSON.parse(stdout));
						} else {
							console.log(`  ${cmd}: Ignore: ${(substep.name || substep.cmd)}`.grey);
						}
					}
					if (broken) break;
				} else {
					const {
						pipe,
						store,
						storeYaml,
						storeJSON,
					} = steps[j];
					const opts = pipe || store || storeYaml || storeJSON ? pipeOptions : options;
					const res = tools.process.spawnSync(cmd, opts);
					if (res.status !== 0) {
						console.log('Stop due to non-sucessfull exit in step.');
						break;
					}
					const stdout = res.stdout && res.stdout.toString().trim();
					if (pipe) theMeta.pipe = stdout;
					if (store) theMeta.tools.set(store, stdout);
					if (storeYaml) theMeta.tools.set(storeYaml, yaml.load(stdout));
					if (storeJSON) theMeta.tools.set(storeJSON, JSON.parse(stdout));
				}
				if (steps[j].break) {
					console.log('Stop due to break control');
					break;
				}
			} else {
				console.log(`Ignore: ${(name || cmd)}`.grey);
			}
		}
	}
};

