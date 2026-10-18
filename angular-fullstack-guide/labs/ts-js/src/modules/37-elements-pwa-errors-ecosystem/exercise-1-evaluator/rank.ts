import { type Evaluate, type Finding, type PackageFacts } from './facts';
import { type Rules } from './rules';

export interface Accepted {
  readonly name: string;
  readonly version: string;
  readonly hasExports: boolean;
  readonly hasSideEffects: boolean;
}

export interface Rejected {
  readonly name: string;
  readonly reasons: readonly string[];
}

export interface Ranking {
  readonly accepted: readonly Accepted[];
  readonly rejected: readonly Rejected[];
}

/**
 * Accepts the packages with no finding and ranks them by publish date, newest first (name breaks ties);
 * every other package is rejected with the message of each finding as its reasons.
 */
export function rank(candidates: readonly PackageFacts[], rules: Rules, today: Date, evaluate: Evaluate): Ranking {
  const accepted: PackageFacts[] = [];
  const rejected: Rejected[] = [];
  for (const pkg of candidates) {
    const findings: Finding[] = evaluate(pkg, rules, today);
    if (findings.length === 0) accepted.push(pkg);
    else rejected.push({ name: pkg.name, reasons: findings.map((finding) => finding.message) });
  }
  accepted.sort((x, y) => y.publishedAt.getTime() - x.publishedAt.getTime() || x.name.localeCompare(y.name));
  return {
    accepted: accepted.map(({ name, version, hasExports, hasSideEffects }) => ({ name, version, hasExports, hasSideEffects })),
    rejected,
  };
}
