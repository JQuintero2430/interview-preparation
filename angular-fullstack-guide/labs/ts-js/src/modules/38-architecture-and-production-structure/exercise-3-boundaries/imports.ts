// Exercise 38.3: read import specifiers with ts.preProcessFile and resolve each one to a project.
import ts from 'typescript';

export interface Project {
  name: string;
  /** Folder of the project, relative to the tree root; '' is the root itself. */
  root: string;
  tags: string[];
  /** Import name (like an npm scope path); a project with an alias must be imported through it. */
  alias?: string;
}
export interface SourceFile {
  path: string;
  text: string;
}
export interface Tree {
  projects: Project[];
  files: SourceFile[];
}
export interface Resolved {
  target: Project;
  relative: boolean;
}

/** Every specifier in the file, static `import` and `import()` alike (preProcessFile reads no types). */
export function specifiersOf(text: string): string[] {
  return ts.preProcessFile(text, true, true).importedFiles.map((imported) => imported.fileName);
}

function normalize(path: string): string {
  const parts: string[] = [];
  for (const part of path.split('/')) {
    if (part === '..') parts.pop();
    else if (part !== '.' && part !== '') parts.push(part);
  }
  return parts.join('/');
}

/** The project whose root is the longest folder prefix of the path. */
export function projectOf(projects: Project[], path: string): Project | undefined {
  return projects
    .filter((project) => project.root === '' || path.startsWith(`${project.root}/`))
    .sort((x, y) => y.root.length - x.root.length)[0];
}

/** Relative specifiers resolve by folder, aliased ones by alias; anything else is external and ignored. */
export function resolveImport(tree: Tree, from: SourceFile, specifier: string): Resolved | undefined {
  if (specifier.startsWith('.')) {
    const folder = from.path.split('/').slice(0, -1).join('/');
    const target = projectOf(tree.projects, normalize(`${folder}/${specifier}`));
    return target && { target, relative: true };
  }
  const target = tree.projects.find((p) => p.alias && (specifier === p.alias || specifier.startsWith(`${p.alias}/`)));
  return target && { target, relative: false };
}
