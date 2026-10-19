// Fixture: the "Actively supported versions" table of angular.dev "Angular versioning and releases".
// Source: https://raw.githubusercontent.com/angular/angular/main/adev/src/content/reference/releases.md
// (adev/src/content/reference/releases.md, section "Support policy and schedule"), read 2026-10-18.
// Values are copied as the page writes them: a value such as "2027-06" is a month, not a day, and `status`
// is the page's own Status column on the read date. The page calls its dates "general guidance and subject to change".

export interface SupportRow {
  readonly version: string;
  readonly status: 'Active' | 'LTS';
  readonly released: string;
  readonly activeEnds: string;
  readonly ltsEnds: string;
}

export const supportWindows: readonly SupportRow[] = [
  { version: '^22.0.0', status: 'Active', released: '2026-06-03', activeEnds: '2027-06', ltsEnds: '2028-06' },
  { version: '^21.0.0', status: 'LTS', released: '2025-11-19', activeEnds: '2026-06-03', ltsEnds: '2027-06' },
  { version: '^20.0.0', status: 'LTS', released: '2025-05-28', activeEnds: '2025-11-19', ltsEnds: '2026-11-28' },
];
