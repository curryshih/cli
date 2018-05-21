module.exports = async () => {
	console.log(`Usage: gok ${'do'.green} ${'taskname'.cyan}`);
	console.log('  Running a task, this is the service oriented command, must be run inside a service.');
	console.log('  Although, a task can be inherited from root.yaml');
	process.exit(0);
};
