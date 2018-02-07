const fs = require('fs');
const singleGenerate = require('./single');

module.exports = async (argv, tools) => {
	if (argv._[2] && !argv._[2].match(tools.regex.name)) {
		throw new Error('Bad proto name');
	}
	const { rootDir } = await tools.getRootMeta();
	if (!fs.existsSync(process.env.GOPATH)) {
		throw new Error('GOPATH does not exist');
	}
	const outDir = `${process.env.GOPATH}/src`;
	if (!fs.existsSync(outDir)) {
		fs.mkdirSync(outDir);
	}

	if (argv._[2]) {
		const filename = `proto/${argv._[2]}.proto`;
		const pfile = `${rootDir}/${filename}`;
		if (!fs.existsSync(pfile)) {
			throw new Error('Bad proto name');
		}
		await singleGenerate({ filename, rootDir, outDir }, tools);
		return;
	}

	// get all proto file
	const files = fs.readdirSync(`${rootDir}/proto`);
	for (let i = 0; i < files.length; i += 1) {
		const filename = `proto/${files[i]}`;
		const pfile = `${rootDir}/${filename}`;
		const lst = fs.lstatSync(pfile);
		if (lst.isFile() && pfile.endsWith('.proto')) {
			await singleGenerate({ filename, rootDir, outDir }, tools);
		}
	}
};
