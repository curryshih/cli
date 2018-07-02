module.exports = async () => {
	console.log(`Usage: gok task ${'run'.green} ${'taskname'.cyan}`);
	console.log('  Running a task, this is the service oriented command, must be run inside a service.');
	console.log('  Although, a task can be inherited from root.yaml');
	console.log(`Usage: gok task ${'pull'.green} ${'namespace'.cyan} name`);
	console.log('  Pulling a task from predefined list');
	process.exit(0);
};
