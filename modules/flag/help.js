module.exports = async () => {
	console.log(`Usage: gok ${'flag'.green} ${'subcommand'.cyan}`);
	console.log(' Subcommands: (default to list) ');
	console.log(`  ${'add'.cyan} name: Add a new flag argument and re-generate the flags`);
	console.log(`  ${'remove'.cyan} name: Remove a flag argument and re-generate the flags`);
	console.log(`  ${'list'.cyan}: List all arguments`);
	console.log(`  ${'help'.cyan}: this help...`);
	process.exit(0);
};
