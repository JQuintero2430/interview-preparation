// Variant a: evaluate each import on its own; reachability is a fresh walk per import.
import { allowsTarget, appliesTo, bannedTagsOn, finding, type Constraint } from '../constraints';
import { projectOf, resolveImport, specifiersOf, type Project, type Tree } from '../imports';

/** The projects reachable from `start` (itself included), found by re-reading the project's files. */
function reachableFrom(tree: Tree, start: Project, seen = new Set<Project>()): Set<Project> {
  if (seen.has(start)) return seen;
  seen.add(start);
  for (const file of tree.files) {
    if (projectOf(tree.projects, file.path) !== start) continue;
    for (const specifier of specifiersOf(file.text)) {
      const hit = resolveImport(tree, file, specifier);
      if (hit) reachableFrom(tree, hit.target, seen);
    }
  }
  return seen;
}

export function check(tree: Tree, constraints: Constraint[]): string[] {
  const found = new Set<string>();
  for (const file of tree.files) {
    const source = projectOf(tree.projects, file.path);
    if (!source) continue;
    const matching = constraints.filter((constraint) => appliesTo(constraint, source));
    for (const specifier of specifiersOf(file.text)) {
      const hit = resolveImport(tree, file, specifier);
      if (!hit || hit.target === source) continue;
      const { target } = hit;
      if (hit.relative && target.alias !== undefined) found.add(finding.relative(source, target));
      if (matching.length === 0) found.add(finding.noConstraint(source));
      for (const constraint of matching) {
        if (!allowsTarget(constraint, target)) found.add(finding.onlyDepend(source, target));
        for (const reached of reachableFrom(tree, target)) {
          if (reached === source) continue;
          for (const tag of bannedTagsOn(constraint, reached)) found.add(finding.banned(source, reached, tag));
        }
      }
    }
  }
  return [...found].sort();
}
