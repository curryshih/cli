const checkStep = require('./lib/checkStep');
const tplTools = require('../../tpltools');
const rp = require('request-promise-native');
const yaml = require('js-yaml');

module.exports = async (argv, tools) => {
	const { rootDir, meta } = await tools.getRootMeta();
	if (!rootDir || !meta) throw new Error('Not in a Gokums project');
	const namespace = argv._[2];
	const taskName = argv._[3];
	if (!namespace) throw new Error('Must provide task namespace and task name');
	const taskURL = `https://raw.githubusercontent.com/gokums/cli/master/src/modules/task/predefined/${namespace}.yml`;
	const taskResp = await rp(taskURL);
	const tasks = yaml.load(taskResp);
	if (!tasks || !taskName || !tasks[taskName]) {
		console.log('List of available tasks:');
		console.log(Object.keys(tasks).join('\n').yellow);
		if (!tasks || taskName) {
			throw new Error('Can not find that task');
		}
		return;
	}
	const { svcDir, manifest } = tools.getServiceManifest();

	const shell = true;
	const gitSHA = tools.process.execSync('git rev-parse --short HEAD', { cwd: rootDir, shell });

	const theMeta = tplTools.tplMeta(argv, rootDir, meta, svcDir, manifest, gitSHA);

	const theTask = tasks[taskName];

	const cwd = svcDir || rootDir;

	const options = {
		stdio: 'inherit',
		cwd,
		shell,
		env: { ...process.env, ...theTask.env },
	};

	const { steps } = theTask;
	if (!steps || steps.length <= 0) throw new Error('The task has no step');
	for (let j = 0; j < steps.length; j += 1) {
		const { runable, name, cmd } = await checkStep(steps[j], theMeta);
		if (runable) {
			console.log(`About to run: ${(name || cmd).cyan}`);
			tools.process.spawnSync(cmd, options);
		} else {
			console.log(`Ignore: ${(name || cmd).cyan}`);
		}
	}
};

