const ojp = require('object-path');
const _ = require('underscore');
const os = require('os');
const dep = require('./lib/dep');
const tplTools = require('./lib/tpltools');
const wait = require('./lib/wait');
const logx = require('./lib/logx');
const tools = require('../../tools');
const repl = require('repl');

const tplServices = {};
let Services;
const replOpts = {
	ignoreUndefined: true,
	replMode: repl.REPL_MODE_MAGIC,
	prompt: '> ',
};

async function restartProcess(name) {
	const { run, build } = Services[name].process || {};
	if (!run) throw new Error(`Run Schema for service ${name} does not exit!`);
	const { proc } = run;
	if (proc) {
		console.log(`[RUNTIME]: Killing running ${name.green}...`.cyan);
		proc.kill();
		await wait(1);
	}

	const shell = true;

	console.log(`[RUNTIME]: ${name.green}: building...`.cyan);
	console.log(`  [RUNTIME] ${name.green}: Running: ${build.cmd}`.cyan);
	const bres = tools.process.spawnSync(build.cmd, [], { cwd: build.cwd, shell });
	if (!_.isEmpty(bres.stderr)) throw new Error(`${name} Error: ${build.cmd}: ${bres.stderr}`);

	const { cmd, args, options } = run;
	console.log(`[RUNTIME]: ${name.green}: Spawning child process`.cyan);
	const xoptions = Object.assign({ cwd: build.cwd, shell }, options || {});
	const childprocess = tools.process.spawn(cmd, args, xoptions);

	childprocess.stdout.on('data', data => logx(`>>> LOG: ${name}:`.cyan, data));
	childprocess.stderr.on('data', data => logx(`>>> ERROR: ${name}:`.red, data));
	childprocess.on('exit', code => console.log(`>>> STERM: ${name}: Process exit: CODE: ${(code || 'Unknown').toString()}`.red));
	childprocess.on('error', err => console.log(`>>> SYSERR: ${err}`.red));
	Services[name].process.run.proc = childprocess;
	return wait(0.3);
}

async function startProcess(name, argv, prelog = '') {
	const { svcDir, manifest } = Services[name];
	const runSchema = ojp.get(manifest, 'metadata.tasks.run.schema.default');
	if (!runSchema) throw new Error(`${prelog}${name.green}: schema default does not exist`);
	const cwd = svcDir;
	const build = { cmd: runSchema.build || true, cwd };
	if (runSchema.build === true) {
		build.cmd = `gok build service ${name}`;
	}
	console.log(`  ${prelog}${name.green}: Creating process wrapper`.cyan);
	const { flags, service } = tplServices[name];
	let { vars } = tplServices[name];
	const tplObj = {
		argv,
		service,
		os,
		flag: flags,
		vars,
		refs: tplServices,
		tools: tplTools,
	};
	// Template vars
	vars = tools.deepTemplate(vars, tplObj);
	console.log(`  ${prelog}${name.green}: Proceed with vars: ${tools.inspect(vars).cyan}`);
	tplServices[name].vars = vars;
	tplObj.vars = vars;

	let cmd = runSchema.cmd || `./build/${name}`;
	cmd = tools.template(cmd, tplObj);
	// templating args
	let args = runSchema.args || [];
	args = args.map(ag => tools.template(ag, tplObj));

	const options = runSchema.options || {};
	options.cwd = cwd;
	// Env
	options.env = { ...process.env, ...options.env }; // Copy from parent
	Services[name].process = {
		build,
		run: { cmd, args, options },
	};
	await restartProcess(name);
}

module.exports = async (argv) => {
	let svcName = argv._[1];
	if (!svcName) {
		const { manifest } = tools.getServiceManifest();
		svcName = ojp.get(manifest, 'service.name');
		if (!svcName) {
			throw new Error('Please provide svcName');
		}
	}
	tools.log.ln('NOTE: Run is still in beta test!'.yellow);

	const { rootDir, meta } = await tools.getRootMeta();
	const svcs = await tools.findServices(rootDir);
	const foundServices = Object.keys(svcs).filter(s => s.indexOf(svcName) >= 0);
	if (foundServices.length === 0) {
		throw new Error(`Can not find a service with named ${svcName}`);
	}
	if (foundServices.length > 1) {
		throw new Error(`Found at least two services: ${foundServices[0]}, ${foundServices[1]}...`);
	}
	// const { svcDir, manifest } = services[foundServices[0]];
	const { deps, services } = dep.build(meta, svcs, foundServices[0]);
	Services = services;
	_(services).each((val, key) => {
		tplServices[key] = {
			service: ojp.get(val, 'manifest.service'),
			vars: ojp.get(val, 'manifest.metadata.tasks.run.vars'),
			flags: ojp.get(val, 'manifest.metadata.flags'),
		};
	});
	let prelog = '';
	const pmsf = sname => startProcess(sname, argv, prelog);
	for (let i = 0; i < deps.length; i += 1) {
		prelog = `${prelog}  `;
		const processes = _(deps[i]).map(pmsf);
		await Promise.all(processes);
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
