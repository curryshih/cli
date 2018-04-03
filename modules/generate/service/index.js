const dockertpl = require('./template/docker');
const maintpl = require('./template/main');
const flagtpl = require('./template/flag');

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
		const { rootDir, meta } = await tools.getRootMeta();
		const serviceRoot = `${rootDir}/src/service`;
		let servicePath = serviceName;
		if (packagePath) {
			servicePath = `${packagePath}/${serviceName}`;
		}
		const serviceAbsPath = `${serviceRoot}/${servicePath}`;

		const success = tools.mkdirp(serviceAbsPath);
		if (!success) {
			throw new Error(`${serviceName} service exists.`);
		}

		const manifest = {
			service: { name: serviceName, path: servicePath },
			metadata: {
				flags: {
					'rpc-bind': {
						type: 'String',
						value: '9009',
						usage: 'port to bind rpc',
					},
					'http-bind': {
						type: 'String',
						value: '9019',
						usage: 'port to bind http',
					},
				},
			},
		};

		// manifest.yaml
		yaml.writeSync(`${serviceAbsPath}/manifest.yaml`, manifest);

		// Dockerfile
		const dockerfile = dockertpl(manifest);
		tools.writeFilePath(`${serviceAbsPath}/Dockerfile`, dockerfile);

		// Main file
		const mainfile = maintpl(meta, manifest);
		tools.writeFilePath(`${serviceAbsPath}/main.go`, mainfile);

		// Create folders
		tools.mkdirp(`${serviceAbsPath}/k8s`);
		tools.mkdirp(`${serviceAbsPath}/args`);
		tools.mkdirp(`${serviceAbsPath}/internal/rpc`);

		// Flag file
		const flagfile = flagtpl();
		tools.writeFilePath(`${serviceAbsPath}/args/flag.go`, flagfile);

		waiterEnd(' ok.');
	} catch (e) {
		waiterEnd(' ng.'.red);
		if (process.env.GOKUMS_VERBOSE) console.log(e.stack);
		throw e;
	}
};
