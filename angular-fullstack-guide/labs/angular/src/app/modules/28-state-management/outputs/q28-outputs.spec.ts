import { computed, signal } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged, map } from 'rxjs';

// Output questions of module 28 that need no NgRx (NgRx Output questions are Concept questions in harness mode).
describe('Module 28 Output questions', () => {
  it('Q28.05 only the flag changes: the whole-state selectors re-run, the count stays', () => {
    const state = signal({ items: ['a'], filter: '', loading: false });
    const runs = { items: 0, count: 0, loading: 0 };
    const items = computed(() => {
      runs.items++;
      return state().items;
    });
    const count = computed(() => {
      runs.count++;
      return items().length;
    });
    const loading = computed(() => {
      runs.loading++;
      return state().loading;
    });
    const readAll = (): void => {
      items();
      count();
      loading();
    };

    readAll();
    state.update((s) => ({ ...s, loading: true }));
    readAll();

    expect(runs).toEqual({ items: 2, count: 1, loading: 2 });
    expect(loading()).toBe(true);
  });

  it('Q28.07 the BehaviorSubject select emits on a new items array only, not on a flag change or an in-place push', () => {
    interface ListState {
      items: string[];
      loading: boolean;
    }
    const subject = new BehaviorSubject<ListState>({ items: ['a'], loading: false });
    const select = <T>(pick: (state: ListState) => T) => subject.pipe(map(pick), distinctUntilChanged());
    const received: string[][] = [];
    select((s) => s.items).subscribe((items) => received.push([...items]));

    subject.next({ ...subject.getValue(), loading: true });
    subject.next({ ...subject.getValue(), items: ['a', 'b'] });
    subject.getValue().items.push('c');
    subject.next({ ...subject.getValue() });

    expect(received).toEqual([['a'], ['a', 'b']]);
    expect(subject.getValue().items).toEqual(['a', 'b', 'c']);
  });

  it('Q28.30 edit, edit, undo, edit leaves past [0, 1], present 3 and an empty future', () => {
    interface History {
      readonly past: readonly number[];
      readonly present: number;
      readonly future: readonly number[];
    }
    const edit = (h: History, next: number): History => ({ past: [...h.past, h.present], present: next, future: [] });
    const undo = (h: History): History => {
      const previous = h.past.at(-1);
      if (previous === undefined) {
        return h;
      }
      return { past: h.past.slice(0, -1), present: previous, future: [h.present, ...h.future] };
    };
    const redo = (h: History): History => {
      const [next, ...rest] = h.future;
      if (next === undefined) {
        return h;
      }
      return { past: [...h.past, h.present], present: next, future: rest };
    };
    const stacks = (h: History): [readonly number[], number, readonly number[]] => [h.past, h.present, h.future];

    const start: History = { past: [], present: 0, future: [] };
    const twoEdits = edit(edit(start, 1), 2);
    const undone = undo(twoEdits);
    const branched = edit(undone, 3);

    expect(stacks(twoEdits)).toEqual([[0, 1], 2, []]);
    expect(stacks(undone)).toEqual([[0], 1, [2]]);
    expect(stacks(branched)).toEqual([[0, 1], 3, []]);
    expect(redo(branched)).toBe(branched);
  });
});
