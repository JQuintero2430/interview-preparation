// Section 3 claims, each run in a real node process (Vitest's own module transform is not Node's loader).
import { runNode, stdoutLines } from '../../outputs/run-node';

const fixture = (path: string) => new URL(`./fixtures/section-3/${path}`, import.meta.url);

describe('Module 05 · section 3: import.meta and import attributes', () => {
  it('Section 3: import.meta gives the module its own URL, and Node adds filename, dirname and resolve', () => {
    expect(stdoutLines(runNode(fixture('meta.mjs')))).toEqual(['true true', 'true true', 'true']);
  });

  it('Section 3: a JSON module imported with { type: json } gives the parsed object as its default export', () => {
    expect(stdoutLines(runNode(fixture('json-with.mjs')))).toEqual(['lab-config 3']);
  });

  it('Section 3: without the attribute the import fails with ERR_IMPORT_ATTRIBUTE_MISSING', () => {
    const run = runNode(fixture('json-without.mjs'));
    expect(run.stderr).toContain('TypeError [ERR_IMPORT_ATTRIBUTE_MISSING]');
    expect(run.stderr).toContain('needs an import attribute of "type: json"');
    expect(run.status).toBe(1);
  });

  it('Section 3: a JSON module has no named exports', () => {
    const run = runNode(fixture('json-named.mjs'));
    expect(run.stderr).toContain("SyntaxError: The requested module './config.json' does not provide an export named 'name'");
  });

  it('Section 3: the older assert syntax is a SyntaxError in Node 24', () => {
    const run = runNode(fixture('json-assert.mjs'));
    expect(run.stderr).toContain("SyntaxError: Unexpected identifier 'assert'");
  });
});
