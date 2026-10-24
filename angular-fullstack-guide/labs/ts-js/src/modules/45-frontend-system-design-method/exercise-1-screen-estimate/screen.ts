// Exercise 45.1: the types and helpers both variants share (a: memoized depth-first search, b: Kahn's topological
// order). Our model, not Lighthouse's code: the profiles and the formula come from concepts/estimate.ts (M45 F5, read
// only). Like that estimator it ignores CPU, connection setup and bandwidth shared by parallel requests; here the
// bytes of all requests are added up as if they shared one connection's throughput, and the server time is a flat cost.
import { PROFILES, transferTime } from '../concepts/estimate';

export interface RequestSpec {
  readonly id: string;
  readonly bytes: number;
  /** Ids of the requests that must finish before this one starts. */
  readonly dependsOn: readonly string[];
}

export interface ScreenSpec {
  readonly requests: readonly RequestSpec[];
  /** Server time added once to every profile's estimate, in milliseconds. */
  readonly serverMs: number;
}

export interface Budget {
  readonly targetMs: number;
}

export interface Verdict {
  criticalPath: string[];
  roundTrips: number;
  totalBytes: number;
  timeMs: Record<string, number>;
  overBudget: { profile: string; overByMs: number }[];
}

/** Each request's dependencies by id; throws when a dependency names a request the screen does not have. */
export function indexDependencies(screen: ScreenSpec): ReadonlyMap<string, readonly string[]> {
  const known = new Set(screen.requests.map((request) => request.id));
  for (const request of screen.requests) {
    const missing = request.dependsOn.find((id) => !known.has(id));
    if (missing !== undefined) throw new Error(`unknown request "${missing}" (needed by "${request.id}")`);
  }
  return new Map<string, readonly string[]>(screen.requests.map((request): [string, readonly string[]] => [request.id, request.dependsOn]));
}

/** The longest chain; the first one wins a tie, so the answer does not depend on the engine. */
export function longest(chains: readonly (readonly string[])[]): readonly string[] {
  return chains.reduce<readonly string[]>((best, chain) => (chain.length > best.length ? chain : best), []);
}

/** Every profile's time is the estimator's transfer time for the whole screen, plus the server time. */
export function toVerdict(screen: ScreenSpec, budget: Budget, criticalPath: readonly string[]): Verdict {
  const totalBytes = screen.requests.reduce((sum, request) => sum + request.bytes, 0);
  const roundTrips = criticalPath.length;
  const profiles = Object.values(PROFILES);
  const timeMs = Object.fromEntries(profiles.map((profile) => [profile.name, transferTime(profile, totalBytes, roundTrips) + screen.serverMs]));
  const overBudget = profiles
    .map((profile) => ({ profile: profile.name, overByMs: (timeMs[profile.name] ?? 0) - budget.targetMs }))
    .filter((entry) => entry.overByMs > 0);
  return { criticalPath: [...criticalPath], roundTrips, totalBytes, timeMs, overBudget };
}

/** Fuses the named requests into one: their bytes add up, and the dependencies on any of them point at the new one. */
export function mergeRequests(screen: ScreenSpec, ids: readonly string[], mergedId: string): ScreenSpec {
  const group = new Set(ids);
  const members = screen.requests.filter((request) => group.has(request.id));
  const redirect = (dependsOn: readonly string[]): string[] => [...new Set(dependsOn.map((id) => (group.has(id) ? mergedId : id)))];
  const merged: RequestSpec = {
    id: mergedId,
    bytes: members.reduce((sum, request) => sum + request.bytes, 0),
    dependsOn: redirect(members.flatMap((request) => request.dependsOn)).filter((id) => id !== mergedId),
  };
  const others = screen.requests.filter((request) => !group.has(request.id)).map((request) => ({ ...request, dependsOn: redirect(request.dependsOn) }));
  return { ...screen, requests: [...others, merged] };
}
