const add = require('./add');
const remove = require('./remove');
const list = require('./list');
const help = require('./help');

const submodules = {
	add, help, remove, list,
};

module.exports = async (argv, tools) => {
	if (typeof submodules[argv._[1] || 'list'] === 'function') {
		await submodules[argv._[1] || 'list'](argv, tools);
	} else {
		submodules.help(argv, tools);
	}
};
