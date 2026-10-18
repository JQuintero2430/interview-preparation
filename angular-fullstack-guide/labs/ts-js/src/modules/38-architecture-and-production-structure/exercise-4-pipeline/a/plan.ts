// Variant a: Kahn's algorithm in waves. Every wave holds the tasks whose last dependency ran in the
// previous wave (they could run in parallel); each wave is sorted by name, so the order is stable.
import { reverse, type ProjectGraph } from '../../concepts/affected';

export function order(tasks: ProjectGraph): string[] {
  const dependents = reverse(tasks);
  const pending = new Map(Object.entries(tasks).map(([task, deps]) => [task, deps.length]));
  const result: string[] = [];
  let wave = [...pending].filter(([, count]) => count === 0).map(([task]) => task);
  while (wave.length > 0) {
    wave.sort();
    result.push(...wave);
    const next: string[] = [];
    for (const task of wave) {
      pending.delete(task);
      for (const dependent of dependents[task] ?? []) {
        const count = (pending.get(dependent) ?? 0) - 1;
        pending.set(dependent, count);
        if (count === 0) next.push(dependent);
      }
    }
    wave = next;
  }
  if (pending.size > 0) throw new Error(`Dependency cycle among: ${[...pending.keys()].sort().join(', ')}`);
  return result;
}
