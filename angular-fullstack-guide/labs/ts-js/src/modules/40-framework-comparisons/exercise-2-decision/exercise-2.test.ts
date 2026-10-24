// Exercise 40.2: six criteria, each run over both decision methods (weighted sum, Borda count). The fixture is one
// example team's judgments, not facts about the frameworks. Expected values below were worked out by hand from the
// fixture's scores and weights; where the two methods differ, each variant carries its own value.
import { createDecide, writeRecord } from './decision';
import type { Evidence, Flip, Matrix, Method, Outcome, Team } from './decision';
import { decide as decideA, method as methodA } from './a/decide';
import { decide as decideB, method as methodB } from './b/decide';
import { evidence, exampleTeam, firstPartyRouter, gates } from './fixtures/example-team';

interface Expected {
  /** candidate, place, weighted total, best first */
  readonly ranking: readonly (readonly [string, number, number])[];
  readonly scores: readonly number[];
  /** the team in which Vue copies Angular's scores */
  readonly tie: { readonly tied: readonly string[]; readonly places: readonly number[]; readonly totals: readonly number[] };
  /** React fails an extra gate and is dropped */
  readonly gated: { readonly winner: string | null; readonly totals: readonly number[] };
  readonly flip: Flip;
  /** a weight past the flip and who wins there */
  readonly past: { readonly weight: number; readonly winner: string };
  readonly rankingLines: readonly string[];
  readonly flipLine: string;
}

interface Variant {
  readonly name: string;
  readonly decide: (team: Team) => Outcome;
  readonly method: Method;
  readonly expected: Expected;
}

const variants: readonly Variant[] = [
  {
    name: 'a (weighted sum)',
    decide: decideA,
    method: methodA,
    expected: {
      // Angular 20+8+10+12+10+12 = 72, Vue 12+4+8+16+8+18 = 66, React 8+6+4+20+6+18 = 62; scores are totals / 20
      ranking: [['Angular', 1, 72], ['Vue', 2, 66], ['React', 3, 62]],
      scores: [3.6, 3.3, 3.1],
      // React dropped: Angular 72, Vue 66 (totals do not change)
      gated: { winner: 'Angular', totals: [72, 66] },
      // Vue = Angular: 72 and 72, React 62
      tie: { tied: ['Angular', 'Vue'], places: [1, 1, 3], totals: [72, 72, 62] },
      // integration 4 -> 1: Angular 72 - 15 = 57, Vue 66 - 9 = 57 (React 62 - 6 = 56)
      flip: { criterion: 'integration', from: 4, to: 1, change: -3, challenger: 'Vue' },
      // integration 0.5: Angular 54.5, Vue 55.5, React 55
      past: { weight: 0.5, winner: 'Vue' },
      rankingLines: ['1. Angular: 3.60', '2. Vue: 3.30', '3. React: 3.10'],
      flipLine: 'Flipping assumption: weight of integration from 4 to 1: Vue ties Angular',
    },
  },
  {
    name: 'b (Borda count)',
    decide: decideB,
    method: methodB,
    expected: {
      // Borda points per criterion (Angular, React, Vue): 2 0 1 | 2 1 0 | 2 0 1 | 0 2 1 | 2 0 1 | 0 1.5 1.5
      // Vue 4+0+2+4+2+9 = 21, Angular 8+4+4+0+4+0 = 20, React 0+2+0+8+0+9 = 19
      ranking: [['Vue', 1, 21], ['Angular', 2, 20], ['React', 3, 19]],
      scores: [21, 20, 19],
      // React dropped, two candidates (best 1 point, worst 0): Angular 4+2+2+0+2+0 = 10, Vue 0+0+0+4+0+6 = 10, a tie
      gated: { winner: null, totals: [10, 10] },
      // Vue = Angular: Angular 20, Vue 20, React 0+0+0+8+0+12 = 20, a three-way tie
      tie: { tied: ['Angular', 'React', 'Vue'], places: [1, 1, 1], totals: [20, 20, 20] },
      // upgrade-cost 2 -> 2.5: Angular 20 + 1 = 21, Vue 21 + 0 = 21 (React 19.5)
      flip: { criterion: 'upgrade-cost', from: 2, to: 2.5, change: 0.5, challenger: 'Angular' },
      // upgrade-cost 3: Angular 22, Vue 21, React 20
      past: { weight: 3, winner: 'Angular' },
      rankingLines: ['1. Vue: 21.00', '2. Angular: 20.00', '3. React: 19.00'],
      flipLine: 'Flipping assumption: weight of upgrade-cost from 2 to 2.5: Angular ties Vue',
    },
  },
];

