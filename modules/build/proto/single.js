module.exports = async (data, tools) => {
	const command = `protoc -Iproto \
-Ivendor/github.com/grpc-ecosystem/grpc-gateway/third_party/googleapis \
--go_out=Mgoogle/api/annotations.proto=github.com/grpc-ecosystem/grpc-gateway/third_party/googleapis/google/api,\
plugins=grpc:${data.outDir} ${data.filename}`;

	let stopWaiting = tools.log.waiter(`Generating protobuf source for ${data.filename}... `);
	try {
		tools.process.execSync(command, { cwd: data.rootDir, stdio: ['pipe', 'pipe', process.stderr] }).toString().replace('v', '').trim();
		stopWaiting(` done ${'OK'.green}`);
	} catch (err) {
		stopWaiting('Please check your proto and try again'.red);
		throw new Error('Can not build proto');
	}

	const { gateway } = data;

	if (!gateway) {
		return;
	}

	const gcommand = `protoc -Iproto \
-Ivendor/github.com/grpc-ecosystem/grpc-gateway/third_party/googleapis \
--grpc-gateway_out=logtostderr=true:${data.gwOutdir} ${data.filename}\
`;

	stopWaiting = tools.log.waiter(`Generating grpc-gateway source for ${data.filename}... `);
	try {
		tools.process.execSync(gcommand, { cwd: data.rootDir, stdio: ['pipe', 'pipe', process.stderr] }).toString().replace('v', '').trim();
		stopWaiting(` done ${'OK'.green}`);
	} catch (err) {
		stopWaiting('Please check your proto and try again'.red);
		throw new Error('Can not build proto');
	}
};

