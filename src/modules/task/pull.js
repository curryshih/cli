const rp = require('request-promise-native');
const ojp = require('object-path');

module.exports = async (argv, tools) => {
	const { rootDir, meta } = await tools.getRootMeta();
	if (!rootDir || !meta) throw new Error('Not in a Gokums project');
	const namespace = argv._[2];
	const taskName = argv._[3];
	const taskKey = `${namespace}-${taskName}`;
	if (!namespace || !taskName) throw new Error('Must provide task namespace and task name');
	const taskURL = `https://raw.githubusercontent.com/gokums/cli/master/src/modules/task/predefined/${argv._[2]}.json`;
	const taskResp = await rp(taskURL);
	const tasks = JSON.parse(taskResp);
	if (!tasks || !tasks[taskName]) {
		console.log('List of available tasks:');
		console.log(Object.keys(tasks).join('\n').yellow);
		throw new Error('Can not find that task');
	}
	const task = tasks[taskName];
	const { svcDir, manifest } = tools.getServiceManifest();
	if (svcDir && manifest) {
		ojp.set(manifest, `metadata.tasks.${taskKey}`, task);
		tools.writeYaml(`${svcDir}/manifest.yaml`);
		console.log(`Populated task ${taskKey.yellow} to ${ojp.get(manifest, 'service.name', svcDir).cyan}`);
	}
	ojp.set(meta, `metadata.tasks.${taskKey}`, task);
	tools.writeYaml(`${rootDir}/root.yaml`, meta);
	console.log(`Populated task ${taskKey.yellow} to ${ojp.get(meta, 'project', rootDir).cyan}`);
};
