// Variant b (our alternative): depth-first order with memoization. Visit migrations as declared; visit a migration's
// prerequisites first and emit it after them. `done` is the memo; `path` is what a cycle is read from.
import { pullRequestsIn } from '../batches';
import { CycleError } from '../program';
import type { Migration, Program, Scheduler } from '../program';

function order(program: Program): Migration[] {
  const byId = new Map(program.migrations.map((m) => [m.id, m]));
  const done = new Set<string>();
  const path: string[] = [];
  const ordered: Migration[] = [];

  const visit = (migration: Migration): void => {
    if (done.has(migration.id)) return;
    const seenAt = path.indexOf(migration.id);
    if (seenAt >= 0) throw new CycleError(path.slice(seenAt));
    path.push(migration.id);
    for (const { id } of migration.prerequisites) {
      const prerequisite = byId.get(id);
      if (prerequisite === undefined) throw new Error(`${migration.id} needs ${id}, which the program does not have`);
      visit(prerequisite);
    }
    path.pop();
    done.add(migration.id);
    ordered.push(migration);
  };

  program.migrations.forEach(visit);
  return ordered;
}

export const scheduler: Scheduler = { order, schedule: (program) => pullRequestsIn(order(program), program) };
