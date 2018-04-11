#!/usr/bin/env node

const start = require('./src');

start().catch((err) => {
	if (process.env.GOK_VERBOSE) {
		console.error(err);
		process.exit(1);
		return;
	}
	console.error(err.toString().red);
});
