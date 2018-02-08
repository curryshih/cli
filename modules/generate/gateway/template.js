module.exports = (data, meta) => `
syntax = "proto3";

package ${data.name};
option go_package = "${meta.package}/src/proto/gateway/${data.package ? data.package : ''}${data.package ? '/' : ''}${data.name};${data.name}gw";

import "google/api/annotations.proto";

// This is the list of proto provided by protobuf
// Use the one that you want
// import "google/protobuf/empty.proto";
// import "google/protobuf/struct.proto";
// import "google/protobuf/duration.proto";
// import "google/protobuf/timestamp.proto";
// import "google/protobuf/wrappers.proto";

// Sample service
service ${data.name}Service {
	rpc Get${data.name}(${data.name}Request) returns (${data.name}Response) {
	    option (google.api.http) = {
	    	post: "/v1/get-${data.name}"
	    	body: "*"
	    };
	}
}

message ${data.name}Request {
	string id = 1;
}

message ${data.name}Response {
	string message = 1;
}
`;
