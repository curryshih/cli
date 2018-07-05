const tools = require('../../../tools');

module.exports = async (step, meta) => {
	if (!step) return { runable: false };
	const { when, name, cmd } = step;
	if (!cmd) return { runable: false };
	let runable = true;
	if (when !== undefined) {
		if (typeof (when) === 'string') {
			runable = !!tools.template(when, meta);
		} else if (typeof when === 'object' && Array.isArray(when)) {
			runable = when.every(w => !!tools.template(w, meta));
		}
	}
	if (!runable) return { runable, name };
	let cmdTpl = cmd;
	if (Array.isArray(cmd)) cmdTpl = cmd.join(' ');
	const stepCmd = tools.template(cmdTpl, meta);
	return { runable, name, cmd: stepCmd };
};
