// Section 4 claims, run with `node --expose-gc`. Collection timing is up to the engine: these lines are
// what Node 24.21 printed on 20 consecutive runs before the assertions were written, not spec guarantees.
import { runNode, stdoutLines } from '../../outputs/run-node';

const runWithGc = (path: string) =>
  stdoutLines(runNode(new URL(`./fixtures/section-4/${path}`, import.meta.url), ['--expose-gc']));

describe('Module 05 · section 4: garbage collection and leaks', () => {
  it('Section 4: an unreachable cycle is collected (mark-and-sweep, not reference counting)', () => {
    expect(runWithGc('cycle.mjs')).toEqual(['unreachable cycle collected: true']);
  });

  it('Section 4: an interval callback keeps what it captures alive until clearInterval', () => {
    expect(runWithGc('timer-leak.mjs')).toEqual([
      'interval running, report alive: true',
      'after clearInterval, report alive: false',
    ]);
  });

  it('Section 4: a listener on a long-lived target keeps a forgotten panel alive until it is removed', () => {
    expect(runWithGc('listener-leak.mjs')).toEqual([
      'panel forgotten, listener registered, panel alive: true',
      'listener removed, panel alive: false',
    ]);
  });

  it('Section 4: removing the listener is not enough while a kept function still captures the handler', () => {
    expect(runWithGc('listener-handle.mjs')).toEqual(['listener removed, close kept, panel alive: true']);
  });
});
