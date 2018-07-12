const fs = require('fs');
const path = require('path');

module.exports = (ctx, protoPath) => {
	const { GIS } = ctx;
	if (!fs.existsSync(protoPath)) {
		console.log('Folder does not exist'.yellow);
		return;
	}
	const files = fs.readdirSync(protoPath);
	const messages = {};
	const services = {};
	for (let i = 0; i < files.length; i += 1) {
		const fn = `${protoPath}/${files[i]}`;
		const lst = fs.lstatSync(fn);
		if (lst.isFile()) {
			if (fn.endsWith('_grpc_pb.js')) {
				const svcs = require(path.resolve(fn)); // eslint-disable-line
				Object.keys(svcs).forEach((key) => {
					services[key] = svcs[key];
				});
			} else if (fn.endsWith('_pb.js')) {
				const protos = require(path.resolve(fn)); // eslint-disable-line
				Object.keys(protos).forEach((key) => {
					messages[key] = protos[key];
				});
			}
		}
	}
	GIS.context.messages = messages;
	GIS.context.services = services;
	ctx.grpc = { messages, services };
};
