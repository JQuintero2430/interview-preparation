// Exercise 40.2: the shared decision pipeline. A decision is gates first, then scoring, then a ranking that reports
// ties, then one sensitivity check, then a written record. Only the scoring method differs between variants a and b.
// Our code; nothing here reads a clock, the network or a framework.

export type Candidate = string;
export type Score = 1 | 2 | 3 | 4 | 5;

/** A must-have: each candidate passes or fails it, and the gate says where that judgment comes from. */
export interface Gate {
  readonly id: string;
  readonly text: string;
  readonly passes: Readonly<Record<Candidate, boolean>>;
  readonly source: string;
}

export interface Criterion {
  readonly id: string;
  readonly weight: number;
}

/** One candidate's score on one criterion; `source` is a section anchor of this module or a dated read. */
export interface Evidence {
  readonly candidate: Candidate;
  readonly criterion: string;
  readonly score: Score;
  readonly source: string;
}

export interface Team {
  readonly label: string;
  readonly candidates: readonly Candidate[];
  readonly gates: readonly Gate[];
  readonly criteria: readonly Criterion[];
  readonly evidence: readonly Evidence[];
}

/** Rows are the remaining candidates, columns the criteria, in the team's order. */
export type Matrix = readonly (readonly number[])[];

export interface Method {
  readonly name: string;
  /** Turns the evidence scores into the points that the weights multiply. */
  readonly points: (scores: Matrix) => Matrix;
  /** The number shown next to a candidate, from its weighted total and the sum of the weights. */
  readonly report: (total: number, totalWeight: number) => number;
}

export interface GateReport {
  readonly id: string;
  readonly text: string;
  readonly source: string;
  readonly passed: readonly Candidate[];
  readonly failed: readonly Candidate[];
}

export interface Ranked {
  readonly candidate: Candidate;
  readonly place: number;
  readonly total: number;
  readonly score: number;
}

/** The smallest change of one weight at which a challenger reaches the winner's total. */
export interface Flip {
  readonly criterion: string;
  readonly from: number;
  readonly to: number;
  readonly change: number;
  readonly challenger: Candidate;
}

export interface Outcome {
  readonly method: string;
  readonly label: string;
  readonly gates: readonly GateReport[];
  readonly eliminated: readonly { readonly candidate: Candidate; readonly gate: string }[];
  readonly ranking: readonly Ranked[];
  readonly winner: Candidate | null;
  readonly tied: readonly Candidate[];
  readonly flip: Flip | null;
}

const EPSILON = 1e-9;
const same = (a: number, b: number): boolean => Math.abs(a - b) < EPSILON;
const cell = (matrix: Matrix, row: number, column: number): number => matrix[row]?.[column] ?? 0;

function applyGates(team: Team): { survivors: Candidate[]; eliminated: Outcome['eliminated'] } {
  const eliminated: { candidate: Candidate; gate: string }[] = [];
  const survivors = team.candidates.filter((candidate) => {
    const failed = team.gates.find((gate) => gate.passes[candidate] !== true); // no verdict counts as a fail
    if (failed !== undefined) eliminated.push({ candidate, gate: failed.id });
    return failed === undefined;
  });
  return { survivors, eliminated };
}

/** Looks up every survivor's evidence; a missing score or a blank source stops the decision. */
function scoreMatrix(team: Team, survivors: readonly Candidate[]): number[][] {
  return survivors.map((candidate) =>
    team.criteria.map((criterion) => {
      const found = team.evidence.find((e) => e.candidate === candidate && e.criterion === criterion.id);
      if (found === undefined) throw new Error(`no evidence for ${candidate} on ${criterion.id}`);
      if (found.source.trim() === '') throw new Error(`evidence for ${candidate} on ${criterion.id} cites no source`);
      return found.score;
    }),
  );
}

function weightedTotals(points: Matrix, weights: readonly number[]): number[] {
  return points.map((row) => row.reduce((sum, p, j) => sum + p * (weights[j] ?? 0), 0));
}

