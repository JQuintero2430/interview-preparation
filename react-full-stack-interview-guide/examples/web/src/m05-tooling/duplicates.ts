// Finds duplicate copies of one package in the JSON printed by `npm ls --json` (add `--long`
// to also get each node's physical `path`).

export type NpmLsNode = {
  name?: string;
  version?: string;
  path?: string;
  dependencies?: Record<string, NpmLsNode>;
};

export type Copy = {
  version: string;
  /** Physical install location, when the tree was produced with `--long`. */
  physicalPath: string | undefined;
  /** Dependency chains that lead to this copy, e.g. "app > react-dom > react". */
  requiredBy: string[];
};

export type DuplicateReport = { name: string; copies: Copy[] };

function walk(node: NpmLsNode, target: string, chain: string[], found: Array<{ node: NpmLsNode; chain: string[] }>) {
  for (const [name, child] of Object.entries(node.dependencies ?? {})) {
    const next = [...chain, name];
    if (name === target) found.push({ node: child, chain: next });
    walk(child, target, next, found);
  }
}

/**
 * Returns null when there is at most one physical copy of `target`.
 * Two entries with the same version are only a duplicate when their `path`s differ,
 * which is why the same version installed twice still breaks hooks.
 */
export function findDuplicates(root: NpmLsNode, target = 'react'): DuplicateReport | null {
  const found: Array<{ node: NpmLsNode; chain: string[] }> = [];
  walk(root, target, [root.name ?? '(root)'], found);

  const copies = new Map<string, Copy>();
  for (const { node, chain } of found) {
    const version = node.version ?? 'unknown';
    const key = node.path ?? `version:${version}`;
    const chainText = chain.join(' > ');
    const existing = copies.get(key);
    if (existing) existing.requiredBy.push(chainText);
    else copies.set(key, { version, physicalPath: node.path, requiredBy: [chainText] });
  }
  if (copies.size <= 1) return null;
  const sorted = [...copies.values()].sort((a, b) => a.version.localeCompare(b.version));
  return { name: target, copies: sorted };
}
