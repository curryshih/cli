const tools = require('../../../tools');

const generators = {};

module.exports = {
	next(num) {
		if (generators[num]) return generators[num].next().value;
		generators[num] = tools.generator(num);
		return num;
	},
};