/** Best first; equal totals share a place (1, 1, 3) and keep the team's order. */
function rank(survivors: readonly Candidate[], totals: readonly number[], method: Method, weightSum: number): Ranked[] {
  const order = survivors
    .map((candidate, i) => ({ candidate, total: totals[i] ?? 0 }))
    .sort((a, b) => b.total - a.total);
  const ranking: Ranked[] = [];
  order.forEach((entry, i) => {
    const previous = ranking[i - 1];
    const place = previous !== undefined && same(previous.total, entry.total) ? previous.place : i + 1;
    ranking.push({ ...entry, place, score: method.report(entry.total, weightSum) });
  });
  return ranking;
}

/**
 * Every total is linear in one weight, so each (criterion, challenger) pair has one weight at which the challenger
 * reaches the winner. Keep those at which the challenger really tops the field and the weight stays at or above 0,
 * then take the smallest change (equal changes: earlier criterion, then the decrease).
 */
function smallestFlip(team: Team, survivors: readonly Candidate[], points: Matrix, totals: readonly number[], winner: Candidate): Flip | null {
  const w = survivors.indexOf(winner);
  const found: { flip: Flip; j: number }[] = [];
  survivors.forEach((challenger, x) => {
    if (x === w) return;
    team.criteria.forEach((criterion, j) => {
      const diff = cell(points, x, j) - cell(points, w, j);
      if (diff === 0) return;
      const change = ((totals[w] ?? 0) - (totals[x] ?? 0)) / diff;
      const reached = (totals[x] ?? 0) + change * cell(points, x, j);
      const tops = totals.every((t, i) => t + change * cell(points, i, j) <= reached + EPSILON);
      if (criterion.weight + change < 0 || !tops) return;
      found.push({ flip: { criterion: criterion.id, from: criterion.weight, to: criterion.weight + change, change, challenger }, j });
    });
  });
  const size = (f: Flip): number => Math.abs(f.change);
  found.sort((a, b) => (same(size(a.flip), size(b.flip)) ? a.j - b.j || a.flip.change - b.flip.change : size(a.flip) - size(b.flip)));
  return found[0]?.flip ?? null;
}

export function createDecide(method: Method): (team: Team) => Outcome {
  return (team) => {
    const { survivors, eliminated } = applyGates(team); // gates run before any scoring
    const points = method.points(scoreMatrix(team, survivors));
    const weights = team.criteria.map((c) => c.weight);
    const totals = weightedTotals(points, weights);
    const ranking = rank(survivors, totals, method, weights.reduce((a, b) => a + b, 0));
    const tied = ranking.filter((r) => r.place === 1).map((r) => r.candidate);
    const winner = tied.length === 1 ? (tied[0] ?? null) : null;
    const gates = team.gates.map((g) => ({
      id: g.id,
      text: g.text,
      source: g.source,
      passed: team.candidates.filter((c) => g.passes[c] === true),
      failed: team.candidates.filter((c) => g.passes[c] !== true),
    }));
    const flip = winner === null ? null : smallestFlip(team, survivors, points, totals, winner);
    return { method: method.name, label: team.label, gates, eliminated, ranking, winner, tied, flip };
  };
}

const list = (names: readonly Candidate[]): string => (names.length === 0 ? 'nobody' : names.join(', '));

export function writeRecord(outcome: Outcome): string {
  const gates = outcome.gates.map((g) => `- ${g.text} (${g.source}): passed by ${list(g.passed)}; failed by ${list(g.failed)}`);
  const ranking = outcome.ranking.map((r) => `${r.place}. ${r.candidate}: ${r.score.toFixed(2)}`);
  const { flip, winner } = outcome;
  const flipLine =
    flip === null || winner === null
      ? 'none: the top place is tied or no single weight change flips the winner'
      : `weight of ${flip.criterion} from ${flip.from} to ${flip.to}: ${flip.challenger} ties ${winner}`;
  return [`Decision record (${outcome.method}) · ${outcome.label}`, 'Gates', ...gates, 'Ranking', ...ranking, `Flipping assumption: ${flipLine}`].join('\n');
}
