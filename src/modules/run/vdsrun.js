/* eslint-disable */

const _ = require('underscore');
const util = require('util');
const minimist = require('minimist');
const yaml = require('js-yaml');
const objPath = require('object-path');
const path = require('path');
const inquirer = require('inquirer');
const repl = require('repl');
const os = require('os');
require('colors');

const exec = util.promisify(require('child_process').exec);
const { spawn, spawnSync } = require('child_process');
const readFile = util.promisify(require('fs').readFile);
const argv = minimist(process.argv.slice(2));

// Globalvars
const Services = {};
const StartedServices = {};
const replOpts = {
  ignoreUndefined: true,
  replMode: repl.REPL_MODE_MAGIC,
  prompt: "> ",
};

if (argv._.length < 1) {
  console.log("Usage: vdsrun servicename1 servicename2");
  console.log("  Example: vdsrun vdsmixer -s local");
  console.log("  Example: vdsrun vdsmixer -s select");
  process.exit(0);
}

async function findServices() {
  const { stdout, stderr } = await exec(`find . -type f -name manifest.yaml`);
  const files = stdout.split('\n').filter((f) => !_.isEmpty(f));
  const fbufs = await (Promise.all(files.map((fname) => {
    return readFile(fname).then((buf) => {
      return { fname, buf };
    });
  })));

  fbufs.forEach((fbuf) => {
    const manifest = yaml.load(fbuf.buf);
    const name = objPath.get(manifest, 'service.name');
    const runnability = objPath.get(manifest, 'runnability')
    const service = objPath.get(manifest, 'service')
    if (!_.isEmpty(name) && !_.isEmpty(runnability)) {
      Services[name] = { runnability, fname: fbuf.fname, service };
    }
  })
}

async function wait(msec) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), msec * 1000);
  });
}

async function restartProcess(name) {
  const { run, build } = Services[name]
  if (!run) throw new Error(`Run Schema for service ${name} does not exit!`);
  const { schema, proc } = run
  if (proc) {
    proc.kill();
    await wait(1);
  }

  const { cmds, cwd } = build;
  const shell = true;

  console.log(`[RUNTIME]: ${name.green}: building...`.cyan);
  for (var i = 0; i < cmds.length; i++) {
    console.log(`  [RUNTIME] ${name.green}: Running: ${cmds[i]}`.cyan);
    const bres = spawnSync(cmds[i], [], { cwd, shell });
    if (!_.isEmpty(bres.stderr)) throw new Error(`${name} Error: ${cmds[i]}: ${bres.stderr}`);
  }

  const { cmd, args, options } = schema;
  console.log(`[RUNTIME]: ${name.green}: Spawning child process`.cyan)
  const xoptions = Object.assign({ cwd, shell }, options || {});
  const childprocess = spawn(cmd, args, xoptions);
  const logx = (prefix, data) => {
    try {
      const lines = (data.toString() || "").split(os.EOL);
      console.log(prefix);
      lines.forEach((line) => {
        try {
          const obj = JSON.parse(line);
          if (obj.sourceLocation) {
            obj.caller = `${obj.caller}#${obj.sourceLocation.functionName}`
            delete obj.sourceLocation;
          }
          delete obj.serviceContext;
          delete obj.context;
          if (obj.severity) {
            obj.message = `${obj.severity} ${obj.message}`;
            delete obj.severity;
          }
          delete obj.eventTime;

          if (obj.caller.indexOf("log/log.go:") === 0) {
            return console.log(obj.message);
          }

          return console.log(util.inspect(obj, false, null));
        } catch (e) {
          return console.log(line);
        }
      });
    } catch (e) {
      return console.log(`${prefix}${data}`);
    }
  }
  childprocess.stdout.on('data', (data) => logx(`>>> LOG: ${name}:`.cyan, data));
  childprocess.stderr.on('data', (data) => logx(`>>> ERROR: ${name}:`.red, data));
  childprocess.on('exit', (code) => console.log(`>>> STERM: ${name}: Process exit: CODE: ${(code || "Unknown").toString()}`.red));
  childprocess.on('error', (err) => console.log(`>>> SYSERR: ${err}`.red));
  Services[name].run.proc = childprocess;
  return wait(0.3);
}

async function startProcess(name, prelog = "") {
  if (_.isEmpty(name) || !Services[name]) throw new Error(`Runnability for service ${name} does not exit! ${'Check your current folder!'.red}`);
  StartedServices[name] = true;
  const { runnability, fname, service } = Services[name]
  if (Services[name].run) return;
  const { depends, vars, schemas } = runnability
  if (depends) {
    console.log(`${prelog}${name}:, start depending services...`.green)
    for (var i = 0; i < depends.length; i++) {
      if (StartedServices[depends[i]]) {
        console.log(`  ${prelog}${name}: Service started, ignore ${depends[i].yellow}...`.gray)
      } else {
        console.log(`  ${prelog}${name}:, start dependant ${depends[i].yellow}...`)
        await startProcess(depends[i], `${prelog}  `);
      }
    }
  }
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

async function start() {
  await findServices();
  for (var i = 0; i < argv._.length; i++) {
    await startProcess(argv._[i])
  }
}

start().then(() => {
  rs = repl.start(replOpts);
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
      }
    });
    rs.defineCommand(`restart_${name}`, {
      help: `Restart service ${name}`,
      action() {
        restartProcess(name);
      }
    });
  });

}).catch((err) => {
  console.log('Error'.red);
  console.log(err);
  process.exit(1);
})
