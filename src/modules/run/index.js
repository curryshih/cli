const ojp = require('object-path');
const _ = require('underscore');
const deepExtend = require('deep-extend');
const dep = require('./lib/dep');
const tplTools = require('../../tpltools');
const wait = require('./lib/wait');
const logx = require('./lib/logx');
const tools = require('../../tools');
const repl = require('repl');
const checkStep = require('../task/lib/checkStep');

const tplServices = {};
let Services;
let RootManifest;
const replOpts = {
	ignoreUndefined: true,
	replMode: repl.REPL_MODE_MAGIC,
	prompt: '> ',
};

async function restartProcess(svcName) {
	const {
		runTask, options, theMeta, proc, prelog,
	} = Services[svcName].process || {};
	if (!runTask) throw new Error(`Run task service ${svcName} does not exit!`);
	if (proc) {
		console.log(`${prelog}[${svcName.green}]: Killing running ${svcName.green}...`.cyan);
		proc.kill();
		await wait(1);
	}

	const { steps } = runTask;
	if (!steps || steps.length < 1) throw new Error(`Run steps for service ${svcName} does not exit!`);

	const checkedSteps = [];
	for (let i = 0; i < steps.length; i += 1) {
		const { runable, name, cmd } = await checkStep(steps[i], theMeta);
		if (runable) {
			checkedSteps.push({ name, cmd });
		}
	}

	for (let i = 0; i < checkedSteps.length; i += 1) {
		const { name, cmd } = checkedSteps[i];
		if (i === checkedSteps.length - 1) {
			console.log(`${prelog}[${svcName.green}]: Spawning child process`.cyan);
			console.log(`${prelog}[${svcName.green}]: About to run: ${(name || cmd).cyan}`);

			const args = cmd.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g);
			const bin = args.shift();
			const childprocess = tools.process.spawn(bin, args, options);
			childprocess.stdout.on('data', data => logx(`${prelog}>>> LOG: ${svcName}:`.cyan, data));
			childprocess.stderr.on('data', data => logx(`${prelog}>>> ERROR: ${svcName}:`.red, data));
			childprocess.on('exit', code => console.log(`${prelog}>>> STERM: ${svcName}: Process exit: CODE: ${(code || 'Unknown').toString()}`.red));
			childprocess.on('error', err => console.log(`>>> SYSERR: ${err}`.red));
			Services[svcName].process.proc = childprocess;
		} else {
			console.log(`${prelog}[${svcName.green}]: About to run: ${(name || cmd).cyan}`);
			await tools.process.execPromise(cmd, options);
		}
	}

	return wait(0.3);
}

async function startProcess(name, argv, gitSHA, prelog = '') {
	const { svcDir, manifest } = Services[name];
	console.log(`${prelog}[${name.green}]: Creating process wrapper`.cyan);

	const theMeta =
		tplTools.tplMeta(argv, RootManifest.rootDir, RootManifest.meta, svcDir, manifest, gitSHA);

	theMeta.refs = tplServices;

	// Template vars
	const { vars } = theMeta;
	console.log(`${prelog}[${name.green}]: Proceed with vars: ${tools.inspect(vars).cyan}`);
	tplServices[name] = { vars };

	const rootRunTask = ojp.get(RootManifest.meta, 'metadata.tasks.run', {});
	const svcRunTask = ojp.get(manifest, 'metadata.tasks.run', {});
	const runTask = deepExtend(rootRunTask, svcRunTask);

	const options = {
		stdio: ['pipe', 'pipe', 'pipe'],
		cwd: svcDir,
		shell: true,
		env: { ...process.env, ...runTask.env },
	};
	Services[name].process = {
		runTask,
		options,
		theMeta,
		prelog,
	};
	await restartProcess(name);
}

module.exports = async (argv) => {
	let runSvcs = [];
	if (argv._.length < 2) {
		const { manifest } = tools.getServiceManifest();
		runSvcs = [ojp.get(manifest, 'service.name', [])];
		if (!runSvcs.length === 0) {
			throw new Error('Please provide svcName');
		}
	} else {
		for (let i = 1; i < argv._.length; i += 1) {
			runSvcs.push(argv._[i]);
		}
	}
	tools.log.ln('NOTE: Run is still in beta test!'.yellow);

	RootManifest = await tools.getRootMeta();
	const { rootDir, meta } = RootManifest;
	if (!rootDir) throw new Error('Must be in a GOKUMS project to run this command');

	const confDirs = tools.getConfigDirs(rootDir, meta);
	const allSvcs = await tools.findServices(rootDir, confDirs);
	runSvcs = runSvcs.map((svcName) => {
		const foundServices = Object.keys(allSvcs).filter(s => s.indexOf(svcName) >= 0);
		if (foundServices.length === 0) {
			throw new Error(`Can not find a service with named ${svcName}`);
		}
		if (foundServices.length > 1) {
			throw new Error(`Found at least two services: ${foundServices[0]}, ${foundServices[1]}...`);
		}
		return foundServices[0];
	});

	const { svcGraph, services } = dep.build(meta, allSvcs);
	const startOrders = dep.getStartOrders(svcGraph, runSvcs);
	const startOrderSvcs = Object.keys(startOrders);
	startOrderSvcs.forEach((svc) => {
		const order = startOrders[svc];
		if (order.cycle) {
			console.log(`Service ${svc} can not run due to cyclic dependency, please check: \n${order.cycle.join(',').yellow}`);
			throw new Error('Cyclic dependency');
		}
	});

	const shell = true;
	const gitSHA = tools.process.execSync('git rev-parse --short HEAD', { cwd: rootDir, shell });
	Services = services;

	let prelog = '';
	const pmsf = sname => startProcess(sname, argv, gitSHA, prelog);

	for (let i = 0; i < startOrderSvcs.length; i += 1) {
		const svc = startOrderSvcs[i];
		console.log(`Starting ${svc.yellow}...`);
		const order = startOrders[svc];
		prelog = '';
		for (let j = 0; j < order.steps.length; j += 1) {
			prelog = `${prelog}  `;
			const processes = _(order.steps[j]).map(pmsf);
			await Promise.all(processes);
		}
	}

	const rs = repl.start(replOpts);
	_.each(Services, (serv, name) => {
		if (!serv.run) return;
		rs.defineCommand(`kill_${name}`, {
			help: `Killing service ${name}`,
			action() {
				if (!serv.run) return;
				if (serv.run.proc) {
					serv.run.proc.kill();
				}
				this.displayPrompt();
			},
		});
		rs.defineCommand(`restart_${name}`, {
			help: `Restart service ${name}`,
			action() {
				restartProcess(name);
			},
		});
	});
};
