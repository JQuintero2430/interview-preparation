// Section 2 claims, each run in a real node process (Vitest's own module transform is not Node's loader).
import { runNode, stdoutLines } from '../../outputs/run-node';

const fixture = (path: string) => new URL(`./fixtures/section-2/${path}`, import.meta.url);

describe('Module 05 · section 2: CommonJS, interop and import()', () => {
  it('Section 2: require returns a value, so a copied primitive does not follow later changes', () => {
    expect(stdoutLines(runNode(fixture('copy/main.cjs')))).toEqual(['before 0', 'after 0']);
  });

  it('Section 2: CommonJS code runs inside a wrapper function that receives require, module, exports and __dirname', () => {
    expect(stdoutLines(runNode(fixture('wrapper/main.cjs')))).toEqual(['function object object string', 'true true']);
  });

  it('Section 2: in a CommonJS cycle, require returns the unfinished exports object', () => {
    expect(stdoutLines(runNode(fixture('cycle/main.cjs')))).toEqual([
      'b sees a.loaded = false',
      'a sees b.loaded = true',
    ]);
  });

  it('Section 2: import of CommonJS gives module.exports as default plus the named exports static analysis finds', () => {
    expect(stdoutLines(runNode(fixture('import-cjs/main.mjs')))).toEqual([
      'hello esm 2',
      "[ 'greet', 'version', 'computed' ]",
      "[ 'default', 'greet', 'module.exports', 'version' ]",
    ]);
  });

  it('Section 2: a computed CommonJS export is not detected as a named export', () => {
    const run = runNode(fixture('import-cjs/named-missing.mjs'));
    expect(run.stderr).toContain("SyntaxError: Named export 'computed' not found.");
    expect(run.status).toBe(1);
  });

  it('Section 2: require of an ES module returns its namespace, and throws ERR_REQUIRE_ASYNC_MODULE for top-level await', () => {
    const run = runNode(fixture('require-esm/main.cjs'));
    expect(stdoutLines(run)).toEqual(['default value named value [object Module]', 'ERR_REQUIRE_ASYNC_MODULE']);
    expect(run.stderr).toBe('');
  });

  it('Section 2: import() resolves to the same namespace each time, evaluates once, and rejects for a missing file', () => {
    expect(stdoutLines(runNode(fixture('dynamic/main.mjs')))).toEqual(['dep evaluated', 'true 42', 'ERR_MODULE_NOT_FOUND']);
  });

  it('Section 2: import() also works inside CommonJS', () => {
    expect(stdoutLines(runNode(fixture('dynamic/from-cjs.cjs')))).toEqual(['dep evaluated', 'from CommonJS 42']);
  });
});
