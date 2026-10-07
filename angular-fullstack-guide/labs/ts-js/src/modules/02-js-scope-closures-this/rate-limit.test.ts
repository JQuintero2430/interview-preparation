import { debounce, throttle } from './rate-limit';

const WAIT_MS = 100;

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('E02.3 debounce', () => {
  it('runs once, waitMs after the last call, with the last arguments', () => {
    const runs: string[] = [];
    const search = debounce((query: string) => runs.push(query), WAIT_MS);

    search('a');
    search('an');
    search('ang');
    vi.advanceTimersByTime(WAIT_MS - 1);
    expect(runs).toEqual([]);

    vi.advanceTimersByTime(1);
    expect(runs).toEqual(['ang']);
  });

  it('restarts the wait on every call', () => {
    const runs: string[] = [];
    const save = debounce((value: string) => runs.push(value), WAIT_MS);

    save('first');
    vi.advanceTimersByTime(60);
    save('second'); // 60 ms in: the clock restarts
    vi.advanceTimersByTime(60);
    expect(runs).toEqual([]); // 120 ms after the first call, but only 60 after the last

    vi.advanceTimersByTime(40);
    expect(runs).toEqual(['second']);
  });

  it('calls the function with the this of the last call', () => {
    // One debounced function shared by two receivers, so the test can tell the last call's
    // `this` from an earlier one.
    const save = debounce(function (this: { saved: string[] }, value: string) {
      this.saved.push(value);
    }, WAIT_MS);
    const first = { saved: [] as string[], save };
    const second = { saved: [] as string[], save };

    first.save('draft 1');
    second.save('draft 2');
    vi.advanceTimersByTime(WAIT_MS);

    expect(first.saved).toEqual([]);
    expect(second.saved).toEqual(['draft 2']);
  });

  it('drops the pending call on cancel()', () => {
    const runs: string[] = [];
    const save = debounce((value: string) => runs.push(value), WAIT_MS);

    save('never');
    save.cancel();
    vi.advanceTimersByTime(WAIT_MS * 2);

    expect(runs).toEqual([]);
  });
});

describe('E02.3 throttle', () => {
  it('runs the first call immediately (leading edge)', () => {
    const runs: number[] = [];
    const onScroll = throttle((y: number) => runs.push(y), WAIT_MS);

    onScroll(1);

    expect(runs).toEqual([1]);
  });

  it('runs one trailing call with the latest arguments at the end of the interval', () => {
    const runs: number[] = [];
    const onScroll = throttle((y: number) => runs.push(y), WAIT_MS);

    onScroll(1);
    vi.advanceTimersByTime(30);
    onScroll(2);
    vi.advanceTimersByTime(30);
    onScroll(3);
    expect(runs).toEqual([1]);

    vi.advanceTimersByTime(40); // t = 100: the interval ends
    expect(runs).toEqual([1, 3]);

    vi.advanceTimersByTime(50);
    onScroll(4); // t = 150: inside the interval started by the trailing run
    expect(runs).toEqual([1, 3]);

    vi.advanceTimersByTime(50); // t = 200
    expect(runs).toEqual([1, 3, 4]);
  });

  it('makes no trailing call when nothing arrived during the interval', () => {
    const runs: number[] = [];
    const onScroll = throttle((y: number) => runs.push(y), WAIT_MS);

    onScroll(1);
    vi.advanceTimersByTime(WAIT_MS * 3);
    expect(runs).toEqual([1]);

    onScroll(2); // the interval is over, so this is a new leading call
    expect(runs).toEqual([1, 2]);
  });

  it('calls the function with the this of the call it runs', () => {
    // One throttled function shared by two receivers: the leading run uses the first call's
    // `this`, the trailing run the last call's.
    const track = throttle(function (this: { positions: number[] }, y: number) {
      this.positions.push(y);
    }, WAIT_MS);
    const top = { positions: [] as number[], track };
    const bottom = { positions: [] as number[], track };

    top.track(10);
    top.track(15);
    bottom.track(20);
    vi.advanceTimersByTime(WAIT_MS);

    expect(top.positions).toEqual([10]);
    expect(bottom.positions).toEqual([20]);
  });

  it('drops the pending trailing call on cancel()', () => {
    const runs: number[] = [];
    const onScroll = throttle((y: number) => runs.push(y), WAIT_MS);

    onScroll(1);
    onScroll(2);
    onScroll.cancel();
    vi.advanceTimersByTime(WAIT_MS * 2);

    expect(runs).toEqual([1]);
  });
});
