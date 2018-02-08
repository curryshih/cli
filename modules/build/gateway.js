const fs = require('fs');
const singleGenerate = require('./proto/single');

module.exports = async (argv, tools) => {
	if (argv._[2] && !argv._[2].match(tools.regex.name)) {
		throw new Error('Bad proto name');
	}
	const { rootDir, meta } = await tools.getRootMeta();
	if (!fs.existsSync(process.env.GOPATH)) {
		throw new Error('GOPATH does not exist');
	}
	const outDir = `${process.env.GOPATH}/src`;
	if (!fs.existsSync(outDir)) {
		fs.mkdirSync(outDir);
	}

	const gateway = true;

	if (argv._[2]) {
		const filename = `proto/gateway/${argv._[2]}.proto`;
		const pfile = `${rootDir}/${filename}`;
		if (!fs.existsSync(pfile)) {
			throw new Error('Bad proto name');
		}
		await singleGenerate({
			filename, rootDir, outDir, gateway,
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

		// Need to build outDir
		const gwOutdir = `${outDir}/${meta.package}/src/proto`;
		tools.mkdirp(gwOutdir);

		if (lst.isFile() && pfile.endsWith('.proto')) {
			await singleGenerate({
				filename, rootDir, gateway, outDir, gwOutdir,
			}, tools);
		}
	}
};
