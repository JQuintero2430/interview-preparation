// Section 1 claims, each run in a real node process (Vitest's own module transform is not Node's loader).
import { runNode, stdoutLines } from '../../outputs/run-node';

const fixture = (path: string) => new URL(`./fixtures/section-1/${path}`, import.meta.url);

describe('Module 05 · section 1: ES modules', () => {
  it('Section 1: an import is a live, read-only view of the exporter binding', () => {
    const run = runNode(fixture('live/main.mjs'));
    expect(stdoutLines(run)).toEqual(['before 0', 'after 1', 'TypeError Assignment to constant variable.']);
  });

  it('Section 1: dependencies evaluate first (post-order), each module once, and top-level this is undefined', () => {
    const run = runNode(fixture('order/main.mjs'));
    expect(stdoutLines(run)).toEqual([
      'shared evaluated',
      'a evaluated',
      'b evaluated',
      'main evaluated, this is undefined',
    ]);
  });

  it('Section 1: a missing named export fails at link time, before any module body runs', () => {
    const run = runNode(fixture('missing-export/main.mjs'));
    expect(run.stdout).toBe('');
    expect(run.stderr).toContain("SyntaxError: The requested module './dep.mjs' does not provide an export named 'missing'");
    expect(run.status).toBe(1);
  });

  it('Section 1: in a cycle, reading a const the other module has not evaluated yet throws ReferenceError', () => {
    const run = runNode(fixture('cycle-tdz/main.mjs'));
    expect(run.stdout).toBe('');
    expect(run.stderr).toContain("ReferenceError: Cannot access 'a' before initialization");
    expect(run.status).toBe(1);
  });

  it('Section 1: in the same cycle, a function declaration is already initialized at link time', () => {
    const run = runNode(fixture('cycle-function/main.mjs'));
    expect(stdoutLines(run)).toEqual(['b sees A', 'a sees B']);
  });
});
