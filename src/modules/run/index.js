const ojp = require('object-path');
const deepExtend = require('deep-extend');
const util = require('util');

const Services = {};

function buildDependency(rootManifest, services, startName) {
	const depHash = {};
	const chkList = [startName];
	while (chkList.length > 0) {
		const svcName = chkList.shift();
		// If already checked
		if (depHash[svcName]) continue;

		const rootMeta = { metadata: rootManifest.metadata };

		const svc = services[svcName];
		if (!svc) throw Error(`Missing service ${svcName}`);

		const mergedManifest = deepExtend(rootMeta, svc.manifest);
		Services[svcName] = {
			svcDir: svc.svcDir,
			manifest: mergedManifest,
		};
		const depSvcs = ojp.get(mergedManifest, 'metadata.tasks.run.deps') || [];
		depHash[svcName] = {};
		depSvcs.forEach((s) => {
			depHash[svcName][s] = true;
			// Ignore if checked
			if (depHash[s]) return;
			chkList.push(s);
		});
	}
	const deps = [];
	let keys = Object.keys(depHash);
	while (keys.length > 0) {
		const nodep = keys.filter(s => Object.keys(depHash[s]).length === 0);
		if (nodep.length === 0) throw new Error('Circular depenency detected, please decouple it ');
		deps.push(nodep);
		for (let i = 0; i < nodep.length; i += 1) {
			for (let j = 0; j < keys.length; j += 1) {
				delete depHash[keys[j]][nodep[i]];
			}
			delete depHash[nodep[i]];
		}
		keys = Object.keys(depHash);
	}
	return deps;
}

/* eslint-disable */
async function startProcess(name, prelog = "") {
  const { svcDir, manifest } = Services[name];
  if (_.isEmpty(schemas)) throw new Error(`Runnability schema for service ${name} does not exist!`);
  let runSchema;
  const schemaKeys = Object.keys(schemas)
  let selAnswer = schemaKeys[0];
  const asked = (argv.a || "").split(",").indexOf(name) >= 0;
  if (schemaKeys.length > 1) {
    if (!asked && !argv.s && schemas.default) {
      selAnswer = 'default';
    } else if (!asked && argv.s && schemas[argv.s]) {
      selAnswer = argv.s;
    } else {
      const answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'schema',
          message: `Select schema for service ${name.yellow}:`,
          choices: Object.keys(schemas)
        }
      ]);
      selAnswer = answers.schema;
    }
  }
  runSchema = schemas[selAnswer];
  if (!runSchema) throw new Error(`${prelog}${name.green}: schema ${selAnswer} does not exist`);
  console.log(`${prelog}${name.green}: starting schema ${selAnswer.yellow}...`.cyan);
  const cwd = path.dirname(path.resolve(fname));
  const shell = true;

  const { run } = runSchema;
  const build = { cmds: runSchema.build || [], cwd }
  console.log(`  ${prelog}${name.green}: Creating process wrapper for service ${name.yellow} in ${path.dirname(fname).yellow}`.cyan);

  // Template vars
  _.each(vars, (val, key) => {
    vars[key] = _.template(val)({argv, service, Services, os})
    console.log(`    ${prelog}${name.green}: - With vars ${key.yellow} is ${vars[key].bgWhite.black}`.grey);
  });

  // templating cmd
  const tplOj = {argv, service, vars, Services};
  let cmd = run.cmd || "";
  cmd = _.template(cmd)(tplOj);

  // templating args
  let args = run.args || [];
  args = args.map((ag) => _.template(ag)(tplOj))

  const options = run.options || {};
  options.cwd = cwd;

  // Env
  let oEnv = _.extend({}, process.env); //Copy from parent
  oEnv = _.extend(oEnv, options.env || {});
  options.env = oEnv;
  Services[name].run = { schema: { cmd, args, options } };
  Services[name].build = build;
  await restartProcess(name);
}

/* eslint-enable */

module.exports = async (argv, tools) => {
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
	const services = await tools.findServices(rootDir);
	const foundServices = Object.keys(services).filter(s => s.indexOf(svcName) >= 0);
	if (foundServices.length === 0) {
		throw new Error(`Can not find a service with named ${svcName}`);
	}
	if (foundServices.length > 1) {
		throw new Error(`Found at least two services: ${foundServices[0]}, ${foundServices[1]}...`);
	}
	// const { svcDir, manifest } = services[foundServices[0]];
	const deps = buildDependency(meta, services, foundServices[0]);
	console.log(deps);
	console.log(util.inspect(Services, false, null));
};
