// Exercise 38.3: two boundary checkers over committed fixture trees and the real sample-app tree (read only).
import { exerciseConstraints } from './constraints';
import type { Project, SourceFile, Tree } from './imports';
import { check as checkA } from './a/check';
import { check as checkB } from './b/check';

// A variable specifier keeps node:fs out of the bundler's static graph (the lab has no @types/node).
const fsSpecifier = 'node:fs';
const { readFileSync, readdirSync } = (await import(fsSpecifier)) as {
  readFileSync: (path: URL, encoding: 'utf8') => string;
  readdirSync: (path: URL, options: { withFileTypes: true }) => { name: string; isDirectory(): boolean }[];
};

const treeOk = new URL('./fixtures/tree-ok/', import.meta.url);
const treeBad = new URL('./fixtures/tree-bad/', import.meta.url);
const sampleApp = new URL(
  '../../../../../angular/src/app/modules/38-architecture-and-production-structure/sample-app/',
  import.meta.url,
);

/** Walks a folder: every `.ts` file, and (when asked) a project for every folder with a tags.json. */
function load(dir: URL, prefix = '', tree: Tree = { projects: [], files: [] }): Tree {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = `${prefix}${entry.name}`;
    if (entry.isDirectory()) load(new URL(`${entry.name}/`, dir), `${path}/`, tree);
    else if (entry.name === 'tags.json') {
      const manifest: Omit<Project, 'root'> = JSON.parse(readFileSync(new URL(entry.name, dir), 'utf8'));
      tree.projects.push({ ...manifest, root: prefix.replace(/\/$/, '') });
    } else if (entry.name.endsWith('.ts')) tree.files.push({ path, text: readFileSync(new URL(entry.name, dir), 'utf8') });
  }
  return tree;
}

/** The sample app has no tags.json files (it is read only), so its projects follow its folder layout. */
function sampleProjects(): Project[] {
  const projects: Project[] = [
    { name: 'app', root: '', tags: ['type:app'] },
    { name: 'core', root: 'core', tags: ['type:core'] },
    { name: 'shared-ui', root: 'shared/ui', tags: ['type:ui', 'scope:shared'] },
    { name: 'shared-util', root: 'shared/util', tags: ['type:util', 'scope:shared'] },
  ];
  for (const scope of ['orders', 'catalog']) {
    projects.push({ name: `${scope}-routes`, root: `features/${scope}`, tags: ['type:feature', `scope:${scope}`] });
    for (const type of ['feature', 'ui', 'data-access']) {
      projects.push({ name: `${scope}-${type}`, root: `features/${scope}/${type}`, tags: [`type:${type}`, `scope:${scope}`] });
    }
  }
  return projects;
}

describe.each([
  ['a (per-import)', checkA],
  ['b (graph first)', checkB],
])('Exercise 38.3 · variant %s', (_name, check) => {
  const bad = load(treeBad);

  it('reports a ui project that imports a data-access project', () => {
    const found = check(bad, exerciseConstraints);
    expect(found).toContain('only-depend: orders-ui -> orders-data');
    expect(check(load(treeOk), exerciseConstraints)).toEqual([]);
  });

  it('reports a relative import that crosses into another project', () => {
    expect(check(bad, exerciseConstraints)).toContain('relative-import: orders-feature -> orders-ui');
  });

  it('reports a dependency on a banned tag reached through another project', () => {
    const found = check(bad, exerciseConstraints);
    expect(found).toContain('banned-tag: catalog-ui -> orders-data (type:data-access)');
    expect(found.filter((line) => line.startsWith('only-depend: catalog-ui'))).toEqual([]);
  });

  it('reports a project whose tags match no constraint when it has dependencies', () => {
    expect(check(bad, exerciseConstraints)).toContain('no-constraint: tools');
    expect(check(bad, exerciseConstraints)).not.toContain('no-constraint: orders-ui');
    // tree-ok has a `type:docs` project with no imports: no constraint matches it and nothing is reported.
    expect(load(treeOk).projects.some((p) => p.name === 'docs')).toBe(true);
  });

  it('finds no violation in the sample app\'s tree', () => {
    const files: SourceFile[] = load(sampleApp).files;
    expect(files.length).toBeGreaterThan(15);
    expect(files.map((file) => file.path)).toContain('features/orders/ui/order-list.ts');
    expect(check({ projects: sampleProjects(), files }, exerciseConstraints)).toEqual([]);
  });
});

it('both variants report the same findings on the bad tree', () => {
  const bad = load(treeBad);
  const found = checkA(bad, exerciseConstraints);
  expect(found.length).toBeGreaterThanOrEqual(4);
  expect(checkB(bad, exerciseConstraints)).toEqual(found);
});
