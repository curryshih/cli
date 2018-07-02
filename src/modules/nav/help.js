module.exports = async () => {
	console.log(`Usage: gok ${'navigate'.green} ${'subcommand'.cyan}`);
	console.log(' Subcommands: (default to to) ');
	console.log(`  ${'to'.cyan} [name]: Go to root/named service of current project/named project`);
	console.log(`  ${'list [project|service]'.cyan}: List all projects or services, default to projects`);
	console.log(`  ${'setup'.cyan}: Print out setup`);
	console.log(`  ${'help'.cyan}: this help...`);
	process.exit(0);
};
