const path = require('path');
const ojp = require('object-path');
const { parseKey } = require('./key');

module.exports = async (argv, tools) => {
	if (!argv.i || !argv.o) throw new Error('Require io file, ex: gok yaml d -i input.yaml -o output.yaml key');
	const fname = path.resolve(argv.i);
	let yml = null;
	try {
		yml = tools.readYaml(fname);
	} catch (e) {
		throw new Error(`${argv.i} does not exist or not a valid yaml file.`);
	}
	for (let i = 2; i < argv._.length; i += 1) {
		if (argv._[i]) {
			const keys = parseKey(argv._[i]);
			if (keys[keys.length - 1] === '+') {
				keys.pop();
			}
			ojp.del(yml, keys);
		}
	}
	const ofname = path.resolve(argv.o);
	tools.writeYaml(ofname, yml);
};
