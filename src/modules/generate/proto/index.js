const fs = require('fs');
const pascalize = require('pascal-case');

const template = require('./template');

module.exports = async (argv, tools) => {
	const { log } = tools;
	const packageName = argv._[2] || '';
	const fileName = pascalize(packageName).toLowerCase();

	if (!packageName || !fileName.match(tools.regex.name)) {
		log.ln(`protoName ${packageName} should only contain letter and number`);
		log.ln('Example:');
		log.ln(' goodName');
		log.ln(' bad-Name');
		throw new Error('Bad name for a proto');
	}
	const data = { name: packageName };

	const packagePath = argv.p;
	if (packagePath) {
		if (!packagePath.match(tools.regex.path)) {
			throw new Error(`${packagePath} is a bad name for package`);
		}
		data.package = packagePath;
	}

	const { rootDir, meta } = await tools.getRootMeta();
	const confDirs = tools.getConfigDirs(rootDir, meta);
	const pfile = `${rootDir}/${confDirs.proto}/${fileName}.proto`;

	if (fs.existsSync(pfile)) {
		throw new Error(`Proto named ${confDirs.proto}/${fileName}.proto exists.`);
	}

	const protoContent = template(tools, data, meta, confDirs);

	tools.writeFilePath(pfile, protoContent);
	log.ln(`Generated ${pfile.yellow}`);
};
