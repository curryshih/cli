module.exports = async () => {
	console.log(`Usage: gok ${'build'.green} ${'subcommand'.cyan}`);
	console.log(' Subcommands: ');
	console.log(`  ${'proto'.cyan} [name]: generate code for named proto file, or all if name is not present`);
	console.log(`  ${'gateway'.cyan} [name]: generate code for named gateway proto, or all if name is not present`);
	console.log(`  ${'service'.cyan} [name]: build binary for named service, or all if name is not present`);
	console.log(`  ${'help'.cyan}: this help...`);
	process.exit(0);
};
