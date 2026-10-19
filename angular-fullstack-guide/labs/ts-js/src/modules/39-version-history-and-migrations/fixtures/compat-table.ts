// Fixture: the rows 13.0.x to 22.0.x of angular.dev "Version compatibility" (the Node.js, TypeScript and RxJS each Angular
// minor requires). Source: https://raw.githubusercontent.com/angular/angular/main/adev/src/content/reference/versions.md
// (adev/src/content/reference/versions.md, tables "Actively supported versions" and "Unsupported Angular versions"), read 2026-10-18.
// Each major's row is the one that begins with its `.0.x` version. Values are copied as the page writes them
// (`\|\|` in the Markdown source is `||` here); the page gives its older rows "without any further guarantees".

export interface CompatRow {
  readonly major: number;
  /** The Angular column as written, for example `14.0.x || 14.1.x`. */
  readonly angular: string;
  readonly node: string;
  readonly typescript: string;
  readonly rxjs: string;
}

export const compatTable: readonly CompatRow[] = [
  { major: 13, angular: '13.0.x', node: '^12.20.0 || ^14.15.0 || ^16.10.0', typescript: '~4.4.3', rxjs: '^6.5.3 || ^7.4.0' },
  { major: 14, angular: '14.0.x || 14.1.x', node: '^14.15.0 || ^16.10.0', typescript: '>=4.6.2 <4.8.0', rxjs: '^6.5.3 || ^7.4.0' },
  { major: 15, angular: '15.0.x', node: '^14.20.0 || ^16.13.0 || ^18.10.0', typescript: '~4.8.2', rxjs: '^6.5.3 || ^7.4.0' },
  { major: 16, angular: '16.0.x', node: '^16.14.0 || ^18.10.0', typescript: '>=4.9.3 <5.1.0', rxjs: '^6.5.3 || ^7.4.0' },
  { major: 17, angular: '17.0.x', node: '^18.13.0 || ^20.9.0', typescript: '>=5.2.0 <5.3.0', rxjs: '^6.5.3 || ^7.4.0' },
  { major: 18, angular: '18.0.x', node: '^18.19.1 || ^20.11.1 || ^22.0.0', typescript: '>=5.4.0 <5.5.0', rxjs: '^6.5.3 || ^7.4.0' },
  { major: 19, angular: '19.0.x', node: '^18.19.1 || ^20.11.1 || ^22.0.0', typescript: '>=5.5.0 <5.7.0', rxjs: '^6.5.3 || ^7.4.0' },
  { major: 20, angular: '20.0.x || 20.1.x', node: '^20.19.0 || ^22.12.0 || ^24.0.0', typescript: '>=5.8.0 <5.9.0', rxjs: '^6.5.3 || ^7.4.0' },
  { major: 21, angular: '21.0.x || 21.1.x || 21.2.x', node: '^20.19.0 || ^22.12.0 || ^24.0.0', typescript: '>=5.9.0 <6.0.0', rxjs: '^6.5.3 || ^7.4.0' },
  { major: 22, angular: '22.0.x', node: '^22.22.3 || ^24.15.0 || ^26.0.0', typescript: '>=6.0.0 <6.1.0', rxjs: '^6.5.3 || ^7.4.0' },
];
