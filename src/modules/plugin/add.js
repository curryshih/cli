const ojp = require('object-path');
const fs = require('fs');

module.exports = async (argv, tools) => {
	const { log } = tools;

	try {
		const { rootDir, meta } = await tools.getRootMeta();
		if (!rootDir) {
			log.ln('You need to be in a project folder to perform this');
			throw new Error('Bad folder');
		}

		const plug = argv._[2];

		if (!plug) {
			log.ln(`You need to provide a package name, i.e. ${'gok plugin add github.com/golang.com/protobuf/protoc-gen-go'.yellow}`);
			throw new Error('Bad package name');
		}
		const plugins = tools.getPlugins(rootDir, meta);

		const cwd = `${rootDir}/vendor/${plug}`;
		if (!fs.existsSync(cwd)) {
			log.ln('This plugin does not exist in vendor yet');
			log.ln(`Please check directory ${cwd.yellow}`);
			log.ln(`You can fix by add it to vendor yourself, or run ${'dep ensure -add'.yellow} ${plug.yellow}`);
			log.ln();
			throw new Error('Not vendored package!');
		}

		let newPlug = true;
		if (plugins.indexOf(plug) >= 0) {
			newPlug = false;
			log.l(`Plugin ${plug.yellow} got built once, rebuilding it...`);
		} else {
			log.l(`Building plugin ${plug.yellow}...`);
		}

		// @ Install plugin
		const confDirs = tools.getConfigDirs(rootDir, meta);
		const binDir = `${rootDir}${tools.slashDir(confDirs.bin)}/proto`;
		let { binname } = argv;
		if (!binname) {
			const pls = plug.split('/');
			binname = pls[pls.length - 1];
		}
		tools.mkdirp(binDir);
		const cmd = `go build -i -o "${binDir}/${binname}"`;
		tools.process.execSync(cmd, { cwd, stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();
		log.ln(' Done'.green);

		if (newPlug) {
			plugins.push(plug);
			ojp.set(meta, 'config.proto.plugins', plugins);
			tools.writeYaml(`${rootDir}/root.yaml`, meta);
		}
	} catch (e) {
		if (process.env.GOKUMS_VERBOSE) console.log(e.stack);
		throw e;
	}
};
