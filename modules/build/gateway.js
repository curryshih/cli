const fs = require('fs');
const ojp = require('object-path');
const yaml = require('node-yaml');

const singleGenerate = require('./proto/single');
const config = require('./proto/config');

module.exports = async (argv, tools) => {
	if (argv._[2] && !argv._[2].match(tools.regex.name)) {
		throw new Error('Bad proto name');
	}
	const { rootDir, meta } = await tools.getRootMeta();
	const paths = ojp.get(meta, 'config.proto.paths');
	const mappings = ojp.get(meta, 'config.proto.mappings');

	if (!paths || !mappings) {
		if (!paths) ojp.set(meta, 'config.proto.paths', config.defaultPath);
		if (!mappings) ojp.set(meta, 'config.proto.mappings', config.defaultMapping);
		yaml.writeSync(`${rootDir}/root.yaml`, meta);
	}

	if (!fs.existsSync(process.env.GOPATH)) {
		throw new Error('GOPATH does not exist');
	}
	const outDir = `${process.env.GOPATH}/src`;

	if (!fs.existsSync(outDir)) {
		fs.mkdirSync(outDir);
	}

	const gateway = true;
	const validator = !!argv.v;

	if (argv._[2]) {
		const filename = `proto/gateway/${argv._[2]}.proto`;
		const pfile = `${rootDir}/${filename}`;
		if (!fs.existsSync(pfile)) {
			throw new Error('Bad proto name');
		}
		await singleGenerate({
			filename,
			rootDir,
			outDir,
			gateway,
			validator,
			paths: paths || config.defaultPath,
			mappings: mappings || config.defaultMapping,
		}, tools);
		return;
	}

	// get all proto file
	const protoDir = `${rootDir}/proto/gateway`;
	if (!fs.existsSync(protoDir)) {
		throw new Error('No gateway proto dir');
	}
	const files = fs.readdirSync(protoDir);
	for (let i = 0; i < files.length; i += 1) {
		const filename = `proto/gateway/${files[i]}`;
		const pfile = `${rootDir}/${filename}`;
		const lst = fs.lstatSync(pfile);

		if (lst.isFile() && pfile.endsWith('.proto')) {
			await singleGenerate({
				filename,
				rootDir,
				gateway,
				outDir,
				validator,
				paths: paths || config.defaultPath,
				mappings: mappings || config.defaultMapping,
			}, tools);
		}
	}
};
