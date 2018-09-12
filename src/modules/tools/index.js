const httptunnel = require('./http_tunnel');

const submodules = {
	httptunnel,
};

module.exports = async (argv, tools) => {
	if (typeof submodules[argv._[1]] === 'function') {
		await submodules[argv._[1]](argv, tools);
	} else {
		tools.log.ln('gok tools name');
		tools.log.ln('  Tools:');
		tools.log.ln('  	httptunnel: Allow you to tunnel to http and log request');
	}
};
