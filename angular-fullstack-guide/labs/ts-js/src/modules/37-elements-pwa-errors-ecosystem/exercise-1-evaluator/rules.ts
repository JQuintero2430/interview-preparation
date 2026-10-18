/** The team's policy, as data. */
export interface Rules {
  readonly angularVersion: string;
  readonly licenseAllowList: readonly string[];
  readonly maxMonthsSincePublish: number;
}

export const RULES: Rules = {
  angularVersion: '22.2.1',
  licenseAllowList: ['MIT', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'ISC'],
  maxMonthsSincePublish: 12,
};
