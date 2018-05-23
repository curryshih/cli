const fs = require('fs');
const ojp = require('object-path');
const yaml = require('node-yaml');

const singleGenerate = require('./single');
const config = require('./config');

module.exports = async (argv, tools) => {
	if (argv._[2] && !argv._[2].match(tools.regex.name)) {
		throw new Error('Bad proto name');
	}
	const { rootDir, meta } = await tools.getRootMeta();
	const paths = ojp.get(meta, 'config.proto.paths');
	const mappings = ojp.get(meta, 'config.proto.mappings');
	const plugins = ojp.get(meta, 'config.proto.plugins');

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

	const validator = !!argv.v;

	if (argv._[2]) {
		const filename = `proto/${argv._[2]}.proto`;
		const pfile = `${rootDir}/${filename}`;
		if (!fs.existsSync(pfile)) {
			throw new Error('Bad proto name');
		}
		await singleGenerate({
			filename,
			rootDir,
			outDir,
			validator,
			plugins,
			paths: paths || config.defaultPath,
			mappings: mappings || config.defaultMapping,
		}, tools);
		return;
	}

	// get all proto file
	const protoDir = `${rootDir}/proto`;
	if (!fs.existsSync(protoDir)) {
		throw new Error('No proto dir');
	}
	const files = fs.readdirSync(protoDir);
	for (let i = 0; i < files.length; i += 1) {
		const filename = `proto/${files[i]}`;
		const pfile = `${rootDir}/${filename}`;
		const lst = fs.lstatSync(pfile);
		if (lst.isFile() && pfile.endsWith('.proto')) {
			await singleGenerate({
				filename,
				rootDir,
				outDir,
				validator,
				plugins,
				paths: paths || config.defaultPath,
				mappings: mappings || config.defaultMapping,
			}, tools);
		}
	}
};
