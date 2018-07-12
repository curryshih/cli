const fs = require('fs');
const tools = require('../../../tools');

module.exports = (ctx, name, value) => {
	const { GIS } = ctx;
	if (name) {
		if (!value) {
			delete GIS.context.cons[name];
		} else {
			GIS.context.cons[name] = value;
		}
		const conffn = `${process.env.HOME}/.gok/config.yaml`;
		if (!fs.existsSync(conffn)) {
			tools.mkdirp(`${process.env.HOME}/.gok`);
			tools.writeYaml(conffn, { cons: GIS.context.cons });
			return;
		}
		const conf = tools.readYaml(conffn) || {};
		if (!conf.cons) conf.cons = {};
		if (!value) {
			delete conf.cons[name];
		} else {
			conf.cons[name] = value;
		}
		tools.writeYaml(conffn, conf);
	}
};
