import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Injectable, computed, inject, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

interface LabM28Todo {
  readonly id: number;
  readonly title: string;
  readonly done: boolean;
}

/** Normalized collection: the order in `ids`, the data in an id-keyed map. */
interface LabM28Collection {
  readonly ids: readonly number[];
  readonly entities: Readonly<Record<number, LabM28Todo>>;
}

const labM28Seed: LabM28Collection = {
  ids: [1, 2, 3],
  entities: {
    1: { id: 1, title: 'write', done: false },
    2: { id: 2, title: 'review', done: false },
    3: { id: 3, title: 'ship', done: false },
  },
};

/** Replaces one entity and leaves every other entry of the map untouched. */
function labM28Replace(
  state: LabM28Collection,
  id: number,
  change: (todo: LabM28Todo) => LabM28Todo,
): LabM28Collection {
  const current = state.entities[id];
  if (!current) {
    return state;
  }
  return { ids: state.ids, entities: { ...state.entities, [id]: change(current) } };
}

@Injectable()
class LabM28TodoStore {
  private readonly http = inject(HttpClient);
  private readonly state = signal<LabM28Collection>(labM28Seed);

  readonly collection = this.state.asReadonly();
  readonly ids = computed(() => this.state().ids);
  readonly todos = computed(() => {
    const { ids, entities } = this.state();
    return ids.flatMap((id) => (entities[id] ? [entities[id]] : []));
  });
  readonly error = signal<string | null>(null);

  /** Optimistic: apply now, undo only this item's change when the server says no. */
  toggle(id: number): void {
    const before = this.state().entities[id];
    if (!before) {
      return;
    }
    this.state.update((s) => labM28Replace(s, id, (todo) => ({ ...todo, done: !before.done })));
    this.http.patch(`/api/todos/${id}`, { done: !before.done }).subscribe({
      error: () => {
        this.state.update((s) => labM28Replace(s, id, (todo) => ({ ...todo, done: before.done })));
        this.error.set(`could not save todo ${id}`);
      },
    });
  }

  /** The tempting version: remember the whole state and put it back on failure. */
  toggleWithSnapshot(id: number): void {
    const snapshot = this.state();
    const before = snapshot.entities[id];
    if (!before) {
      return;
    }
    this.state.update((s) => labM28Replace(s, id, (todo) => ({ ...todo, done: !before.done })));
    this.http.patch(`/api/todos/${id}`, { done: !before.done }).subscribe({
      error: () => this.state.set(snapshot),
    });
  }
}

/** Undo and redo: three values, pure updates, a new edit clears `future`. */
class LabM28History<T> {
  constructor(
    readonly past: readonly T[],
    readonly present: T,
    readonly future: readonly T[],
  ) {}

  edit(next: T): LabM28History<T> {
    return new LabM28History([...this.past, this.present], next, []);
  }

  undo(): LabM28History<T> {
    const previous = this.past.at(-1);
    if (previous === undefined) {
      return this;
    }
    return new LabM28History(this.past.slice(0, -1), previous, [this.present, ...this.future]);
  }

  redo(): LabM28History<T> {
    const [next, ...rest] = this.future;
    if (next === undefined) {
      return this;
    }
    return new LabM28History([...this.past, this.present], next, rest);
  }
}

describe('Section 10: optimistic updates, normalization and undo', () => {
  let http: HttpTestingController;
  let store: LabM28TodoStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), LabM28TodoStore],
    });
    http = TestBed.inject(HttpTestingController);
    store = TestBed.inject(LabM28TodoStore);
  });

  afterEach(() => http.verify());

  const doneFlags = () => store.todos().map((todo) => todo.done);

  it('Section 10: an optimistic toggle shows at once and rolls back on a server error', () => {
    store.toggle(1);

    expect(doneFlags()).toEqual([true, false, false]);

    const request = http.expectOne('/api/todos/1');
    expect(request.request.body).toEqual({ done: true });
    request.flush('nope', { status: 500, statusText: 'Server Error' });

    expect(doneFlags()).toEqual([false, false, false]);
    expect(store.error()).toBe('could not save todo 1');
  });

  it('Section 10: a rollback restores only the failed item', () => {
    const snapshotStore = TestBed.runInInjectionContext(() => new LabM28TodoStore());
    snapshotStore.toggleWithSnapshot(2);
    snapshotStore.toggleWithSnapshot(1);
    const [snapshotFirst, snapshotSecond] = http.match((req) => req.url.startsWith('/api/todos/'));
    snapshotFirst?.flush('nope', { status: 500, statusText: 'Server Error' });
    snapshotSecond?.flush({});

    expect(snapshotStore.todos().map((todo) => todo.done)).toEqual([false, false, false]);

    store.toggle(2);
    store.toggle(1);
    http.expectOne('/api/todos/1').flush({});
    http.expectOne('/api/todos/2').flush('nope', { status: 500, statusText: 'Server Error' });

    expect(doneFlags()).toEqual([true, false, false]);
  });

  it("Section 10: a normalized update replaces one entity and keeps the others' references", () => {
    const before = store.collection();

    store.toggle(2);
    http.expectOne('/api/todos/2').flush({});
    const after = store.collection();

    expect(after.entities[2]).not.toBe(before.entities[2]);
    expect(after.entities[2]?.done).toBe(true);
    expect(after.entities[1]).toBe(before.entities[1]);
    expect(after.entities[3]).toBe(before.entities[3]);
    expect(after.ids).toBe(before.ids);
  });

  it('Section 10: undo and redo move the present between the stacks', () => {
    const start = new LabM28History<number>([], 0, []);

    const edited = start.edit(1).edit(2);
    expect([edited.past, edited.present, edited.future]).toEqual([[0, 1], 2, []]);

    const undone = edited.undo();
    expect([undone.past, undone.present, undone.future]).toEqual([[0], 1, [2]]);

    const redone = undone.redo();
    expect([redone.past, redone.present, redone.future]).toEqual([[0, 1], 2, []]);

    const branched = undone.edit(3);
    expect([branched.past, branched.present, branched.future]).toEqual([[0, 1], 3, []]);
    expect(start.undo()).toBe(start);
  });
});
