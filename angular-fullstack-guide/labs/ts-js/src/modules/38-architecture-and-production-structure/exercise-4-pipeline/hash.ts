// Exercise 38.4: a task's cache key, modeled on (not a copy of) nx 23.3.0 task-hasher.js:
// the command, the global inputs, the project's files and, recursively, its dependencies' inputs.
// SHA-256 over contents only: never the clock, an mtime or a commit.
import type { Files, Workspace } from './graph';

// A variable specifier keeps node:crypto out of the bundler's static graph (the lab has no @types/node).
const cryptoSpecifier = 'node:crypto';
const { createHash } = (await import(cryptoSpecifier)) as {
  createHash: (algorithm: 'sha256') => { update(data: string): { digest(encoding: 'hex'): string } };
};

export const sha256 = (text: string): string => createHash('sha256').update(text).digest('hex');

export function hasher(ws: Workspace, files: Files): (task: string) => string {
  const contents = (paths: readonly string[]) => [...paths].sort().map((path) => [path, files[path] ?? null]);
  const globals = sha256(JSON.stringify(contents(ws.globalInputs)));
  const projectHashes = new Map<string, string>();

  const projectHash = (name: string): string => {
    const known = projectHashes.get(name);
    if (known !== undefined) return known;
    const project = ws.projects[name];
    if (!project) throw new Error(`Unknown project: ${name}`);
    const own = contents(Object.keys(files).filter((path) => path.startsWith(`${project.root}/`)));
    const deps = [...project.deps].sort().map((dep) => [dep, projectHash(dep)]);
    const hash = sha256(JSON.stringify([own, deps]));
    projectHashes.set(name, hash);
    return hash;
  };

  return (task) => {
    const at = task.lastIndexOf(':');
    const project = task.slice(0, at);
    const target = task.slice(at + 1);
    return sha256(JSON.stringify([project, target, globals, projectHash(project)]));
  };
}
