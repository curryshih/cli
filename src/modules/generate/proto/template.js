const pascalize = require('pascal-case');

module.exports = (data, meta) => {
	const sname = pascalize(data.name);
	const lowname = sname.toLowerCase();
	return `syntax = "proto3";

package ${lowname};
option go_package = "${meta.package}/src/proto/${data.package ? data.package : ''}${data.package ? '/' : ''}${lowname};${lowname}pb";

// This is the list of proto provided by protobuf
// Use the one that you want
// import "google/protobuf/empty.proto";
// import "google/protobuf/struct.proto";
// import "google/protobuf/duration.proto";
// import "google/protobuf/timestamp.proto";
// import "google/protobuf/wrappers.proto";

// Uncomment this line if you're using validator
// import "validator.proto";
// Format: type Name = 1 [(validator.field) = {int_gt: 0, int_lt: 100}];
// List of validators:
//   Message: msg_exists, human_error
//   String: regex, string_not_empty, length_eq, length_gt, length_lt
// 	 Int: int_gt, int_lt
// 	 Float, Double: float_gt, float_lt, float_epsilon, float_gte, float_lte
//   Repeated: repeated_count_min, repeated_count_max
//   Bytes: length_eq, length_gt, length_lt

// Sample service
service ${sname}Service {
	rpc Get${sname}(${sname}Request) returns (${sname}Response);
}

message ${sname}Request {
	string id = 1;
}

message ${sname}Response {
	string message = 1;
}
`;
};
