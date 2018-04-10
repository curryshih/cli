module.exports = {
	defaultMapping: {
		'validator.proto': 'github.com/gokums/go-proto-validators',
		'google/api/annotations.proto': 'google.golang.org/genproto/googleapis/api/annotations',
	},
	defaultPath: [
		'vendor/github.com/grpc-ecosystem/grpc-gateway/third_party/googleapis',
		'vendor/github.com/gokums/go-proto-validators',
	],
	buildMapping(mappings) {
		const mstrs = Object.keys(mappings).map(mkey => `M${mkey}=${mappings[mkey]}`);
		return mstrs.join(',');
	},
	buildPath(paths) {
		const pstrs = paths.map(p => `-I${p}`);
		return pstrs.join(' ');
	},
};
