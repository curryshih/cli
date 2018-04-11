const os = require('os');
const util = require('util');

// Wrapping the json log
module.exports = (prefix, data) => {
	try {
		const lines = (data.toString() || '').split(os.EOL);
		console.log(prefix);
		lines.forEach((line) => {
			try {
				const obj = JSON.parse(line);
				if (obj.sourceLocation) {
					obj.caller = `${obj.caller}#${obj.sourceLocation.functionName}`;
					delete obj.sourceLocation;
				}
				delete obj.serviceContext;
				delete obj.context;
				if (obj.severity) {
					obj.message = `${obj.severity} ${obj.message}`;
					delete obj.severity;
				}
				delete obj.eventTime;

				// if (obj.caller.indexOf('log/log.go:') === 0) {
				// 	return console.log(obj.message);
				// }

				return console.log(util.inspect(obj, false, null));
			} catch (e) {
				return console.log(line);
			}
		});
	} catch (e) {
		// Just ignore if can not parse json
	}
	return console.log(`${prefix}${data}`);
};
