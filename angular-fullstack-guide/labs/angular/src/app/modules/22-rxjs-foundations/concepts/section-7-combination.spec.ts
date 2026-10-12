import { Observable, combineLatest, concat, forkJoin, merge, race, startWith, withLatestFrom, zip } from 'rxjs';
import { legacyCombineLatest, legacyConcat, legacyMerge, legacyZip } from '../legacy/deprecated-forms';
import { timeline } from './support/timeline';

describe('Section 7: combining streams', () => {
  it('Section 7: combineLatest re-emits the latest of each once every source has emitted', () => {
    expect(timeline(({ cold }) => combineLatest([cold('a-b-c|'), cold('-x---y|')]))).toEqual([
      [1, 'N', ['a', 'x']],
      [2, 'N', ['b', 'x']],
      [4, 'N', ['c', 'x']],
      [5, 'N', ['c', 'y']],
      [6, 'C'],
    ]);
    expect(timeline(({ cold }) => combineLatest({ filter: cold('a|'), page: cold('-x|') }))).toEqual([
      [1, 'N', { filter: 'a', page: 'x' }],
      [2, 'C'],
    ]);
  });

  it('Section 7: withLatestFrom drops source values before the other source emits', () => {
    expect(timeline(({ cold }) => cold('a-b-c-d|').pipe(withLatestFrom(cold('--x---y|'))))).toEqual([
      [2, 'N', ['b', 'x']],
      [4, 'N', ['c', 'x']],
      [6, 'N', ['d', 'y']],
      [7, 'C'],
    ]);
  });

  it('Section 7: zip pairs by position and completes when the shortest ends', () => {
    expect(timeline(({ cold }) => zip([cold('a-b-c|'), cold('-x-y---z|')]))).toEqual([
      [1, 'N', ['a', 'x']],
      [3, 'N', ['b', 'y']],
      [7, 'N', ['c', 'z']],
      [7, 'C'],
    ]);
    expect(timeline(({ cold }) => zip([cold('a|'), cold('-x-y-z|')]))).toEqual([
      [1, 'N', ['a', 'x']],
      [1, 'C'],
    ]);
  });

  it('Section 7: merge interleaves and concat queues', () => {
    expect(timeline(({ cold }) => merge(cold('a---b|'), cold('-x-y-|')))).toEqual([
      [0, 'N', 'a'],
      [1, 'N', 'x'],
      [3, 'N', 'y'],
      [4, 'N', 'b'],
      [5, 'C'],
    ]);
    expect(timeline(({ cold }) => concat(cold('a-b|'), cold('x-y|')))).toEqual([
      [0, 'N', 'a'],
      [2, 'N', 'b'],
      [3, 'N', 'x'],
      [5, 'N', 'y'],
      [6, 'C'],
    ]);
  });

  it('Section 7: forkJoin emits the last values on completion, errors on any error and completes empty when a source is empty', () => {
    expect(timeline(({ cold }) => forkJoin([cold('a-b|'), cold('-x-y-z|')]))).toEqual([
      [6, 'N', ['b', 'z']],
      [6, 'C'],
    ]);
    expect(timeline(({ cold }) => forkJoin({ user: cold('a|'), cart: cold('--x|') }))).toEqual([
      [3, 'N', { user: 'a', cart: 'x' }],
      [3, 'C'],
    ]);
    expect(timeline(({ cold }) => forkJoin([cold('a----|'), cold('-|')]))).toEqual([[1, 'C']]);
    expect(timeline(({ cold }) => forkJoin([cold('a----|'), cold('--#')]))).toEqual([[2, 'E', 'error']]);
  });

  it('Section 7: race follows the first source to emit', () => {
    expect(timeline(({ cold }) => race(cold('---a|'), cold('-b-c|')))).toEqual([
      [1, 'N', 'b'],
      [3, 'N', 'c'],
      [4, 'C'],
    ]);
  });

  it('Section 7: combineLatest with an empty source completes without a value', () => {
    expect(timeline(({ cold }) => combineLatest([cold('a-b|'), cold('-|')]))).toEqual([[3, 'C']]);
    expect(timeline(() => combineLatest([]))).toEqual([[0, 'C']]);
  });

  it('Section 7: merge with a concurrency limit subscribes later sources when a slot frees', () => {
    expect(timeline(({ cold }) => merge(cold('a--|'), cold('b--|'), cold('c--|'), 2))).toEqual([
      [0, 'N', 'a'],
      [0, 'N', 'b'],
      [3, 'N', 'c'],
      [6, 'C'],
    ]);
  });

  it('Section 7: startWith gives combineLatest an initial value', () => {
    expect(timeline(({ cold }) => combineLatest([cold('a-b|'), cold('----x|').pipe(startWith('s'))]))).toEqual([
      [0, 'N', ['a', 's']],
      [2, 'N', ['b', 's']],
      [4, 'N', ['b', 'x']],
      [5, 'C'],
    ]);
  });

  it('Section 7: the deprecated rest-argument and instance forms give what the current forms give', () => {
    const both = (pick: (a: Observable<number>, b: Observable<number>) => Observable<unknown>) =>
      timeline(({ cold }) => pick(cold('a-b|', { a: 1, b: 2 }), cold('-x|', { x: 10 })));

    expect(both((a, b) => combineLatest(a, b))).toEqual(both((a, b) => combineLatest([a, b])));
    expect(both((a, b) => forkJoin(a, b))).toEqual(both((a, b) => forkJoin([a, b])));
    expect(both(legacyMerge)).toEqual(both((a, b) => merge(a, b)));
    expect(both(legacyConcat)).toEqual(both((a, b) => concat(a, b)));
    expect(both(legacyZip)).toEqual(both((a, b) => zip([a, b])));
    expect(both(legacyCombineLatest)).toEqual(both((a, b) => combineLatest([a, b])));
  });
});
