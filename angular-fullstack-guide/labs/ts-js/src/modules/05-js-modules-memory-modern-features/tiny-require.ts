/** Source files of an in-memory project, keyed by absolute path, such as `'/src/a.cjs'`. */
export type SourceFiles = Readonly<Record<string, string>>;

interface LoadedModule {
  exports: unknown;
}

const WRAPPER_PARAMETERS = ['exports', 'require', 'module', '__filename', '__dirname'];

/**
 * A minimal CommonJS loader over in-memory sources: wrapper function, module cache and cycles as in Node.
 * @param files The project's sources.
 * @returns A `require` that takes absolute paths; inside modules, `require` also resolves relative paths.
 */
export function createRequire(files: SourceFiles): (path: string) => unknown {
  const cache = new Map<string, LoadedModule>();

  const load = (filename: string): unknown => {
    const cached = cache.get(filename);
    if (cached) return cached.exports;

    const source = files[filename];
    if (source === undefined) {
      throw Object.assign(new Error(`Cannot find module '${filename}'`), { code: 'MODULE_NOT_FOUND' });
    }

    const module: LoadedModule = { exports: {} };
    // Cached before the body runs: this is what hands a cycle the unfinished exports object.
    cache.set(filename, module);
    const dirname = filename.slice(0, filename.lastIndexOf('/')) || '/';
    const localRequire = (specifier: string): unknown => load(resolve(specifier, filename));
    const body = new Function(...WRAPPER_PARAMETERS, source);
    try {
      body.call(module.exports, module.exports, localRequire, module, filename, dirname);
    } catch (error) {
      // Like Node, forget a module that failed, so a later require runs it again.
      cache.delete(filename);
      throw new Error(`Failed to load ${filename}`, { cause: error });
    }
    return module.exports;
  };

  return (path) => load(resolve(path, '/'));
}

function resolve(specifier: string, from: string): string {
  return new URL(specifier, `file://${from}`).pathname;
}
