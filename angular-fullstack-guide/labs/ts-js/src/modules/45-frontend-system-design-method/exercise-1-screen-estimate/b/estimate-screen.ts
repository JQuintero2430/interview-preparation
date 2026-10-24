// Exercise 45.1, variant b (the alternative): Kahn's algorithm. Requests are taken in an order where every request
// follows its prerequisites; whatever cannot be taken is on a cycle or waits behind one.
import { indexDependencies, longest, toVerdict, type Budget, type ScreenSpec, type Verdict } from '../screen';

export function estimateScreen(screen: ScreenSpec, budget: Budget): Verdict {
  const dependencies = indexDependencies(screen);
  const waiting = new Map([...dependencies].map(([id, needs]): [string, number] => [id, needs.length]));
  const dependents = new Map<string, string[]>();
  for (const [id, needs] of dependencies) for (const need of needs) dependents.set(need, [...(dependents.get(need) ?? []), id]);

  const chains = new Map<string, readonly string[]>();
  const queue = [...waiting].filter(([, count]) => count === 0).map(([id]) => id);
  for (let id = queue.shift(); id !== undefined; id = queue.shift()) {
    chains.set(id, [...longest((dependencies.get(id) ?? []).map((need) => chains.get(need) ?? [])), id]);
    for (const next of dependents.get(id) ?? []) {
      const left = (waiting.get(next) ?? 0) - 1;
      waiting.set(next, left);
      if (left === 0) queue.push(next);
    }
  }
  if (chains.size < dependencies.size) throw new Error(`dependency cycle among: ${cycleMembers([...dependencies.keys()].filter((id) => !chains.has(id)), dependents).join(', ')}`);

  return toVerdict(screen, budget, longest([...chains.values()]));
}

// Requests that merely wait behind a cycle have no stuck dependents; drop them until only the cycle's own members stay.
function cycleMembers(stuck: readonly string[], dependents: ReadonlyMap<string, readonly string[]>): readonly string[] {
  const kept = stuck.filter((id) => (dependents.get(id) ?? []).some((next) => stuck.includes(next)));
  return kept.length === stuck.length ? stuck : cycleMembers(kept, dependents);
}
