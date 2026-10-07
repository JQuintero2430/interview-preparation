// The scheduler only orders jobs, so a fake requestFrame stands in for the browser: the claim is about order, not layout.
import { createFrameScheduler } from './frame-scheduler';

/** A fake `requestAnimationFrame` that records requests; `runFrame` runs the callbacks requested so far. */
const fakeFrames = () => {
  let pending: (() => void)[] = [];
  return {
    requestFrame: (callback: () => void) => pending.push(callback),
    requested: () => pending.length,
    runFrame: () => {
      const callbacks = pending;
      pending = [];
      callbacks.forEach((callback) => callback());
    },
  };
};

describe('E08.2 createFrameScheduler', () => {
  it('all queued reads run before all queued writes in a frame', () => {
    const frames = fakeFrames();
    const scheduler = createFrameScheduler(frames.requestFrame);
    const log: string[] = [];
    scheduler.mutate(() => log.push('write 1'));
    scheduler.measure(() => log.push('read 1'));
    scheduler.mutate(() => log.push('write 2'));
    scheduler.measure(() => log.push('read 2'));
    expect(log).toEqual([]);
    frames.runFrame();
    expect(log).toEqual(['read 1', 'read 2', 'write 1', 'write 2']);
  });

  it('many calls in one task request exactly one frame', () => {
    const frames = fakeFrames();
    const scheduler = createFrameScheduler(frames.requestFrame);
    for (let i = 0; i < 50; i++) {
      scheduler.measure(() => undefined);
      scheduler.mutate(() => undefined);
    }
    expect(frames.requested()).toBe(1);
  });

  it('jobs keep their queue order', () => {
    const frames = fakeFrames();
    const scheduler = createFrameScheduler(frames.requestFrame);
    const log: number[] = [];
    [3, 1, 2].forEach((n) => scheduler.mutate(() => log.push(n)));
    frames.runFrame();
    expect(log).toEqual([3, 1, 2]);
  });

  it('a job queued during a flush runs in the next frame', () => {
    const frames = fakeFrames();
    const scheduler = createFrameScheduler(frames.requestFrame);
    const log: string[] = [];
    scheduler.measure(() => {
      log.push('read');
      scheduler.mutate(() => log.push('write queued by the read'));
    });
    frames.runFrame();
    expect([log, frames.requested()]).toEqual([['read'], 1]);
    frames.runFrame();
    expect(log).toEqual(['read', 'write queued by the read']);
  });

  it('a throwing job does not drop the others (the error is reported after the flush)', () => {
    const frames = fakeFrames();
    const scheduler = createFrameScheduler(frames.requestFrame);
    const log: string[] = [];
    const boom = new Error('boom');
    scheduler.measure(() => {
      throw boom;
    });
    scheduler.measure(() => log.push('read'));
    scheduler.mutate(() => log.push('write'));
    let reported: unknown;
    try {
      frames.runFrame();
    } catch (error) {
      reported = error;
    }
    expect(log).toEqual(['read', 'write']);
    expect(reported).toBeInstanceOf(AggregateError);
    expect((reported as AggregateError).errors).toEqual([boom]);
  });
});
