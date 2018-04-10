const add = require('./add');
const remove = require('./remove');
const list = require('./list');
const help = require('./help');
const spawn = require('./spawn');

const submodules = {
	add, help, remove, list, spawn,
};

module.exports = async (argv, tools) => {
	if (typeof submodules[argv._[1] || 'list'] === 'function') {
		await submodules[argv._[1] || 'list'](argv, tools);
	} else {
		submodules.help(argv, tools);
	}
};
