// Variant b: build the project graph once, then check each edge and each reachable set.
import { allowsTarget, appliesTo, bannedTagsOn, finding, type Constraint } from '../constraints';
import { projectOf, resolveImport, specifiersOf, type Project, type Tree } from '../imports';

interface Graph {
  edges: Map<Project, Set<Project>>;
  /** Edges made by a relative specifier. */
  relativeEdges: Map<Project, Set<Project>>;
}

function buildGraph(tree: Tree): Graph {
  const edges = new Map<Project, Set<Project>>(tree.projects.map((p) => [p, new Set()]));
  const relativeEdges = new Map<Project, Set<Project>>(tree.projects.map((p) => [p, new Set()]));
  for (const file of tree.files) {
    const source = projectOf(tree.projects, file.path);
    if (!source) continue;
    for (const specifier of specifiersOf(file.text)) {
      const hit = resolveImport(tree, file, specifier);
      if (!hit || hit.target === source) continue;
      edges.get(source)?.add(hit.target);
      if (hit.relative) relativeEdges.get(source)?.add(hit.target);
    }
  }
  return { edges, relativeEdges };
}

/** Breadth-first from the project's direct dependencies; the project itself is excluded. */
function reachable(graph: Graph, from: Project): Set<Project> {
  const seen = new Set<Project>();
  const queue = [...(graph.edges.get(from) ?? [])];
  for (let next = queue.shift(); next; next = queue.shift()) {
    if (seen.has(next)) continue;
    seen.add(next);
    queue.push(...(graph.edges.get(next) ?? []));
  }
  seen.delete(from);
  return seen;
}

export function check(tree: Tree, constraints: Constraint[]): string[] {
  const graph = buildGraph(tree);
  const found: string[] = [];
  for (const [source, direct] of graph.edges) {
    if (direct.size === 0) continue;
    const matching = constraints.filter((constraint) => appliesTo(constraint, source));
    if (matching.length === 0) found.push(finding.noConstraint(source));
    for (const target of graph.relativeEdges.get(source) ?? []) {
      if (target.alias !== undefined) found.push(finding.relative(source, target));
    }
    for (const constraint of matching) {
      for (const target of direct) if (!allowsTarget(constraint, target)) found.push(finding.onlyDepend(source, target));
      for (const reached of reachable(graph, source)) {
        for (const tag of bannedTagsOn(constraint, reached)) found.push(finding.banned(source, reached, tag));
      }
    }
  }
  return [...new Set(found)].sort();
}
