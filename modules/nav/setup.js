module.exports = async (argv, tools) => {
	const command = '`gok nav to "$1"`';
	const { ln } = tools.log;
	ln('function gokto () {');
	ln(`	command cd ${command}`);
	ln('}');
	ln('export -f gokto');
};
