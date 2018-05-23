const config = require('./config');

module.exports = async (data, tools) => {
	const { gateway, validator, confDirs } = data;

	const paths = config.buildPath(data.paths);
	const mappings = config.buildMapping(data.mappings);
	const plugins = config.buildPlugins(data.plugins || []);

	let command = `protoc -I${confDirs.proto} ${paths} ${plugins} --go_out=${mappings},plugins=grpc:${data.outDir}`;
	if (validator) command = `${command} --govalidators_out=${mappings}:${data.outDir}`;
	let stopWaiting;

	if (gateway) {
		command = `${command} --grpc-gateway_out=logtostderr=true:${data.outDir}`;
		stopWaiting = tools.log.waiter(`Generating grpc-gateway source for ${data.filename}... `);
	} else {
		stopWaiting = tools.log.waiter(`Generating protobuf source for ${data.filename}... `);
	}

	command = `${command} ${data.filename}`;

	try {
		tools.process.execSync(command, { cwd: data.rootDir, stdio: ['pipe', 'pipe', process.stderr] }).toString().replace('v', '').trim();
		stopWaiting(` done ${'OK'.green}`);
	} catch (err) {
		stopWaiting('Please check your proto and try again'.red);
		throw new Error('Can not build proto');
	}
};

