// Variant b: recursive depth-first with memoization. A task's level is one more than its deepest
// dependency's; sorting by level, then name, gives the same order as variant a's waves.
import type { ProjectGraph } from '../../concepts/affected';

export function order(tasks: ProjectGraph): string[] {
  const levels = new Map<string, number>();
  const onPath = new Set<string>();
  const levelOf = (task: string): number => {
    const known = levels.get(task);
    if (known !== undefined) return known;
    if (onPath.has(task)) throw new Error(`Dependency cycle among: ${[...onPath].join(', ')}`);
    onPath.add(task);
    const level = Math.max(-1, ...(tasks[task] ?? []).map(levelOf)) + 1;
    onPath.delete(task);
    levels.set(task, level);
    return level;
  };
  // Code-unit comparison, as Array.prototype.sort uses in variant a (localeCompare could differ on '-').
  const byName = (x: string, y: string): number => Number(x > y) - Number(x < y);
  return Object.keys(tasks)
    .map((task) => ({ task, level: levelOf(task) }))
    .sort((x, y) => x.level - y.level || byName(x.task, y.task))
    .map(({ task }) => task);
}
