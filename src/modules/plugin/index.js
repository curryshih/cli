const help = require('./help');
const add = require('./add');
const list = require('./list');

const submodules = {
	help, list, add,
};

module.exports = async (argv, tools) => {
	if (typeof submodules[argv._[1] || 'list'] === 'function') {
		await submodules[argv._[1] || 'list'](argv, tools);
	} else {
		submodules.help(argv, tools);
	}
};
