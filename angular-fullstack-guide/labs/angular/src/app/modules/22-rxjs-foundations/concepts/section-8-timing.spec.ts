import { Subject, auditTime, bufferTime, debounceTime, delay, interval, sampleTime, take, throttleTime, timeout, timer } from 'rxjs';
import { timeline } from './support/timeline';

const burst = '-a-b-c-----d-e-f|';

describe('Section 8: timing operators', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('Section 8: debounceTime, throttleTime, auditTime and sampleTime on one burst', () => {
    expect(timeline(({ cold }) => cold(burst).pipe(debounceTime(3)))).toEqual([
      [8, 'N', 'c'],
      [16, 'N', 'f'],
      [16, 'C'],
    ]);
    expect(timeline(({ cold }) => cold(burst).pipe(throttleTime(3)))).toEqual([
      [1, 'N', 'a'],
      [5, 'N', 'c'],
      [11, 'N', 'd'],
      [15, 'N', 'f'],
      [16, 'C'],
    ]);
    expect(timeline(({ cold }) => cold(burst).pipe(auditTime(3)))).toEqual([
      [4, 'N', 'b'],
      [8, 'N', 'c'],
      [14, 'N', 'e'],
      [18, 'N', 'f'],
      [18, 'C'],
    ]);
    expect(timeline(({ cold }) => cold(burst).pipe(sampleTime(3)))).toEqual([
      [3, 'N', 'b'],
      [6, 'N', 'c'],
      [12, 'N', 'd'],
      [15, 'N', 'f'],
      [16, 'C'],
    ]);
  });

  it('Section 8: throttleTime leading and trailing combinations', () => {
    const throttled = (leading: boolean, trailing: boolean) =>
      timeline(({ cold }) => cold(burst).pipe(throttleTime(3, undefined, { leading, trailing })));

    expect(throttled(true, false)).toEqual(timeline(({ cold }) => cold(burst).pipe(throttleTime(3))));
    expect(throttled(false, true)).toEqual([
      [4, 'N', 'b'],
      [7, 'N', 'c'],
      [14, 'N', 'e'],
      [17, 'N', 'f'],
      [17, 'C'],
    ]);
    expect(throttled(true, true)).toEqual([
      [1, 'N', 'a'],
      [4, 'N', 'b'],
      [7, 'N', 'c'],
      [11, 'N', 'd'],
      [14, 'N', 'e'],
      [17, 'N', 'f'],
      [17, 'C'],
    ]);
    expect(throttled(false, false)).toEqual([[16, 'C']]);
  });

  it('Section 8: what each operator does with its pending value at complete', () => {
    expect(timeline(({ cold }) => cold('-a-b|').pipe(debounceTime(10)))).toEqual([
      [4, 'N', 'b'],
      [4, 'C'],
    ]);
    expect(timeline(({ cold }) => cold('-a-b-|').pipe(sampleTime(10)))).toEqual([[5, 'C']]);
    expect(timeline(({ cold }) => cold('-a-b|').pipe(auditTime(10)))).toEqual([
      [11, 'N', 'b'],
      [11, 'C'],
    ]);
    expect(timeline(({ cold }) => cold('-a-b|').pipe(throttleTime(10)))).toEqual([
      [1, 'N', 'a'],
      [4, 'C'],
    ]);
  });

  it('Section 8: debounceTime forwards an error at once', () => {
    expect(timeline(({ cold }) => cold('-a#').pipe(debounceTime(10)))).toEqual([[2, 'E', 'error']]);
  });

  it('Section 8: timeout fails a silent stream and delay shifts every value', () => {
    expect(timeline(({ cold }) => cold('-a-----b|').pipe(timeout(3)))).toEqual([
      [1, 'N', 'a'],
      [4, 'E', 'TimeoutError'],
    ]);
    expect(timeline(({ cold }) => cold('-a-b|').pipe(delay(5)))).toEqual([
      [6, 'N', 'a'],
      [8, 'N', 'b'],
      [8, 'C'],
    ]);
  });

  it('Section 8: timer and interval emit on their schedule', () => {
    expect(timeline(() => timer(3, 2).pipe(take(3)))).toEqual([
      [3, 'N', 0],
      [5, 'N', 1],
      [7, 'N', 2],
      [7, 'C'],
    ]);
    expect(timeline(() => interval(2).pipe(take(3)))).toEqual([
      [2, 'N', 0],
      [4, 'N', 1],
      [6, 'N', 2],
      [6, 'C'],
    ]);
    expect(timeline(() => timer(0))).toEqual([
      [0, 'N', 0],
      [0, 'C'],
    ]);
  });

  it('Section 8: bufferTime collects the values of each window', () => {
    expect(timeline(({ cold }) => cold('-a-b-c-d-e|').pipe(bufferTime(4)))).toEqual([
      [4, 'N', ['a', 'b']],
      [8, 'N', ['c', 'd']],
      [10, 'N', ['e']],
      [10, 'C'],
    ]);
  });

  it('Section 8: fake timers drive debounceTime', () => {
    vi.useFakeTimers();
    const input = new Subject<string>();
    const out: string[] = [];
    input.pipe(debounceTime(300)).subscribe((value) => out.push(value));

    input.next('a');
    vi.advanceTimersByTime(100);
    input.next('ab');
    vi.advanceTimersByTime(299);
    const beforeSilence = [...out];
    vi.advanceTimersByTime(1);

    expect(beforeSilence).toEqual([]);
    expect(out).toEqual(['ab']);
  });
});
