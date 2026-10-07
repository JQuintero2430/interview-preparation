import { createRequire, type SourceFiles } from './tiny-require';
import { runNode, stdoutLines } from '../../outputs/run-node';

// A variable specifier keeps node:fs out of the bundler's static graph.
const fsSpecifier = 'node:fs';
const { readFileSync } = (await import(fsSpecifier)) as { readFileSync: (path: URL, encoding: 'utf8') => string };

const fixture = (path: string) => new URL(`./fixtures/${path}`, import.meta.url);

/** Loads fixture files into an in-memory project, each under `/<name>`. */
const project = (folder: string, names: string[]): SourceFiles =>
  Object.fromEntries(names.map((name) => [`/${name}`, readFileSync(fixture(`${folder}/${name}`), 'utf8')]));

/** Runs `body` and returns what it printed with console.log, formatted as Node prints simple values. */
const captureConsole = (body: () => void): string[] => {
  const lines: string[] = [];
  const spy = vi.spyOn(console, 'log').mockImplementation((...args: unknown[]) => {
    lines.push(args.map(String).join(' '));
  });
  try {
    body();
  } finally {
    spy.mockRestore();
  }
  return lines;
};

describe('E05.3 tiny CommonJS loader', () => {
  afterEach(() => {
    Reflect.deleteProperty(globalThis, 'runs');
  });

  it('a module runs inside a wrapper that receives exports, require, module, __filename and __dirname, with this equal to module.exports', () => {
    const require = createRequire({
      '/src/info.cjs': 'module.exports = [this === exports, typeof require, module.exports === exports, __filename, __dirname];',
    });
    expect(require('/src/info.cjs')).toEqual([true, 'function', true, '/src/info.cjs', '/src']);
  });

  it('a module body runs once, and later requires return the cached exports', () => {
    let runs = 0;
    Reflect.set(globalThis, 'countRun', () => (runs += 1));
    const require = createRequire({ '/counter.cjs': 'countRun(); exports.created = {};' });
    const first = require('/counter.cjs');
    expect([require('/counter.cjs'), runs]).toEqual([first, 1]);
    expect(require('/counter.cjs')).toBe(first);
    Reflect.deleteProperty(globalThis, 'countRun');
  });

  it('reassigning module.exports replaces the export, while reassigning exports does not', () => {
    const require = createRequire({
      '/replaced.cjs': 'module.exports = () => "replaced";',
      '/lost.cjs': 'exports = () => "lost"; exports.ignored = true;',
    });
    const replaced = require('/replaced.cjs') as () => string;
    expect([replaced(), require('/lost.cjs')]).toEqual(['replaced', {}]);
  });

  it('in a cycle, require returns the unfinished exports object, matching what real Node prints for the same files', () => {
    const real = stdoutLines(runNode(fixture('section-2/cycle/main.cjs')));
    const require = createRequire(project('section-2/cycle', ['main.cjs', 'a.cjs', 'b.cjs']));
    expect(captureConsole(() => require('/main.cjs'))).toEqual(real);
    expect(real).toEqual(['b sees a.loaded = false', 'a sees b.loaded = true']);
  });

  it('a missing module throws an error with code MODULE_NOT_FOUND', () => {
    const require = createRequire({});
    expect(() => require('/nowhere.cjs')).toThrow(expect.objectContaining({ code: 'MODULE_NOT_FOUND' }));
  });

  it('a module whose body throws is reported with the original error as cause, and is not cached, so a later require runs it again as in real Node', () => {
    const real = stdoutLines(runNode(fixture('tiny-require/main.cjs')));
    expect(real).toEqual(['first require: boom', 'second require ran the body again: runs = 2']);

    const require = createRequire(project('tiny-require', ['flaky.cjs']));
    const failure = (() => {
      try {
        require('/flaky.cjs');
        return undefined;
      } catch (error) {
        return error as Error;
      }
    })();
    expect([failure?.message, (failure?.cause as Error).message]).toEqual(['Failed to load /flaky.cjs', 'boom']);
    expect(() => require('/flaky.cjs')).not.toThrow();
    expect(Reflect.get(globalThis, 'runs')).toBe(2);
  });
});
