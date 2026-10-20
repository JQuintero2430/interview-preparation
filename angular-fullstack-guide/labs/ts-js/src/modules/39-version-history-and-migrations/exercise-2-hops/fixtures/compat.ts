// Fixture: the rows 9.0.x to 22.0.x of angular.dev "Version compatibility" (the Node.js, TypeScript and RxJS each Angular
// minor requires), every row of the "Actively supported versions" and "Unsupported Angular versions" tables, oldest first.
// Source: https://raw.githubusercontent.com/angular/angular/main/adev/src/content/reference/versions.md
// (adev/src/content/reference/versions.md), read 2026-10-19. Values are copied as the page writes them (`\|\|` in the
// Markdown source is `||` here). The page gives the older rows "without any further guarantees"; the planner never reads the network.

export interface CompatRow {
  readonly major: number;
  /** The Angular column as written, for example `14.0.x || 14.1.x`. */
  readonly angular: string;
  readonly node: string;
  readonly typescript: string;
  readonly rxjs: string;
}

export const compat: readonly CompatRow[] = [
  { major: 9, angular: '9.0.x', node: '^10.13.0 || ^12.11.0', typescript: '>=3.6.0 <3.8.0', rxjs: '^6.5.3' },
  { major: 9, angular: '9.1.x', node: '^10.13.0 || ^12.11.0', typescript: '>=3.6.0 <3.9.0', rxjs: '^6.5.3' },
  { major: 10, angular: '10.0.x', node: '^10.13.0 || ^12.11.0', typescript: '~3.9.0', rxjs: '^6.5.3' },
  { major: 10, angular: '10.1.x', node: '^10.13.0 || ^12.11.0', typescript: '>=3.9.0 <4.1.0', rxjs: '^6.5.3' },
  { major: 10, angular: '10.2.x', node: '^10.13.0 || ^12.11.0', typescript: '>=3.9.0 <4.1.0', rxjs: '^6.5.3' },
  { major: 11, angular: '11.0.x', node: '^10.13.0 || ^12.11.0', typescript: '~4.0.0', rxjs: '^6.5.3' },
  { major: 11, angular: '11.1.x', node: '^10.13.0 || ^12.11.0', typescript: '>=4.0.0 <4.2.0', rxjs: '^6.5.3' },
  { major: 11, angular: '11.2.x', node: '^10.13.0 || ^12.11.0', typescript: '>=4.0.0 <4.2.0', rxjs: '^6.5.3' },
  { major: 12, angular: '12.0.x', node: '^12.14.0 || ^14.15.0', typescript: '~4.2.3', rxjs: '^6.5.3' },
  { major: 12, angular: '12.1.x', node: '^12.14.0 || ^14.15.0', typescript: '>=4.2.3 <4.4.0', rxjs: '^6.5.3' },
  { major: 12, angular: '12.2.x', node: '^12.14.0 || ^14.15.0', typescript: '>=4.2.3 <4.4.0', rxjs: '^6.5.3 || ^7.0.0' },
  { major: 13, angular: '13.0.x', node: '^12.20.0 || ^14.15.0 || ^16.10.0', typescript: '~4.4.3', rxjs: '^6.5.3 || ^7.4.0' },
  { major: 13, angular: '13.1.x || 13.2.x', node: '^12.20.0 || ^14.15.0 || ^16.10.0', typescript: '>=4.4.3 <4.6.0', rxjs: '^6.5.3 || ^7.4.0' },
  { major: 13, angular: '13.3.x || 13.4.x', node: '^12.20.0 || ^14.15.0 || ^16.10.0', typescript: '>=4.4.3 <4.7.0', rxjs: '^6.5.3 || ^7.4.0' },
  { major: 14, angular: '14.0.x || 14.1.x', node: '^14.15.0 || ^16.10.0', typescript: '>=4.6.2 <4.8.0', rxjs: '^6.5.3 || ^7.4.0' },
  { major: 14, angular: '14.2.x || 14.3.x', node: '^14.15.0 || ^16.10.0', typescript: '>=4.6.2 <4.9.0', rxjs: '^6.5.3 || ^7.4.0' },
  { major: 15, angular: '15.0.x', node: '^14.20.0 || ^16.13.0 || ^18.10.0', typescript: '~4.8.2', rxjs: '^6.5.3 || ^7.4.0' },
  { major: 15, angular: '15.1.x || 15.2.x', node: '^14.20.0 || ^16.13.0 || ^18.10.0', typescript: '>=4.8.2 <5.0.0', rxjs: '^6.5.3 || ^7.4.0' },
  { major: 16, angular: '16.0.x', node: '^16.14.0 || ^18.10.0', typescript: '>=4.9.3 <5.1.0', rxjs: '^6.5.3 || ^7.4.0' },
  { major: 16, angular: '16.1.x || 16.2.x', node: '^16.14.0 || ^18.10.0', typescript: '>=4.9.3 <5.2.0', rxjs: '^6.5.3 || ^7.4.0' },
  { major: 17, angular: '17.0.x', node: '^18.13.0 || ^20.9.0', typescript: '>=5.2.0 <5.3.0', rxjs: '^6.5.3 || ^7.4.0' },
  { major: 17, angular: '17.1.x || 17.2.x', node: '^18.13.0 || ^20.9.0', typescript: '>=5.2.0 <5.4.0', rxjs: '^6.5.3 || ^7.4.0' },
  { major: 17, angular: '17.3.x', node: '^18.13.0 || ^20.9.0', typescript: '>=5.2.0 <5.5.0', rxjs: '^6.5.3 || ^7.4.0' },
  { major: 18, angular: '18.0.x', node: '^18.19.1 || ^20.11.1 || ^22.0.0', typescript: '>=5.4.0 <5.5.0', rxjs: '^6.5.3 || ^7.4.0' },
  { major: 18, angular: '18.1.x || 18.2.x', node: '^18.19.1 || ^20.11.1 || ^22.0.0', typescript: '>=5.4.0 <5.6.0', rxjs: '^6.5.3 || ^7.4.0' },
  { major: 19, angular: '19.0.x', node: '^18.19.1 || ^20.11.1 || ^22.0.0', typescript: '>=5.5.0 <5.7.0', rxjs: '^6.5.3 || ^7.4.0' },
  { major: 19, angular: '19.1.x', node: '^18.19.1 || ^20.11.1 || ^22.0.0', typescript: '>=5.5.0 <5.8.0', rxjs: '^6.5.3 || ^7.4.0' },
  { major: 19, angular: '19.2.x', node: '^18.19.1 || ^20.11.1 || ^22.0.0', typescript: '>=5.5.0 <5.9.0', rxjs: '^6.5.3 || ^7.4.0' },
  { major: 20, angular: '20.0.x || 20.1.x', node: '^20.19.0 || ^22.12.0 || ^24.0.0', typescript: '>=5.8.0 <5.9.0', rxjs: '^6.5.3 || ^7.4.0' },
  { major: 20, angular: '20.2.x || 20.3.x', node: '^20.19.0 || ^22.12.0 || ^24.0.0', typescript: '>=5.8.0 <6.0.0', rxjs: '^6.5.3 || ^7.4.0' },
  { major: 21, angular: '21.0.x || 21.1.x || 21.2.x', node: '^20.19.0 || ^22.12.0 || ^24.0.0', typescript: '>=5.9.0 <6.0.0', rxjs: '^6.5.3 || ^7.4.0' },
  { major: 22, angular: '22.0.x', node: '^22.22.3 || ^24.15.0 || ^26.0.0', typescript: '>=6.0.0 <6.1.0', rxjs: '^6.5.3 || ^7.4.0' },];
