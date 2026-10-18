// Section 7 claim: the algorithm read from nx 23.3.0 (filterAffected), run on our own code.
import { affected, type ProjectGraph } from './affected';

// shop -> feature-orders -> ui, data-access -> util; admin -> feature-catalog -> ui.
const graph: ProjectGraph = {
  shop: ['feature-orders'],
  admin: ['feature-catalog'],
  'feature-orders': ['ui', 'data-access'],
  'feature-catalog': ['ui'],
  ui: ['util'],
  'data-access': ['util'],
  util: [],
};

describe('Module 38 · section 7', () => {
  it('Section 7: a change to a util project affects every project that reaches it', () => {
    expect(affected(graph, ['util'])).toEqual(Object.keys(graph).sort());
  });

  it('Section 7: a change to an app affects only that app', () => {
    expect(affected(graph, ['shop'])).toEqual(['shop']);
    expect(affected(graph, ['admin'])).toEqual(['admin']);
  });
});