const withWeight = (criterion: string, weight: number): Team => ({
  ...exampleTeam,
  criteria: exampleTeam.criteria.map((c) => (c.id === criterion ? { ...c, weight } : c)),
});

describe.each(variants)('Exercise 40.2 · variant $name', ({ decide, method, expected }) => {
  it('eliminates a candidate that fails a must-have before any scoring', () => {
    // React has no evidence at all: a decision that scored it first would throw.
    const team: Team = {
      ...exampleTeam,
      gates: [...gates, firstPartyRouter],
      evidence: evidence.filter((e) => e.candidate !== 'React'),
    };
    const rowsScored: number[] = [];
    const spy = {
      ...method,
      points: (scores: Matrix): Matrix => {
        rowsScored.push(scores.length);
        return method.points(scores);
      },
    };
    const outcome = createDecide(spy)(team);
    expect(outcome.eliminated).toEqual([{ candidate: 'React', gate: 'first-party-router' }]);
    expect(outcome.ranking.map((r) => r.candidate).sort()).toEqual(['Angular', 'Vue']);
    expect(rowsScored).toEqual([2]);
    expect(outcome.winner).toBe(expected.gated.winner);
    expect(outcome.ranking.map((r) => r.total)).toEqual(expected.gated.totals);
  });

  it('rejects evidence that cites no source', () => {
    const blank = (e: Evidence): Evidence => (e.candidate === 'Vue' && e.criterion === 'integration' ? { ...e, source: '  ' } : e);
    expect(() => decide({ ...exampleTeam, evidence: evidence.map(blank) })).toThrow('evidence for Vue on integration cites no source');
    expect(evidence.every((e) => /^#[1-7]-/.test(e.source))).toBe(true);
    expect(evidence).toHaveLength(18);
  });

  it('ranks the remaining candidates from best to worst', () => {
    const outcome = decide(exampleTeam);
    expect(outcome.ranking.map((r) => [r.candidate, r.place, r.total])).toEqual(expected.ranking);
    outcome.ranking.forEach((r, i) => expect(r.score).toBeCloseTo(expected.scores[i] ?? NaN, 9));
    expect(outcome.winner).toBe(expected.ranking[0]?.[0]);
    expect(outcome.eliminated).toEqual([]);
  });

  it('reports a tie instead of picking one silently', () => {
    const angular = new Map(evidence.filter((e) => e.candidate === 'Angular').map((e) => [e.criterion, e.score]));
    const copy = (e: Evidence): Evidence => (e.candidate === 'Vue' ? { ...e, score: angular.get(e.criterion) ?? e.score } : e);
    const outcome = decide({ ...exampleTeam, evidence: evidence.map(copy) });
    expect(outcome.winner).toBeNull();
    expect(outcome.tied).toEqual(expected.tie.tied);
    expect(outcome.ranking.map((r) => r.place)).toEqual(expected.tie.places);
    expect(outcome.ranking.map((r) => r.total)).toEqual(expected.tie.totals);
    expect(outcome.flip).toBeNull();
  });

  it('reports the smallest single weight change that flips the winner', () => {
    const { flip } = decide(exampleTeam);
    expect(flip).toEqual(expected.flip);
    // At the reported weight the challenger ties the winner; past it the challenger wins alone.
    const at = decide(withWeight(expected.flip.criterion, expected.flip.to));
    expect(at.winner).toBeNull();
    expect(at.tied).toEqual(['Angular', 'Vue']);
    const past = decide(withWeight(expected.flip.criterion, expected.past.weight));
    expect(past.winner).toBe(expected.past.winner);
  });

  it('writes a decision record that lists the gates, the ranking and the flipping assumption', () => {
    const gateLines = gates.map((g) => `- ${g.text} (${g.source}): passed by Angular, React, Vue; failed by nobody`);
    expect(writeRecord(decide(exampleTeam)).split('\n')).toEqual([
      `Decision record (${method.name}) · one example team's judgments, not facts about the frameworks`,
      'Gates',
      ...gateLines,
      'Ranking',
      ...expected.rankingLines,
      expected.flipLine,
    ]);
    const routed = decide({ ...exampleTeam, gates: [...gates, firstPartyRouter] });
    expect(writeRecord(routed)).toContain(`- ${firstPartyRouter.text} (${firstPartyRouter.source}): passed by Angular, Vue; failed by React`);
  });
});
