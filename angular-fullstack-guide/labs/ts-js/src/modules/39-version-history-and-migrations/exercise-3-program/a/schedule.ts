// Variant a (our solution): Kahn's algorithm. Repeatedly take the first declared migration with no unmet
// prerequisite; a round that finds none means the rest are stuck behind a cycle.
import { pullRequestsIn } from '../batches';
import { CycleError } from '../program';
import type { Migration, Program, Scheduler } from '../program';

function order(program: Program): Migration[] {
  const unmet = new Map<string, Set<string>>(program.migrations.map((m): [string, Set<string>] => [m.id, new Set(m.prerequisites.map((p) => p.id))]));
  const ordered: Migration[] = [];
  while (unmet.size > 0) {
    const next = program.migrations.find((m) => unmet.get(m.id)?.size === 0);
    if (next === undefined) throw new CycleError(program.migrations.filter((m) => unmet.has(m.id)).map((m) => m.id));
    unmet.delete(next.id);
    for (const waiting of unmet.values()) waiting.delete(next.id);
    ordered.push(next);
  }
  return ordered;
}

export const scheduler: Scheduler = { order, schedule: (program) => pullRequestsIn(order(program), program) };
