#!/usr/bin/env node

const start = require('./src');

start().catch((err) => {
	console.log(err.toString().red);
});
