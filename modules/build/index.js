const proto = require('./proto');
const gateway = require('./gateway');
const service = require('./service');
const help = require('./help');
const validator = require('./validator');

const submodules = {
	proto, gateway, help, service, validator,
};

module.exports = async (argv, tools) => {
	if (typeof submodules[argv._[1]] === 'function') {
		await submodules[argv._[1]](argv, tools);
	} else {
		submodules.help(argv, tools);
	}
};
