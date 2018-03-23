const camelCase = require('camelcase');
const pascalCase = require('pascal-case');

const allCaps = ['ACL', 'API', 'ASCII', 'CPU', 'CSS', 'DNS', 'EOF', 'GUID', 'HTML', 'HTTP', 'HTTPS', 'ID', 'IP', 'JSON', 'LHS', 'QPS', 'RAM', 'RHS', 'RPC', 'SLA', 'SMTP', 'SQL', 'SSH', 'TCP', 'TLS', 'TTL', 'UDP', 'UI', 'UID', 'UUID', 'URI', 'URL', 'UTF8', 'VM', 'XML', 'XMPP', 'XSRF', 'XSS'];

const flagify = (flags) => {
	const flagStrs = Object.keys(flags).map((name) => {
		const { type, value, usage } = flags[name];
		const pascalName = pascalCase(camelCase(name));
		const varName = pascalName.replace(/[A-Z][a-z0-9]+/g, part => (allCaps.indexOf(part.toUpperCase()) >= 0 ? part.toUpperCase() : part));
		switch (type) {
		case 'String':
			return `\t// ${varName} is a string argument provided by flag -${name}="value", default to "${value}"
\t${varName} = flag.${type || 'String'}("${name}", "${value}", "${usage}")`;
		case 'Bool':
			return `\t// ${varName} is a bool argument provided by flag -${name}, default to false
\t${varName} = flag.${type || 'String'}("${name}", false, "${usage}")`;
		default:
		// Int Int64 Duration Uint Uint6 Float64
			return `\t// ${varName} is a number argument provided by flag -${name}, default to 0
\t${varName} = flag.${type || 'String'}("${name}", ${value || 0}, "${usage}")`;
		}
	});
	return flagStrs.join('\n');
};

module.exports = flags => `// Package args is auto-generated package, don't change anything
package args

import (
	"flag"
)

var (
${flagify(flags)}
)

func init() {
	flag.Parse()
}
`;
