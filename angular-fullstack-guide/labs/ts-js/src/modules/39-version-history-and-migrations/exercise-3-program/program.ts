// Exercise 39.3: the types both schedulers share and the fixture program, a 127-component app. The edges are the
// ones section 10 draws: three read from angular.dev's migration and zoneless docs (read 2026-10-19) and one
// recommendation of the guide's. The program is our fixture, not a measured codebase. No clock, git, npm, ng or network.

export type Track = 'components' | 'builder' | 'tests' | 'animations';
export type EdgeSource = 'docs' | 'recommendation';

export interface Prerequisite {
  readonly id: string;
  readonly source: EdgeSource;
}

export interface Migration {
  readonly id: string;
  readonly track: Track;
  /** `folders`: run folder by folder, within the cap. `workspace`: one change for the whole workspace. */
  readonly scope: 'folders' | 'workspace';
  readonly prerequisites: readonly Prerequisite[];
}

export interface Folder {
  readonly name: string;
  readonly components: number;
}

export interface Program {
  readonly migrations: readonly Migration[];
  readonly folders: readonly Folder[];
  /** The most components one pull request may touch. */
  readonly cap: number;
}

export interface PullRequest {
  readonly migration: string;
  readonly track: Track;
  readonly folders: readonly string[];
  readonly components: number;
  /** What runs before the next pull request starts. */
  readonly checkpoint: readonly string[];
}

export interface Scheduler {
  /** The migrations in an order that puts every prerequisite first; throws `CycleError` on a cycle. */
  order(program: Program): Migration[];
  /** One pull request per migration and folder group, in `order`'s order, each with its checkpoint. */
  schedule(program: Program): PullRequest[];
}

export class CycleError extends Error {
  readonly members: readonly string[];

  constructor(members: readonly string[]) {
    super(`the prerequisites contain a cycle: ${members.join(', ')}`);
    this.members = members;
  }
}

const docs = (id: string): Prerequisite => ({ id, source: 'docs' });
const recommendation = (id: string): Prerequisite => ({ id, source: 'recommendation' });

// Declared in an order that is not a valid run order, so the two schedulers have work to do and choose differently.
export const program: Program = {
  cap: 50,
  folders: [
    { name: 'orders', components: 40 },
    { name: 'billing', components: 25 },
    { name: 'shared', components: 30 },
    { name: 'admin', components: 12 },
    { name: 'reports', components: 20 },
  ],
  migrations: [
    { id: 'zoneless', track: 'components', scope: 'workspace', prerequisites: [docs('onpush-review'), docs('no-ngzone-waits')] },
    { id: 'route-lazy-loading', track: 'components', scope: 'folders', prerequisites: [docs('standalone')] },
    { id: 'onpush-review', track: 'components', scope: 'folders', prerequisites: [recommendation('signal-apis')] },
    { id: 'control-flow', track: 'components', scope: 'folders', prerequisites: [] },
    { id: 'application-builder', track: 'builder', scope: 'workspace', prerequisites: [] },
    { id: 'standalone', track: 'components', scope: 'folders', prerequisites: [] },
    { id: 'signal-apis', track: 'components', scope: 'folders', prerequisites: [] },
    { id: 'no-ngzone-waits', track: 'components', scope: 'folders', prerequisites: [] },
    { id: 'inject', track: 'components', scope: 'folders', prerequisites: [] },
    { id: 'vitest-runner', track: 'tests', scope: 'workspace', prerequisites: [] },
    { id: 'animations-to-css', track: 'animations', scope: 'workspace', prerequisites: [] },
  ],
};
