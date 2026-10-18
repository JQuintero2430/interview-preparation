// Section 13: our sort, mirroring the read algorithm (ng-packagr 22.2.1, package.transform.js,
// scheduleEntryPoints: count each entry point's unbuilt dependencies, build the ones at zero, repeat).
// A graph maps each node to the nodes it imports; the result lists dependencies first.
import { reverse, type ProjectGraph } from './affected';

export function toposort(graph: ProjectGraph): string[] {
  const dependents = reverse(graph);
  const pending = new Map(Object.entries(graph).map(([name, deps]) => [name, deps.length]));
  const ready = [...pending].filter(([, count]) => count === 0).map(([name]) => name);
  const order: string[] = [];
  for (let name = ready.shift(); name !== undefined; name = ready.shift()) {
    order.push(name);
    pending.delete(name);
    for (const dependent of dependents[name] ?? []) {
      const count = (pending.get(dependent) ?? 0) - 1;
      pending.set(dependent, count);
      if (count === 0) ready.push(dependent);
    }
  }
  if (pending.size > 0) throw new Error(`Dependency cycle among: ${[...pending.keys()].join(', ')}`);
  return order;
}
