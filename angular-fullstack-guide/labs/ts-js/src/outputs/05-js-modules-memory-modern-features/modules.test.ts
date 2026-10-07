// Q05.01–Q05.07: module questions. Each fixture runs in a real node process (Node's loader, not Vitest's).
import { runNode, stdoutLines } from '../run-node';

const fixture = (path: string) => new URL(`./fixtures/${path}`, import.meta.url);

describe('Module 05 · Output questions: modules', () => {
  it('Q05.01 evidence: a module top level is not global scope, and this is undefined everywhere', () => {
    expect(stdoutLines(runNode(fixture('q05-01/main.mjs')))).toEqual(['undefined undefined undefined']);
  });

  it('Q05.02 export default of a variable is a snapshot; named and "as default" exports are live', () => {
    expect(stdoutLines(runNode(fixture('q05-02/main.mjs')))).toEqual(['2 2 0']);
  });

  it('Q05.03 dependencies evaluate depth-first before the importer, each once, whatever the textual order', () => {
    expect(stdoutLines(runNode(fixture('q05-03/main.mjs')))).toEqual(['logger', 'config', 'app', 'main starts', 'main ends']);
  });

  it('Q05.04 entering the cycle at user.mjs runs order.mjs first, so new User() hits the TDZ', () => {
    const run = runNode(fixture('q05-04/main.mjs'));
    expect(run.stdout).toBe('');
    expect(run.stderr).toContain("ReferenceError: Cannot access 'User' before initialization");
    expect(run.status).toBe(1);
  });

  it('Q05.04 entering the same cycle at order.mjs works', () => {
    expect(stdoutLines(runNode(fixture('q05-04/main-order-first.mjs')))).toEqual(['guest ada']);
  });

  it('Q05.04 fix: creating the guest lazily, in a function, removes the evaluation-time read', () => {
    expect(stdoutLines(runNode(fixture('q05-04/fixed/main.mjs')))).toEqual(['ada guest']);
  });

  it('Q05.06 import of CommonJS: default is module.exports, version is detected as a named export', () => {
    expect(stdoutLines(runNode(fixture('q05-06/main.mjs')))).toEqual(['function hi esm 3', 'object function 3']);
  });

  it('Q05.06 require of an ES module returns its namespace object', () => {
    expect(stdoutLines(runNode(fixture('q05-06/main.cjs')))).toEqual(['object default export named export']);
  });
});
