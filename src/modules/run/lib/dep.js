const ojp = require('object-path');
const deepExtend = require('deep-extend');
const TGraph = require('tarjan-graph');

module.exports = {
	build(rootManifest, svcs) {
		const svcGraph = new TGraph();
		const services = {};
		const metadata = { rootManifest };

		Object.keys(svcs).forEach((svcName) => {
			const rootMeta = deepExtend({}, { metadata });
			const svc = svcs[svcName];
			if (!svc) throw Error(`Missing service ${svcName}`);
			const mergedManifest = deepExtend(rootMeta, svc.manifest);
			services[svcName] = {
				svcDir: svc.svcDir,
				manifest: mergedManifest,
			};
			const depSvcNames = ojp.get(mergedManifest, 'metadata.tasks.run.deps') || [];
			if (depSvcNames.indexOf(svcName) >= 0) throw new Error(`Service ${svcName} refers self-dependent`);
			svcGraph.add(svcName, depSvcNames);
		});

		return { svcGraph, services };
	},
	getStartOrders(svcGraph, startSvcs) {
		const cycles = [];
		if (svcGraph.hasCycle()) {
			const svcCycles = svcGraph.getCycles();
			svcCycles.forEach((vtxs) => {
				cycles.push(vtxs.map(v => v.name));
			});
		}
		const startOrders = {};
		startSvcs.forEach((svc) => {
			const cycle = cycles.find(c => c.indexOf(svc) >= 0);
			startOrders[svc] = { cycle, steps: [] };
			if (cycle) return;

			const descendants = {};
			svcGraph.getDescendants(svc).forEach((des) => {
				descendants[des] = svcGraph.vertices[des].successors.length;
			});
			let zeroes = Object.keys(descendants).filter(k => descendants[k] === 0);
			while (zeroes.length > 0) {
				startOrders[svc].steps.push(zeroes);
				zeroes.forEach(z => delete descendants[z]);
				zeroes.forEach((z) => {
					Object.keys(descendants).forEach((des) => {
						if (svcGraph.vertices[des].successors.find(s => s.name === z)) {
							descendants[des] -= 1;
						}
					});
				});
				zeroes = Object.keys(descendants).filter(k => descendants[k] === 0);
			}
			startOrders[svc].steps.push([svc]);
		});
		return startOrders;
	},
};
