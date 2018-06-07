const w = require('./write');
const d = require('./del');

const submodules = {
	w, d,
};

module.exports = async (argv, tools) => {
	if (typeof submodules[argv._[1]] === 'function') {
		await submodules[argv._[1]](argv, tools);
	} else {
		tools.log.ln('gok yml [wd] -i input -o output key value key value');
		tools.log.ln('  Key examples: a.b.e[+], push in e if e is array');
		tools.log.ln('  Key examples: a.b.0, write in first b, if b is an array');
		tools.log.ln('  Key examples: a.b[c.d].e to write to a[b]["c.d"][e]');
	}
};
