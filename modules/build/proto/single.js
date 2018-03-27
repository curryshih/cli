const annotationProto = 'google/api/annotations.proto=github.com/grpc-ecosystem/grpc-gateway/third_party/googleapis/google/api';
const protocPath = '-Iproto -Ivendor/github.com/grpc-ecosystem/grpc-gateway/third_party/googleapis -Ivendor/github.com/gokums/go-proto-validators';

module.exports = async (data, tools) => {
	const { gateway, validator } = data;

	if (gateway) {
		let command = `protoc ${protocPath} --grpc-gateway_out=logtostderr=true:${data.outDir}`;
		if (validator) command = `${command} --govalidators_out=${data.outDir}`;
		command = `${command} ${data.filename}`;

		const stopWaiting = tools.log.waiter(`Generating grpc-gateway source for ${data.filename}... `);
		try {
			tools.process.execSync(command, { cwd: data.rootDir, stdio: ['pipe', 'pipe', process.stderr] }).toString().replace('v', '').trim();
			stopWaiting(` done ${'OK'.green}`);
		} catch (err) {
			stopWaiting('Please check your proto and try again'.red);
			throw new Error('Can not build gw proto');
		}
		return;
	}

	let command = `protoc ${protocPath} --go_out=M${annotationProto},plugins=grpc:${data.outDir}`;

	if (validator) {
		command = `${command} --govalidators_out=${data.outDir} ${data.filename}`;
	}
	command = `${command} ${data.filename}`;

	const stopWaiting = tools.log.waiter(`Generating protobuf source for ${data.filename}... `);

	try {
		tools.process.execSync(command, { cwd: data.rootDir, stdio: ['pipe', 'pipe', process.stderr] }).toString().replace('v', '').trim();
		stopWaiting(` done ${'OK'.green}`);
	} catch (err) {
		stopWaiting('Please check your proto and try again'.red);
		throw new Error('Can not build proto');
	}
};

