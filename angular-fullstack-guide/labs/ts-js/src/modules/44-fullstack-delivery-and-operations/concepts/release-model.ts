// Section 7 model: which pipeline a change runs, whether a description change breaks old clients, which image may reach
// production, and in what order a breaking change ships. Our model, not a CI service's code. It mirrors, all read
// 2026-10-22: GitHub Actions `paths` filters (a workflow runs when at least one changed file matches), Docker's image
// digest ("a unique, cryptographic identifier (SHA-256 hash) representing the content of a Docker image", "a digest is
// immutable") against tags ("Image tags are mutable"), module 41 section 4's rules for breaking changes (the same
// description-diff idea as contract-drift.ts in module 41, which compares one client schema instead) and module 37
// section 6 (a tab keeps the version it loaded until it reloads). Not modeled: enum values, nested schemas, operations
// added or removed by path and method, registries, rollbacks. Nothing here reads a clock, a repository or the network:
// days are numbers the caller passes.

// A variable specifier keeps node:crypto out of the bundler's static graph (the lab has no @types/node).
const cryptoSpecifier = 'node:crypto';
const crypto: { createHash(algorithm: 'sha256'): { update(data: string): { digest(encoding: 'hex'): string } } } =
  await import(cryptoSpecifier);

export type Pipeline = 'frontend' | 'backend';

const PIPELINES: readonly Pipeline[] = ['frontend', 'backend'];

/** The folders each pipeline watches: `contract/` holds the OpenAPI description, so it appears in both. */
const PATH_FILTERS: Readonly<Record<Pipeline, readonly string[]>> = {
  frontend: ['frontend/', 'contract/'],
  backend: ['backend/', 'contract/'],
};

/** Lists the pipelines with at least one changed file under a watched folder; a change to a README selects none. */
export function selectPipelines(changed: readonly string[]): Pipeline[] {
  return PIPELINES.filter((pipeline) =>
    changed.some((file) => PATH_FILTERS[pipeline].some((folder) => file.startsWith(folder))),
  );
}

/** One object schema as our checker reads it: property name to type name, plus the required names. */
export interface ObjectSchema {
  readonly properties: Readonly<Record<string, string>>;
  readonly required: readonly string[];
}

/** The part of an OpenAPI description our checker reads: the request and response bodies by name. */
export interface Description {
  readonly requests: Readonly<Record<string, ObjectSchema>>;
  readonly responses: Readonly<Record<string, ObjectSchema>>;
}

type Bodies = Readonly<Record<string, ObjectSchema>>;

/** A deployed client reads every response property it knew, so removing one or changing its type breaks it. */
function responseBreaks(before: Bodies, after: Bodies): string[] {
  const problems: string[] = [];
  for (const [name, old] of Object.entries(before)) {
    const next: ObjectSchema | undefined = after[name];
    if (!next) {
      problems.push(`responses.${name}: removed`);
      continue;
    }
    for (const [property, type] of Object.entries(old.properties)) {
      const nextType: string | undefined = next.properties[property];
      if (nextType === undefined) problems.push(`responses.${name}.${property}: removed`);
      else if (nextType !== type) problems.push(`responses.${name}.${property}: ${type} became ${nextType}`);
    }
  }
  return problems;
}

/** A deployed client sends the request it knew, so a newly required property or a changed type breaks it. */
function requestBreaks(before: Bodies, after: Bodies): string[] {
  const problems: string[] = [];
  for (const [name, old] of Object.entries(before)) {
    const next: ObjectSchema | undefined = after[name];
    if (!next) {
      problems.push(`requests.${name}: removed`);
      continue;
    }
    for (const [property, type] of Object.entries(next.properties)) {
      const oldType: string | undefined = old.properties[property];
      const wasRequired = old.required.includes(property);
      if (next.required.includes(property) && !wasRequired) {
        problems.push(`requests.${name}.${property}: now required`);
      } else if (oldType !== undefined && oldType !== type) {
        problems.push(`requests.${name}.${property}: ${oldType} became ${type}`);
      }
    }
  }
  return problems;
}

/** Lists what the new description breaks for clients built against the old one; an empty list passes the gate. */
export function breakingChanges(before: Description, after: Description): string[] {
  return [...responseBreaks(before.responses, after.responses), ...requestBreaks(before.requests, after.requests)];
}

export type Stage = 'build' | 'staging' | 'production';

/** The stages in order: an image reaches one only after it passed the one before. */
export const STAGES: readonly Stage[] = ['build', 'staging', 'production'];

/** The stages each image digest has passed. */
export type Passed = Readonly<Partial<Record<string, readonly Stage[]>>>;

/** Tag name to digest: a tag is a movable label. */
export type Tags = Readonly<Partial<Record<string, string>>>;

/** A digest names content: the same content gives the same digest, any change gives another. */
export function digestOf(content: string): string {
  return `sha256:${crypto.createHash('sha256').update(content).digest('hex')}`;
}

/** Points a tag at another digest, as a rebuild that reuses the tag does; digests already recorded are untouched. */
export function moveTag(tags: Tags, tag: string, digest: string): Tags {
  return { ...tags, [tag]: digest };
}

/** Reads where a tag points now. */
export function resolveTag(tags: Tags, tag: string): string {
  const digest = tags[tag];
  if (digest === undefined) throw new Error(`Unknown tag: ${tag}`);
  return digest;
}

/** Records that this exact digest passed the stage; refuses it unless it passed the previous stage first. */
export function promote(passed: Passed, digest: string, stage: Stage): Passed {
  const previous = STAGES[STAGES.indexOf(stage) - 1];
  const done = passed[digest] ?? [];
  if (previous !== undefined && !done.includes(previous)) {
    throw new Error(`${digest} did not pass ${previous}, so it cannot reach ${stage}`);
  }
  return { ...passed, [digest]: [...done.filter((known) => known !== stage), stage] };
}

/** How long a deployed client may still be running: the longer of an open tab and a cached bundle, in days. */
export function supportWindowDays(oldTabDays: number, cachedBundleDays: number): number {
  return Math.max(oldTabDays, cachedBundleDays);
}

export interface ReleaseOptions {
  readonly apiDay: number;
  readonly clientDay: number;
  readonly oldTabDays: number;
  readonly cachedBundleDays: number;
}

export type ReleaseAction = 'deploy the API that accepts old and new' | 'deploy the client' | 'remove the old field';

export interface ReleaseStep {
  readonly action: ReleaseAction;
  readonly day: number;
}

/** Expand and contract: the expanded API first, then the client, then the removal once the support window has passed. */
export function releasePlan(options: ReleaseOptions): ReleaseStep[] {
  const { apiDay, clientDay, oldTabDays, cachedBundleDays } = options;
  if (clientDay < apiDay) throw new Error('The client cannot ship before the API that accepts old and new');
  return [
    { action: 'deploy the API that accepts old and new', day: apiDay },
    { action: 'deploy the client', day: clientDay },
    { action: 'remove the old field', day: clientDay + supportWindowDays(oldTabDays, cachedBundleDays) },
  ];
}

/** True from the day the plan's removal step is due. */
export function canRemove(plan: readonly ReleaseStep[], day: number): boolean {
  const removal = plan.find((step) => step.action === 'remove the old field');
  return removal !== undefined && day >= removal.day;
}
