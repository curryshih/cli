/* eslint-disable */
const { expect } = require('chai');
const { build, getStartOrders } = require('./dep');

const rootman = { metadata: {test: 1, notest: 0}};

describe('Run Dependency', () => {
	it('expect no dep only has 1 service', () => {
		const svcs = {
			svc1: {
				svcDir: '/here',
				manifest: {
					noin: 2,
					metadata: {test: 3},
				}
			}
		}
		const { svcGraph, services } = build(rootman, svcs, 'svc1');
		expect(Object.keys(services).length).to.equal(1);
		expect(services['svc1'].svcDir).to.equal('/here');
		expect(services['svc1'].manifest.noin).to.equal(2);
		expect(services['svc1'].manifest.metadata.test).to.equal(3);
		expect(services['svc1'].manifest.metadata.notest).to.equal(0);

		const startOrders = getStartOrders(svcGraph, ['svc1']);
		expect(!!startOrders.svc1.cycle).to.not.be.ok;
		expect(startOrders.svc1.steps).to.deep.equal([['svc1']]);
	});
	it('expect build correct 1->2->3 dep', () => {
		const svcs = {
			svc1: {
				svcDir: '/svc1',
				manifest: { metadata: { tasks: { run: { deps: ['svc2', 'svc3'] } } } },
			},
			svc2: {
				svcDir: '/svc2',
				manifest: { metadata: { tasks: { run: { deps: ['svc3'] } } } },
			},
			svc3: {
				svcDir: '/svc3',
				manifest: { metadata: { tasks: { run: {} } } },
			},
		};
		const { svcGraph, services } = build(rootman, svcs);
		expect(Object.keys(services).length).to.equal(3);

		const startOrders = getStartOrders(svcGraph, ['svc1', 'svc2', 'svc3']);
		expect(!!startOrders.svc1.cycle).to.not.be.ok;
		expect(startOrders.svc1.steps).to.deep.equal([['svc3'], ['svc2'], ['svc1']]);
		expect(!!startOrders.svc2.cycle).to.not.be.ok;
		expect(startOrders.svc2.steps).to.deep.equal([['svc3'], ['svc2']]);
		expect(!!startOrders.svc3.cycle).to.not.be.ok;
		expect(startOrders.svc3.steps).to.deep.equal([['svc3']]);
	});
	it('expect self import', () => {
		const svcs = {
			svc1: {
				svcDir: '/here',
				manifest: {metadata: {tasks: {run: {deps: ['svc1']}}}},
			},
		}
		expect(() => build(rootman, svcs)).to.throw();
	});
	it('expect circular dependency', () => {
		const svcs = {
			svc1: {
				svcDir: '/svc1',
				manifest: { metadata: { tasks: { run: { deps: ['svc2', 'svc3'] } } } },
			},
			svc2: {
				svcDir: '/svc2',
				manifest: { metadata: { tasks: { run: { deps: ['svc3'] } } } },
			},
			svc3: {
				svcDir: '/svc3',
				manifest: { metadata: { tasks: { run: { deps: ['svc1'] } } } },
			},
			svc4: {
				svcDir: '/svc4',
				manifest: { metadata: { tasks: { run: { deps: ['svc5'] } } } },
			},
			svc5: {
				svcDir: '/svc5',
				manifest: { metadata: { tasks: { run: { deps: ['svc4'] } } } },
			},
			svc6: {
				svcDir: '/svc6',
				manifest: { metadata: { tasks: { run: { deps: ['svc7'] } } } },
			},
			svc7: {
				svcDir: '/svc7',
				manifest: { metadata: { tasks: { run: { } } } },
			},
		};
		const { svcGraph, services } = build(rootman, svcs);
		expect(Object.keys(services).length).to.equal(7);

		const startOrders = getStartOrders(svcGraph, ['svc1', 'svc2', 'svc3', 'svc4', 'svc5', 'svc6', 'svc7']);
		expect(startOrders.svc1.cycle).to.have.members(['svc1', 'svc2', 'svc3']).but.not.to.have.members(['svc4', 'svc5', 'svc6', 'svc7']);
		expect(startOrders.svc2.cycle).to.have.members(['svc1', 'svc2', 'svc3']).but.not.to.have.members(['svc4', 'svc5', 'svc6', 'svc7']);
		expect(startOrders.svc3.cycle).to.have.members(['svc1', 'svc2', 'svc3']).but.not.to.have.members(['svc4', 'svc5', 'svc6', 'svc7']);

		expect(startOrders.svc4.cycle).to.have.members(['svc4', 'svc5']).but.not.to.have.members(['svc1', 'svc2', 'svc3', 'svc6', 'svc7']);
		expect(startOrders.svc5.cycle).to.have.members(['svc4', 'svc5']).but.not.to.have.members(['svc1', 'svc2', 'svc3', 'svc6', 'svc7']);

		expect(!!startOrders.svc6.cycle).to.not.be.ok;
		expect(startOrders.svc6.steps).to.deep.equal([['svc7'], ['svc6']]);

		expect(!!startOrders.svc7.cycle).to.not.be.ok;
		expect(startOrders.svc7.steps).to.deep.equal([['svc7']]);
	});
});