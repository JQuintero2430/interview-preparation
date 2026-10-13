import { AsyncPipe } from '@angular/common';
import { Component, Injectable, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TestBed } from '@angular/core/testing';
import { LabM28LegacyListStore, LabM28ListState } from '../legacy/behavior-subject-store';

/** The writer methods the legacy store has; a rewrite keeps them so callers do not change. */
interface LabM28ListWriter {
  setLoading(loading: boolean): void;
  setItems(items: string[]): void;
  addItem(item: string): void;
}

/** Step 1 of the migration: keep the legacy store and read it as signals. */
@Injectable()
class LabM28WrappedListStore {
  private readonly legacy = inject(LabM28LegacyListStore);
  readonly items = toSignal(this.legacy.select((state) => state.items), { requireSync: true });
  readonly loading = toSignal(this.legacy.select((state) => state.loading), { requireSync: true });
}

/** Step 2: the rewrite, with the same writer methods and signals instead of a stream. */
@Injectable()
class LabM28SignalListStore implements LabM28ListWriter {
  private readonly state = signal<{ items: readonly string[]; loading: boolean }>({ items: ['a'], loading: false });
  readonly items = computed(() => this.state().items);
  readonly loading = computed(() => this.state().loading);

  setLoading(loading: boolean): void {
    this.state.update((current) => ({ ...current, loading }));
  }

  setItems(items: readonly string[]): void {
    this.state.update((current) => ({ ...current, items }));
  }

  addItem(item: string): void {
    this.state.update((current) => ({ ...current, items: [...current.items, item] }));
  }
}

@Component({
  selector: 'lab-m28-snapshot-view',
  template: `<p>{{ store.snapshot.loading }}</p>`,
})
class LabM28SnapshotView {
  protected readonly store = inject(LabM28LegacyListStore);
}

@Component({
  selector: 'lab-m28-async-view',
  imports: [AsyncPipe],
  template: `<p>{{ loading$ | async }}</p>`,
})
class LabM28AsyncView {
  protected readonly loading$ = inject(LabM28LegacyListStore).select((state) => state.loading);
}

function drive(store: LabM28ListWriter): void {
  store.setItems(['x']);
  store.addItem('y');
  store.setLoading(true);
}

describe('Section 3: the service-with-BehaviorSubject store', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [LabM28LegacyListStore, LabM28WrappedListStore, LabM28SignalListStore],
    }),
  );

  it('Section 3: select emits only when the selected slice changes', () => {
    const store = TestBed.inject(LabM28LegacyListStore);
    const loading: boolean[] = [];
    const items: string[][] = [];
    store.select((state) => state.loading).subscribe((value) => loading.push(value));
    store.select((state) => state.items).subscribe((value) => items.push([...value]));

    store.setLoading(true);
    store.setLoading(true);
    store.setItems(['a', 'b']);

    expect(loading).toEqual([false, true]);
    expect(items).toEqual([['a'], ['a', 'b']]);
  });

  it('Section 3: an in-place mutation followed by next is swallowed by distinctUntilChanged', () => {
    const store = TestBed.inject(LabM28LegacyListStore);
    const received: string[][] = [];
    let latest: string[] = [];
    store.select((state) => state.items).subscribe((value) => {
      latest = value;
      received.push([...value]);
    });

    store.setLoading(true);
    store.setItems(['a', 'b']);
    store.snapshot.items.push('c');
    store.setLoading(false);

    expect(received).toEqual([['a'], ['a', 'b']]);
    expect(latest).toEqual(['a', 'b', 'c']);

    store.addItem('d');
    expect(received.at(-1)).toEqual(['a', 'b', 'c', 'd']);
  });

  it("Section 3: toSignal with requireSync reads the store's current value", () => {
    const legacy = TestBed.inject(LabM28LegacyListStore);
    legacy.setItems(['a', 'b']);

    const wrapped = TestBed.inject(LabM28WrappedListStore);
    expect(wrapped.items()).toEqual(['a', 'b']);
    expect(wrapped.loading()).toBe(false);

    legacy.setLoading(true);
    legacy.addItem('c');
    expect(wrapped.loading()).toBe(true);
    expect(wrapped.items()).toEqual(['a', 'b', 'c']);
  });

  it("Section 3: the signal rewrite keeps the store's public methods", () => {
    const legacy = TestBed.inject(LabM28LegacyListStore);
    const rewrite = TestBed.inject(LabM28SignalListStore);

    drive(legacy);
    drive(rewrite);

    const expected: LabM28ListState = { items: ['x', 'y'], loading: true };
    expect(legacy.snapshot).toEqual(expected);
    expect({ items: rewrite.items(), loading: rewrite.loading() }).toEqual(expected);
  });

  it('Section 3: every subscriber to select runs the selector itself', () => {
    const store = TestBed.inject(LabM28LegacyListStore);
    let runs = 0;
    const loading$ = store.select((state) => {
      runs++;
      return state.loading;
    });
    loading$.subscribe();
    loading$.subscribe();
    expect(runs).toBe(2);

    store.setLoading(true);
    expect(runs).toBe(4);
  });

  it('Section 3: a view that reads the snapshot is not refreshed by an emission, a view with the async pipe is', async () => {
    const snapshotView = TestBed.createComponent(LabM28SnapshotView);
    const asyncView = TestBed.createComponent(LabM28AsyncView);
    await snapshotView.whenStable();
    await asyncView.whenStable();
    const text = (view: typeof snapshotView | typeof asyncView): string => view.nativeElement.textContent;
    expect([text(snapshotView), text(asyncView)]).toEqual(['false', 'false']);

    TestBed.inject(LabM28LegacyListStore).setLoading(true);
    await snapshotView.whenStable();
    await asyncView.whenStable();

    expect(text(snapshotView)).toBe('false');
    expect(text(asyncView)).toBe('true');
  });
});
