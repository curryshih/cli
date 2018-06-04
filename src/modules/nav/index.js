const to = require('./to');
const setup = require('./setup');
const help = require('./help');
const project = require('./project');

const submodules = {
	to, help, setup, project,
};

module.exports = async (argv, tools) => {
	if (typeof submodules[argv._[1] || 'to'] === 'function') {
		await submodules[argv._[1] || 'to'](argv, tools);
	} else {
		submodules.help(argv, tools);
	}
};
