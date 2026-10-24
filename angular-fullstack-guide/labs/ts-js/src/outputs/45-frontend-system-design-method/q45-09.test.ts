// Output question Q45.09: our placement function (concepts/state-placement.ts, our model, after module 28 section 1)
// on six pieces of the task board's state. The properties are the test's declarations.
import { placeState, type StateItem } from '../../modules/45-frontend-system-design-method/concepts/state-placement';
import { captureLogs } from '../capture';

const base: StateItem = {
  name: '',
  shareable: false,
  serverOwned: false,
  survives: 'never',
  sharedAcrossFeatures: false,
};

describe('45 · Q45.09', () => {
  it('Q45.09 our placement of six pieces of the board state', async () => {
    const items: StateItem[] = [
      { ...base, name: 'open card', shareable: true },
      { ...base, name: 'filters', shareable: true, sharedAcrossFeatures: true },
      { ...base, name: 'cards', serverOwned: true, sharedAcrossFeatures: true },
      { ...base, name: 'drag in progress' },
      { ...base, name: 'draft comment', survives: 'reload' },
      { ...base, name: 'theme', survives: 'restart', sharedAcrossFeatures: true },
    ];
    const lines = await captureLogs((log) => {
      for (const item of items) {
        const { home, lifetime } = placeState(item);
        log(`${item.name}: ${home}${lifetime ? ` (${lifetime})` : ''}`);
      }
    });
    expect(lines).toEqual([
      'open card: url',
      'filters: url',
      'cards: server-cache',
      'drag in progress: component',
      'draft comment: storage (tab)',
      'theme: storage (until cleared)',
    ]);
  });
});
