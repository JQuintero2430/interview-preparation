import { expect, it } from 'vitest';
import { unmetPeers } from './peers';

it('accepts versions inside the peer range', () => {
  expect(unmetPeers({ react: '19.3.0' }, { react: '>=19.2.7' })).toEqual([]);
});

it('reports an installed version outside the range', () => {
  expect(unmetPeers({ react: '18.3.1' }, { react: '>=19.2.7' })).toEqual([
    { name: 'react', required: '>=19.2.7', installed: '18.3.1' },
  ]);
});

it('reports a missing peer', () => {
  expect(unmetPeers({}, { react: '^18 || ^19' })).toEqual([
    { name: 'react', required: '^18 || ^19', installed: undefined },
  ]);
});
