module.exports = async (data, genflags, argv, tools) => {
	const { log } = tools;
	const { confDirs, target } = data;

	let command = `protoc -I${confDirs[data.target]} ${data.paths} ${data.plugins}`;

	const { required, optional } = genflags;

	(required || []).forEach((param) => {
		const cmd = tools.template(param, data);
		command = `${command} ${cmd}`;
	});

	Object.keys(argv || {}).forEach((f) => {
		if (argv[f]) {
			const cmd = tools.template(optional[f], data);
			command = `${command} ${cmd}`;
		}
	});
	log.l(`Generating ${target} source for ${data.filename}... `);

	command = `${command} ${data.filename}`;
	if (process.env.GOK_VERBOSE) console.log(command);

	try {
		tools.process.execSync(command, { cwd: data.rootDir, stdio: ['pipe', 'pipe', process.stderr] }).toString().replace('v', '').trim();
		log.ln(` done ${'OK'.green}`);
	} catch (err) {
		log.ln('Please check your proto and try again'.red);
		throw new Error('Can not build proto');
	}
};

