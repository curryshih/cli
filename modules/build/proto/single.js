const validatorProto = 'validator.proto=github.com/gokums/go-proto-validators';
const protocPath = '-Iproto -Ivendor/github.com/grpc-ecosystem/grpc-gateway/third_party/googleapis -Ivendor/github.com/gokums/go-proto-validators';

module.exports = async (data, tools) => {
	const { gateway, validator } = data;

	let command = `protoc ${protocPath} --go_out=M${validatorProto},plugins=grpc:${data.outDir}`;
	if (validator) command = `${command} --govalidators_out=M${validatorProto}:${data.outDir}`;
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

