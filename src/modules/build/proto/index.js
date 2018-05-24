const gen = require('./gen');

module.exports = async (argv, tools) => {
	await gen(argv, tools, 'proto');
};
