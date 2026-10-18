import { satisfies } from '../../range';
import { CORE, day, monthsBefore, type Evaluate, type Finding, type PackageFacts } from '../facts';
import { type Rules } from '../rules';

/** Variant a: one pure function per rule, combined by a reducer. */
export function peerRangeFinding(pkg: PackageFacts, rules: Rules): Finding | null {
  if (pkg.corePeer === undefined || satisfies(rules.angularVersion, pkg.corePeer)) return null;
  return { rule: 'peer-range', message: `${CORE} peer "${pkg.corePeer}" excludes ${rules.angularVersion}` };
}

export function licenseFinding(pkg: PackageFacts, rules: Rules): Finding | null {
  if (rules.licenseAllowList.includes(pkg.license)) return null;
  return { rule: 'license', message: `license "${pkg.license}" is not on the allow-list` };
}

export function lastPublishFinding(pkg: PackageFacts, rules: Rules, today: Date): Finding | null {
  if (pkg.publishedAt >= monthsBefore(today, rules.maxMonthsSincePublish)) return null;
  return {
    rule: 'last-publish',
    message: `${pkg.version} was published ${day(pkg.publishedAt)}, more than ${rules.maxMonthsSincePublish} months before ${day(today)}`,
  };
}

export const evaluate: Evaluate = (pkg, rules, today) =>
  [peerRangeFinding(pkg, rules), licenseFinding(pkg, rules), lastPublishFinding(pkg, rules, today)].reduce<Finding[]>(
    (findings, finding) => (finding === null ? findings : [...findings, finding]),
    [],
  );
