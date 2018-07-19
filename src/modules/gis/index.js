const repl = require('repl');
const replHis = require('repl.history');
const fs = require('fs');
const tools = require('../../tools');
const ojp = require('object-path');

const setCons = require('./funcs/cons');
const loadProto = require('./funcs/load');

const googleProtobufs = ['any', 'api', 'descriptor', 'duration', 'empty', 'field_mask', 'source_context', 'struct', 'timestamp', 'type', 'wrappers'];
const CTX = {};

module.exports = async () => {
	CTX.GIS = repl.start('> ');
	const hisfn = `${process.env.HOME}/.gok/.gok_history`;
	if (!fs.existsSync(hisfn)) {
		tools.mkdirp(`${process.env.HOME}/.gok`);
		fs.writeFileSync(hisfn, '');
	}
	const conffn = `${process.env.HOME}/.gok/config.yaml`;
	if (!fs.existsSync(conffn)) {
		tools.mkdirp(`${process.env.HOME}/.gok`);
		tools.writeYaml(conffn, {});
	}
	replHis(CTX.GIS, hisfn);
	const conf = tools.readYaml(conffn);
	const { cons } = conf || {};
	const messages = { google: { protobuf: {} } };
	googleProtobufs.forEach((pb) => {
		ojp.set(messages, 'google.protobuf', require(`google-protobuf/google/protobuf/${pb}_pb`)); // eslint-disable-line
	});
	CTX.GIS.context.messages = messages;
	CTX.GIS.context.services = {};
	CTX.GIS.context.cons = cons || {};


	CTX.GIS.defineCommand('setCons', {
		help: 'Set autoload constant',
		action(args) {
			setCons(CTX, ...tools.argsSplit(args));
			CTX.GIS.displayPrompt();
		},
	});

	CTX.GIS.defineCommand('loadProto', {
		help: 'Load proto from directory',
		action(args) {
			loadProto(CTX, ...tools.argsSplit(args));
			CTX.GIS.displayPrompt();
		},
	});
};
