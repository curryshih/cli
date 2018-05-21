const dotask = require('./do');
const help = require('./help');

const submodules = {
	help,
	do: dotask,
};

module.exports = async (argv, tools) => {
	if (typeof submodules[argv._[0]] === 'function') {
		await submodules[argv._[0]](argv, tools);
	} else {
		submodules.help(argv, tools);
	}
};
