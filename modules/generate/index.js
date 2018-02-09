const project = require('./project');
const proto = require('./proto');
const gateway = require('./gateway');
const help = require('./help');
const service = require('./service');

const submodules = {
	project, proto, help, gateway, service,
};

module.exports = async (argv, tools) => {
	if (typeof submodules[argv._[1]] === 'function') {
		await submodules[argv._[1]](argv, tools);
	} else {
		submodules.help(argv, tools);
	}
};
