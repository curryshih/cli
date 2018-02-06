module.exports = async (argv, tools) => {
	const { log } = tools;
	// Check root package
	const rootPackage = argv._[2];
	if (!rootPackage || !rootPackage.match(/^[a-z]([a-z0-9_.-]+\/{0,1})+[a-z]+[a-z0-9]*$/)) {
		log.ln(`rootPackage ${rootPackage} should start with letter`);
		log.ln('Example:');
		log.ln(' good/example/package');
		log.ln(' bad//package');
		throw new Error('Bad root package for a project');
	}

	// Check go path
	const goPath = process.env.GOPATH;
	if (!goPath || goPath === '') {
		throw new Error('Expect GOPATH is set in your environment');
	}

	// Cloning
	const rootPath = `${goPath}/src/${rootPackage}`;
	let stopWaiting = tools.log.waiter(`Cloning vectors into ${rootPath.yellow}... `);
	try {
		tools.process.execSync(`git clone git@github.com:gokums/boiler.git ${rootPath}`, { stdio: ['pipe', 'pipe', 'ignore'] }).toString().replace('v', '').trim();
		stopWaiting('done');
	} catch (err) {
		stopWaiting(` ${'NG'.red}: ${err.toString()}`);
		throw new Error('Can not clone...');
	}

	stopWaiting = tools.log.waiter('Mending broken relations... ');
	try {
		tools.process.execSync('dep ensure', { cwd: rootPath, stdio: ['pipe', 'pipe', 'ignore'] }).toString().replace('v', '').trim();
		stopWaiting('done');
	} catch (err) {
		stopWaiting(` ${'NG'.red}: ${err.toString()}`);
		throw new Error('Can not ensure dependency...');
	}

	stopWaiting = tools.log.waiter('Furnishing meta...');
	try {
		const metadata = {
			project: 'gokums-sample',
			package: rootPackage,
			createdAt: new Date(),
		};
		console.log(metadata);
	} catch (err) {
		stopWaiting(` ${'NG'.red}: ${err.toString()}`);
		throw new Error('Can not generate metadata...');
	}

	stopWaiting = tools.log.waiter('Cleaning kitchen sink... ');
	try {
		tools.process.execSync(`rm -rf ${rootPath}/.git`, { stdio: ['pipe', 'pipe', 'ignore'] }).toString().replace('v', '').trim();
		stopWaiting('done');
	} catch (err) {
		stopWaiting(` ${'NG'.red}: ${err.toString()}`);
		throw new Error('Can not clean up...');
	}
};
