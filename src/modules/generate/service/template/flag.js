module.exports = () => `// Package args is auto-generated package, don't change anything
package args

import (
	"flag"
)

var (
	// RPCBind is a string argument provided by flag -rpc-bind="value", default to "9009"
	RPCBind = flag.String("rpc-bind", "9009", "port to bind rpc")
	// HTTPBind is a string argument provided by flag -http-bind="value", default to "9019"
	HTTPBind = flag.String("http-bind", "9019", "port to bind http")
)

func init() {
	flag.Parse()
}
`;
