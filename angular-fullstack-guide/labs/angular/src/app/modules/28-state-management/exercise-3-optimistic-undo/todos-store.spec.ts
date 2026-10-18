import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LabM28OverlayTodosStore } from './overlay-todos-store';
import { Todo } from './todo';
import { HISTORY_LIMIT, TodosStore } from './todos-store';

const variants: [string, Type<TodosStore | LabM28OverlayTodosStore>][] = [
  ['inverse write-back', TodosStore],
  ['pending overlay', LabM28OverlayTodosStore],
];

const seed: Todo[] = [
  { id: 1, title: 'write', done: false },
  { id: 2, title: 'review', done: false },
  { id: 3, title: 'ship', done: false },
];

const fail = { status: 500, statusText: 'Server Error' };

describe.each(variants)('E28.3 optimistic toggles with rollback, a normalized collection and undo and redo (%s)', (_name, storeType) => {
  let http: HttpTestingController;
  let store: TodosStore | LabM28OverlayTodosStore;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
    store = TestBed.inject(storeType);
    store.setAll(seed);
  });

  afterEach(() => http.verify());

  const flags = () => store.todos().map((todo) => todo.done);

  it('a toggle shows immediately before the server answers', () => {
    store.toggle(1);

    expect(flags()).toEqual([true, false, false]);
    const request = http.expectOne('/api/todos/1');
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ done: true });
    request.flush({ ...seed[0], done: true });
    expect(flags()).toEqual([true, false, false]);
  });

  it('a server error restores the item and sets an error message', () => {
    store.toggle(1);
    http.expectOne('/api/todos/1').flush('nope', fail);

    expect(flags()).toEqual([false, false, false]);
    expect(store.error()).toBe('could not save todo 1');
  });

  it('a failed toggle does not undo a successful toggle of another item', () => {
    store.toggle(2);
    store.toggle(1);
    http.expectOne('/api/todos/1').flush({ ...seed[0], done: true });
    http.expectOne('/api/todos/2').flush('nope', fail);

    expect(flags()).toEqual([true, false, false]);
  });

  it('updating one item keeps the references of the others', () => {
    const before = store.collection();

    store.toggle(2);
    http.expectOne('/api/todos/2').flush({ ...seed[1], done: true });
    const after = store.collection();

    expect(after.entities[2]).not.toBe(before.entities[2]);
    expect(after.entities[1]).toBe(before.entities[1]);
    expect(after.entities[3]).toBe(before.entities[3]);
    expect(after.ids).toBe(before.ids);
  });

  it('undo restores the previous state and redo re-applies it', () => {
    store.toggle(1);
    http.expectOne('/api/todos/1').flush({});

    store.undo();
    expect(flags()).toEqual([false, false, false]);
    const undoRequest = http.expectOne('/api/todos/1');
    expect(undoRequest.request.body).toEqual({ done: false });
    undoRequest.flush({});

    store.redo();
    expect(flags()).toEqual([true, false, false]);
    http.expectOne('/api/todos/1').flush({});
  });

  it('a new edit after undo clears the redo stack', () => {
    store.toggle(1);
    http.expectOne('/api/todos/1').flush({});
    store.undo();
    http.expectOne('/api/todos/1').flush({});
    expect(store.canRedo()).toBe(true);

    store.toggle(2);
    http.expectOne('/api/todos/2').flush({});

    expect(store.canRedo()).toBe(false);
    store.redo();
    expect(flags()).toEqual([false, true, false]);
  });

  it('the history keeps at most 20 entries', () => {
    for (let i = 0; i < HISTORY_LIMIT + 5; i++) {
      store.toggle(1);
      http.expectOne('/api/todos/1').flush({});
    }

    let undone = 0;
    while (store.canUndo()) {
      store.undo();
      http.expectOne('/api/todos/1').flush({});
      undone++;
    }

    expect(undone).toBe(20);
  });
});
