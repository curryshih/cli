const run = require('./run');
const pull = require('./pull');
const help = require('./help');

const submodules = {
	help, run, pull,
};

module.exports = async (argv, tools) => {
	if (typeof submodules[argv._[1]] === 'function') {
		await submodules[argv._[1]](argv, tools);
	} else {
		submodules.help(argv, tools);
	}
};
