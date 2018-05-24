module.exports = async () => {
	console.log(`Usage: gok ${'plugin'.green} ${'subcommand'.cyan}`);
	console.log(' Subcommands: (default to list) ');
	console.log(`  ${'add'.cyan} path -binname: add new plugin`);
	console.log('    If the name of the path is different from the package, please provide the -binname');
	console.log(`  ${'list'.cyan}: List all plugins`);
	console.log(`  ${'help'.cyan}: this help...`);
	process.exit(0);
};
