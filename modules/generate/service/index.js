const dockertpl = require('./template/docker');
const maintpl = require('./template/main');
const yaml = require('node-yaml');

module.exports = async (argv, tools) => {
	const { log } = tools;
	const serviceName = argv._[2];

	if (!serviceName || !serviceName.match(tools.regex.name)) {
		log.ln(`serviceName ${serviceName} should only contain letter and number`);
		log.ln('Example:');
		log.ln(' goodName');
		log.ln(' bad-Name');
		throw new Error('Bad name for a service');
	}

	const packagePath = argv.p;
	if (packagePath && !packagePath.match(tools.regex.path)) {
		throw new Error(`${packagePath} is a bad name for package`);
	}

	const waiterEnd = tools.log.waiter('Start munching...');
	try {
		const manifest = { service: { name: serviceName } };
		const { rootDir } = await tools.getRootMeta();
		let servicePath = `${rootDir}/src/service`;
		if (packagePath) {
			servicePath = `${servicePath}/${packagePath}`;
		}
		servicePath = `${servicePath}/${serviceName}`;

		const success = tools.mkdirp(servicePath);
		if (!success) {
			throw new Error(`${serviceName} service exists.`);
		}

		// manifest.yaml
		yaml.writeSync(`${servicePath}/manifest.yaml`, manifest);

		// Dockerfile
		const dockerfile = dockertpl(manifest);
		tools.writeFilePath(`${servicePath}/Dockerfile`, dockerfile);

		// Main file
		const mainfile = maintpl();
		tools.writeFilePath(`${servicePath}/main.go`, mainfile);

		// Create folders
		tools.mkdirp(`${servicePath}/k8s`);
		tools.mkdirp(`${servicePath}/internal/rpc`);

		waiterEnd(' ok.');
	} catch (e) {
		waiterEnd(' ng.'.red);
		console.log(e.stack);
		throw e;
	}
};
