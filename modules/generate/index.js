const project = require('./project');
const help = require('./help');

const submodules = { project, help };

module.exports = async (argv, tools) => {
	if (typeof submodules[argv._[1]] === 'function') {
		await submodules[argv._[1]](argv, tools);
	} else {
		submodules.help(argv, tools);
	}
};
