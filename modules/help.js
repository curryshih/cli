module.exports = async () => {
	console.log(`Usage: gok ${'command'.green} ${'subcommand'.cyan}`);
	console.log(' Commands:');
	console.log(`  ${'generate'.green}: Generate`);
	console.log(`  ${'doctor'.green}: Check current environment`);
	console.log(`  ${'version'.green}: Print curent version`);
	console.log(`  ${'help'.green}: this help...`);
	process.exit(0);
};
