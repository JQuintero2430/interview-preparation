// Output question Q46.03: our prefix cache (concepts/prefix-cache.ts, our model, not a search library's code) on the typed
// sequence a, an, ang, "Ang ", angu, an. The fake server is ours: minimum 2 characters, limit 3, capacity 8; it cuts "an"
// off at 3 items (truncated) and answers "ang" with 2 items (complete). The cache is checked first; only a miss sends.
import { createPrefixCache, normalize } from '../../modules/46-system-design-case-studies/concepts/prefix-cache';
import { captureLogs } from '../capture';

interface Answer {
  readonly items: readonly string[];
  readonly complete: boolean;
}

const SERVER: ReadonlyMap<string, Answer> = new Map([
  ['an', { items: ['Angle grinder', 'Angular book', 'Anvil'], complete: false }],
  ['ang', { items: ['Angle grinder', 'Angular book'], complete: true }],
]);

const NOTHING: Answer = { items: [], complete: true };

describe('46 · Q46.03', () => {
  it('Q46.03 our prefix cache sends two requests', async () => {
    const cache = createPrefixCache({ minLength: 2, limit: 3, capacity: 8 });
    let requests = 0;

    const lines = await captureLogs((log) => {
      for (const typed of ['a', 'an', 'ang', 'Ang ', 'angu', 'an']) {
        const found = cache.lookup(typed);
        switch (found.kind) {
          case 'skip':
            log(`${JSON.stringify(typed)} -> skip`);
            break;
          case 'hit':
            log(`${JSON.stringify(typed)} -> hit`);
            break;
          case 'derived':
            log(`${JSON.stringify(typed)} -> derived from ${JSON.stringify(found.from)}: ${found.items.join(', ')}`);
            break;
          case 'miss': {
            const answer = SERVER.get(normalize(typed)) ?? NOTHING;
            requests += 1;
            cache.store(typed, answer.items, answer.complete);
            log(`${JSON.stringify(typed)} -> request, ${answer.items.length} items, complete ${answer.complete}`);
            break;
          }
        }
      }
      log(`requests: ${requests}`);
    });

    expect(lines).toEqual([
      '"a" -> skip',
      '"an" -> request, 3 items, complete false',
      '"ang" -> request, 2 items, complete true',
      '"Ang " -> hit',
      '"angu" -> derived from "ang": Angular book',
      '"an" -> hit',
      'requests: 2',
    ]);
  });
});
