const to = require('./to');
const setup = require('./setup');
const help = require('./help');

const submodules = {
	to, help, setup,
};

module.exports = async (argv, tools) => {
	if (typeof submodules[argv._[1] || 'to'] === 'function') {
		await submodules[argv._[1] || 'to'](argv, tools);
	} else {
		submodules.help(argv, tools);
	}
};
