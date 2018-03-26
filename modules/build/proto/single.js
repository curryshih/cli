module.exports = async (data, tools) => {
	const protocPath = '-Iproto -Ivendor/github.com/grpc-ecosystem/grpc-gateway/third_party/googleapis -Ivendor/github.com/gokums/go-proto-validators';

	const { gateway, validator } = data;

	if (gateway) {
		const gcommand = `protoc ${protocPath} \
--grpc-gateway_out=logtostderr=true:${data.gwOutdir} ${data.filename}`;

		const stopWaiting = tools.log.waiter(`Generating grpc-gateway source for ${data.filename}... `);
		try {
			tools.process.execSync(gcommand, { cwd: data.rootDir, stdio: ['pipe', 'pipe', process.stderr] }).toString().replace('v', '').trim();
			stopWaiting(` done ${'OK'.green}`);
		} catch (err) {
			stopWaiting('Please check your proto and try again'.red);
			throw new Error('Can not build gw proto');
		}
		return;
	}

	if (validator) {
		const gcommand = `protoc ${protocPath} \
--govalidators_out=${data.validatorOutdir} ${data.filename}`;
		const stopWaiting = tools.log.waiter(`Generating validator source for ${data.filename}... `);
		try {
			tools.process.execSync(gcommand, { cwd: data.rootDir, stdio: ['pipe', 'pipe', process.stderr] }).toString().replace('v', '').trim();
			stopWaiting(` done ${'OK'.green}`);
		} catch (err) {
			stopWaiting('Please check your proto and try again'.red);
			throw new Error('Can not build validator');
		}
		return;
	}

	const command = `protoc ${protocPath} \
--go_out=Mgoogle/api/annotations.proto=github.com/grpc-ecosystem/grpc-gateway/third_party/googleapis/google/api,\
plugins=grpc:${data.outDir} ${data.filename}`;

	const stopWaiting = tools.log.waiter(`Generating protobuf source for ${data.filename}... `);

	try {
		tools.process.execSync(command, { cwd: data.rootDir, stdio: ['pipe', 'pipe', process.stderr] }).toString().replace('v', '').trim();
		stopWaiting(` done ${'OK'.green}`);
	} catch (err) {
		stopWaiting('Please check your proto and try again'.red);
		throw new Error('Can not build proto');
	}
};

