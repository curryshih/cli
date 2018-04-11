/* eslint-disable */
const { expect } = require('chai');
const { build } = require('./dep');

const rootman = { metadata: {test: 1, notest: 0}};

describe('Test', () => {
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
  	const { deps, services } = build(rootman, svcs, 'svc1');
  	expect(deps.length).to.equal(1);
  	expect(deps[0].length).to.equal(1);
  	expect(deps[0][0]).to.equal('svc1');
  	expect(services['svc1'].svcDir).to.equal('/here');
  	expect(services['svc1'].manifest.noin).to.equal(2);
  	expect(services['svc1'].manifest.metadata.test).to.equal(3);
  	expect(services['svc1'].manifest.metadata.notest).to.equal(0);
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
  	const { deps, services } = build(rootman, svcs, 'svc1');
  	expect(deps.length).to.equal(3);
  	expect(deps[0]).to.deep.equal(['svc3']);
  	expect(deps[1]).to.deep.equal(['svc2']);
  	expect(deps[2]).to.deep.equal(['svc1']);
  });
  it('expect self import', () => {
  	const svcs = {
  		svc1: {
  			svcDir: '/here',
  			manifest: {metadata: {tasks: {run: {deps: ['svc1']}}}},
  		},
  	}
  	expect(() => build(rootman, svcs, 'svc1')).to.throw();
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
  	};
  	expect(() => build(rootman, svcs, 'svc1')).to.throw();
  });
});