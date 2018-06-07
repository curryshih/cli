const yaml = require('node-yaml');
const path = require('path');
const ojp = require('object-path');
const { parseKey } = require('./key');

module.exports = async (argv) => {
	if (!argv.i || !argv.o) throw new Error('Require io file, ex: gok yaml -i input.yaml -o output.yaml key value');
	const fname = path.resolve(argv.i);
	let yml = null;
	try {
		yml = yaml.readSync(fname);
	} catch (e) {
		throw new Error(`${argv.i} does not exist or not a valid yaml file.`);
	}
	for (let i = 2; i < argv._.length; i += 2) {
		if (argv._[i] && argv._[i + 1]) {
			const keys = parseKey(argv._[i]);
			if (keys[keys.length - 1] === '+') {
				keys.pop();
				ojp.push(yml, keys, argv._[i + 1]);
				continue;
			}
			ojp.set(yml, keys, argv._[i + 1]);
		}
	}
	const ofname = path.resolve(argv.o);
	yaml.writeSync(ofname, yml);
};
