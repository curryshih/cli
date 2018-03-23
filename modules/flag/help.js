module.exports = async () => {
	console.log(`Usage: gok ${'flag'.green} ${'subcommand'.cyan}`);
	console.log(' Subcommands: (default to list) ');
	console.log(`  ${'add'.cyan} [name]: Add a new flag argument and re-generate the flag arguments`);
	console.log(`  ${'list'.cyan} [name]: List all or an argument`);
	console.log(`  ${'generate'.cyan} [name]: (re)generate the flag arguments`);
	console.log(`  ${'help'.cyan}: this help...`);
	process.exit(0);
};
