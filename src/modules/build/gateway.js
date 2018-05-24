const gen = require('./proto/gen');

module.exports = async (argv, tools) => {
	await gen(argv, tools, 'gateway');
};
