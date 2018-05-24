const fs = require('fs');
const ojp = require('object-path');
const yaml = require('node-yaml');

const singleGenerate = require('./single');
const config = require('./config');

const PP = 'config.proto.paths';
const PM = 'config.proto.mappings';
const PG = 'config.proto.genflags';

// target is either proto or gateway
module.exports = async (argv, tools, target) => {
	const { log } = tools;
	const { rootDir, meta } = await tools.getRootMeta();
	const confDirs = tools.getConfigDirs(rootDir, meta);
	if (!fs.existsSync(`${rootDir}${tools.slashDir(confDirs.bin)}/proto`)) {
		throw new Error(`Please install plugins to generate, run ${'gok doctor'.yellow} for helpds`);
	}
	let plugins = tools.getPluginBins(rootDir, confDirs) || [];

	let paths = ojp.get(meta, PP, config.defaultPath);
	let mappings = ojp.get(meta, PM, config.defaultMapping);
	const generators = ojp.get(meta, PG, config.defaultGenflags);
	const genflags = ojp.get(generators, target, {});

	if (!ojp.has(meta, PP) || !ojp.has(meta, PM) || !ojp.has(meta, PG)) {
		ojp.set(meta, PP, paths);
		ojp.set(meta, PM, mappings);
		ojp.set(meta, PG, generators);
		yaml.writeSync(`${rootDir}/root.yaml`, meta);
	}

	paths = config.buildPath(paths);
	mappings = config.buildMapping(mappings);
	plugins = config.buildPlugin(plugins);

	if (!fs.existsSync(process.env.GOPATH)) {
		throw new Error('GOPATH does not exist');
	}
	const outDir = `${process.env.GOPATH}/src`;
	if (!fs.existsSync(outDir)) {
		fs.mkdirSync(outDir);
	}

	if (argv._[2]) {
		for (let i = 2; i < argv._.length; i += 1) {
			const filename = `${confDirs[target]}/${argv._[i]}.proto`;
			const pfile = `${rootDir}/${filename}`;
			if (!fs.existsSync(pfile)) {
				log.ln(`Bad proto name ${filename}`.yellow);
				continue;
			}
			await singleGenerate({
				confDirs,
				filename,
				rootDir,
				outDir,
				target,
				plugins,
				paths,
				mappings,
			}, genflags, argv, tools);
		}
		return;
	}

	// get all proto file
	const protoDir = `${rootDir}/${confDirs[target]}`;
	if (!fs.existsSync(protoDir)) {
		throw new Error(`Proto dir ${protoDir} does not exist`);
	}
	const files = fs.readdirSync(protoDir);
	for (let i = 0; i < files.length; i += 1) {
		const filename = `${confDirs[target]}/${files[i]}`;
		const pfile = `${rootDir}/${filename}`;
		const lst = fs.lstatSync(pfile);
		if (lst.isFile() && pfile.endsWith('.proto')) {
			await singleGenerate({
				confDirs,
				filename,
				rootDir,
				target,
				outDir,
				plugins,
				paths,
				mappings,
			}, genflags, argv, tools);
		}
	}
};
