const fs = require('fs');
const path = require('path');
const ojp = require('object-path');

const loadProto = (GIS, loadPath, namespace, rescursive = false) => {
	if (!fs.existsSync(loadPath)) return;
	const { services, messages } = GIS.context;
	const files = fs.readdirSync(loadPath);
	for (let i = 0; i < files.length; i += 1) {
		const fn = `${loadPath}/${files[i]}`;
		const lst = fs.lstatSync(fn);
		if (lst.isFile()) {
			console.log(`  - File: ${fn.yellow} > ${namespace}`);
			const fullFn = path.resolve(fn);
			if (fn.endsWith('_grpc_pb.js')) {
				const svcs = require(fullFn); // eslint-disable-line
				if (!namespace) {
					Object.keys(svcs).forEach((key) => {
						services[key] = svcs[key];
					});
				} else {
					const crSvcs = ojp.get(services, namespace, {});
					ojp.set(services, namespace, { ...crSvcs, ...svcs });
				}
			} else if (fn.endsWith('_pb.js')) {
				const protos = require(fullFn); // eslint-disable-line
				if (!namespace) {
					Object.keys(protos).forEach((key) => {
						messages[key] = protos[key];
					});
				} else {
					const crmsgs = ojp.get(messages, namespace, {});
					ojp.set(messages, namespace, { ...crmsgs, ...protos });
				}
			}
		} else if (lst.isDirectory() && rescursive) {
			loadProto(GIS, fn, `${namespace}.${files[i]}`, rescursive);
		}
	}
};

module.exports = (ctx, protoPath, namespace, rescursive) => {
	const { GIS } = ctx;
	loadProto(GIS, protoPath, namespace, !!rescursive);
};
