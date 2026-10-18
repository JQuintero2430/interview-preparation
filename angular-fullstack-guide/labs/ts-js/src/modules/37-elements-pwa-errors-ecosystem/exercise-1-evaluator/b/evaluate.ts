import { satisfies } from '../../range';
import { CORE, day, monthsBefore, type Evaluate, type Finding, type PackageFacts } from '../facts';
import { type Rules } from '../rules';

/** Variant b: a rule table, `{ id, check }` entries iterated in order. */
interface Rule {
  readonly id: string;
  readonly check: (pkg: PackageFacts, rules: Rules, today: Date) => string | null;
}

export const RULE_TABLE: readonly Rule[] = [
  {
    id: 'peer-range',
    check: (pkg, rules) =>
      pkg.corePeer === undefined || satisfies(rules.angularVersion, pkg.corePeer)
        ? null
        : `${CORE} peer "${pkg.corePeer}" excludes ${rules.angularVersion}`,
  },
  {
    id: 'license',
    check: (pkg, rules) =>
      rules.licenseAllowList.includes(pkg.license) ? null : `license "${pkg.license}" is not on the allow-list`,
  },
  {
    id: 'last-publish',
    check: (pkg, rules, today) =>
      pkg.publishedAt >= monthsBefore(today, rules.maxMonthsSincePublish)
        ? null
        : `${pkg.version} was published ${day(pkg.publishedAt)}, more than ${rules.maxMonthsSincePublish} months before ${day(today)}`,
  },
];

export const evaluate: Evaluate = (pkg, rules, today) =>
  RULE_TABLE.flatMap((rule): Finding[] => {
    const message = rule.check(pkg, rules, today);
    return message === null ? [] : [{ rule: rule.id, message }];
  });
