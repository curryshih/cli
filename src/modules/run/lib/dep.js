const ojp = require('object-path');
const deepExtend = require('deep-extend');

module.exports = {
	build(rootManifest, svcs, startName) {
		const depHash = {};
		const services = {};
		const chkList = [startName];
		while (chkList.length > 0) {
			const svcName = chkList.shift();
			// If already checked
			if (depHash[svcName]) continue;

			const rootMeta = { metadata: { ...rootManifest.metadata } };

			const svc = svcs[svcName];
			if (!svc) throw Error(`Missing service ${svcName}`);

			const mergedManifest = deepExtend(rootMeta, svc.manifest);
			services[svcName] = {
				svcDir: svc.svcDir,
				manifest: mergedManifest,
			};
			const depSvcs = ojp.get(mergedManifest, 'metadata.tasks.run.deps') || [];
			depHash[svcName] = {};
			depSvcs.forEach((s) => {
				if (s === svcName) throw new Error(`Service ${svcName} refers self-dependent`);
				depHash[svcName][s] = true;
				// Ignore if checked
				if (depHash[s]) return;
				if (chkList.indexOf(s) >= 0) return;
				chkList.push(s);
			});
		}
		const deps = [];
		let keys = Object.keys(depHash);
		while (keys.length > 0) {
			const nodep = keys.filter(s => Object.keys(depHash[s]).length === 0);
			if (nodep.length === 0) throw new Error('Circular depenency detected, please decouple it ');
			deps.push(nodep);
			for (let i = 0; i < nodep.length; i += 1) {
				for (let j = 0; j < keys.length; j += 1) {
					delete depHash[keys[j]][nodep[i]];
				}
				delete depHash[nodep[i]];
			}
			keys = Object.keys(depHash);
		}
		return { deps, services };
	},
};
