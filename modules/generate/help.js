module.exports = async () => {
	console.log(`Usage: gok ${'generate'.green} ${'subcommand'.cyan}`);
	console.log(' Subcommands: ');
	console.log(`  ${'project'.cyan} rootPackage: generate a sandbox project`);
	console.log(`  ${'proto'.cyan} name -p package: generate a proto file`);
	console.log(`  ${'service'.cyan} name -p package: generate service sandbox`);
	console.log(`  ${'help'.cyan}: this help...`);
	process.exit(0);
};
