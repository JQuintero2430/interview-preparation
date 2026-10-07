import { runNode, stdoutLines } from './run-node';

describe('runNode', () => {
  it('runs a fixture in a real node process and reports stdout, stderr and the exit code', () => {
    const run = runNode(new URL('./fixtures-run-node/hello.mjs', import.meta.url));
    expect(stdoutLines(run)).toEqual(['from node undefined']);
    expect(run.stderr).toBe('to stderr\n');
    expect(run.status).toBe(3);
  });
});
