module.exports = async (argv, tools) => {
	const command = '$(gok nav to "$1") && \\';
	const { ln } = tools.log;
	ln('function gokto () {');
	ln(`	DEST=${command}`);
	ln('	command cd $DEST');
	ln('}');
	ln('export -f gokto');
};
