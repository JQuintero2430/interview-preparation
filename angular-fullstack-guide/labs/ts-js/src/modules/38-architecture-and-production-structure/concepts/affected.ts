// Section 7: the algorithm read from nx 23.3.0 (filterAffected), run on our own code.
// A graph maps each project to the projects it imports; affected = touched projects plus every
// project that reaches one of them, found by walking the reversed edges.
export type ProjectGraph = Readonly<Record<string, readonly string[]>>;

export function reverse(graph: ProjectGraph): ProjectGraph {
  const reversed: Record<string, string[]> = Object.fromEntries(Object.keys(graph).map((name) => [name, []]));
  for (const [source, targets] of Object.entries(graph)) {
    for (const target of targets) reversed[target]?.push(source);
  }
  return reversed;
}

export function affected(graph: ProjectGraph, touched: readonly string[]): string[] {
  const reversed = reverse(graph);
  const visited = new Set<string>();
  const visit = (name: string): void => {
    if (visited.has(name)) return;
    if (!(name in reversed)) throw new Error(`Invalid project name is detected: "${name}"`);
    visited.add(name);
    reversed[name]?.forEach(visit);
  };
  touched.forEach(visit);
  return [...visited].sort();
}
