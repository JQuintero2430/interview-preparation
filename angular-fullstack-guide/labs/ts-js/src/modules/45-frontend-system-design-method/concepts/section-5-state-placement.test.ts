// Section 5 claims, about our model (state-placement.ts), not a library: the first true answer in the fixed order
// decides the home.
import { describe, expect, it } from 'vitest';
import { placeState, type StateItem } from './state-placement';

const base: StateItem = {
  name: 'item',
  shareable: false,
  serverOwned: false,
  survives: 'never',
  sharedAcrossFeatures: false,
};

describe('Section 5: placement order', () => {
  it('Section 5: shareable view state goes to the URL', () => {
    // Even if it were also server-owned and shared, shareable is asked first.
    expect(placeState({ ...base, name: 'filter', shareable: true, serverOwned: true, sharedAcrossFeatures: true })).toEqual({ home: 'url' });
  });

  it('Section 5: data the server owns goes to the server cache and never to a store copy', () => {
    expect(placeState({ ...base, name: 'cards', serverOwned: true, sharedAcrossFeatures: true })).toEqual({ home: 'server-cache' });
  });

  it('Section 5: ephemeral interaction state stays in the component', () => {
    expect(placeState({ ...base, name: 'drag in progress' })).toEqual({ home: 'component' });
    expect(placeState({ ...base, name: 'current user chip', sharedAcrossFeatures: true })).toEqual({ home: 'store' });
  });

  it('Section 5: a preference that survives reload and is not shared goes to storage', () => {
    expect(placeState({ ...base, name: 'collapsed column', survives: 'reload' })).toEqual({ home: 'storage', lifetime: 'tab' });
    expect(placeState({ ...base, name: 'theme', survives: 'restart' })).toEqual({ home: 'storage', lifetime: 'until cleared' });
  });
});
