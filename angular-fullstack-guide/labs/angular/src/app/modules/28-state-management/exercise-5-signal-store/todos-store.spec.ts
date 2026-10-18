import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { patchState } from '@ngrx/signals';
import { LabM28AuthorsStore } from './authors-store';
import { Author, Todo } from './todo';
import { AUTHORS_URL, TODOS_URL } from './todos-api';
import { LabM28TodosStore } from './todos-store';
import { LabM28TrackedAuthorsStore } from './tracked-authors-store';
import { LabM28TrackedTodosStore } from './tracked-todos-store';

type TodosStore = InstanceType<typeof LabM28TodosStore> | InstanceType<typeof LabM28TrackedTodosStore>;
type AuthorsStore = InstanceType<typeof LabM28AuthorsStore> | InstanceType<typeof LabM28TrackedAuthorsStore>;

const variants: [string, Type<TodosStore>, Type<AuthorsStore>][] = [
  ['exported updaters', LabM28TodosStore, LabM28AuthorsStore],
  ['tracked request', LabM28TrackedTodosStore, LabM28TrackedAuthorsStore],
];

const write: Todo = { id: 1, title: 'write', done: false };
const test: Todo = { id: 2, title: 'test', done: true };
const ship: Todo = { id: 3, title: 'ship', done: false };

describe.each(variants)('E28.5 a SignalStore with entities, rxMethod and a reusable request-status feature (%s)', (_name, todosType, authorsType) => {
  let controller: HttpTestingController;

  function setUp(): TodosStore {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    controller = TestBed.inject(HttpTestingController);
    return TestBed.inject(todosType);
  }

  function loaded(todos: Todo[]): TodosStore {
    const store = setUp();
    controller.expectOne(TODOS_URL).flush(todos);
    return store;
  }

  afterEach(() => controller.verify());

  it('the store loads the todos when it is created', () => {
    const store = setUp();

    const request = controller.expectOne(TODOS_URL);
    expect(request.request.method).toBe('GET');
    expect(store.status()).toBe('pending');
    expect(store.isLoading()).toBe(true);
    request.flush([]);
  });

  it('a successful load stores the entities and the fulfilled status', () => {
    const store = loaded([write, test]);

    expect(store.ids()).toEqual([1, 2]);
    expect(store.entityMap()).toEqual({ 1: write, 2: test });
    expect(store.entities()).toEqual([write, test]);
    expect(store.status()).toBe('fulfilled');
    expect(store.error()).toBeNull();
    expect(store.isLoading()).toBe(false);
  });

  it('a failed load sets the error status and keeps existing entities', () => {
    const store = loaded([write, test]);

    store.load();
    controller.expectOne(TODOS_URL).flush('boom', { status: 500, statusText: 'Server Error' });

    expect(store.status()).toBe('error');
    expect(store.error()).toContain('500');
    expect(store.entities()).toEqual([write, test]);

    store.load();
    controller.expectOne(TODOS_URL).flush([ship]);
    expect(store.status()).toBe('fulfilled');
    expect(store.entities()).toEqual([ship]);
  });

  it('toggling a todo updates only that entity', () => {
    const store = loaded([write, test, ship]);
    const before = store.entityMap();

    store.toggle(1);

    const after = store.entityMap();
    expect(after[1]).toEqual({ ...write, done: true });
    expect(after[2]).toBe(before[2]);
    expect(after[3]).toBe(before[3]);
    expect(store.ids()).toEqual([1, 2, 3]);
  });

  it('remaining and done counts follow the entities', () => {
    const store = loaded([write, test, ship]);
    expect([store.remaining(), store.doneCount()]).toEqual([2, 1]);

    store.toggle(1);
    expect([store.remaining(), store.doneCount()]).toEqual([1, 2]);

    store.add('review');
    expect([store.remaining(), store.doneCount()]).toEqual([2, 2]);
    expect(store.entities().at(-1)).toEqual({ id: 4, title: 'review', done: false });
  });

  it('the request-status feature works unchanged in a second store', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    controller = TestBed.inject(HttpTestingController);
    const authors = TestBed.inject(authorsType);
    expect(authors.status()).toBe('idle');
    const ada: Author = { id: 1, name: 'Ada' };

    authors.load();
    expect(authors.isLoading()).toBe(true);
    controller.expectOne(AUTHORS_URL).flush([ada]);
    expect(authors.status()).toBe('fulfilled');
    expect(authors.entities()).toEqual([ada]);

    authors.load();
    controller.expectOne(AUTHORS_URL).flush('boom', { status: 404, statusText: 'Not Found' });
    expect(authors.status()).toBe('error');
    expect(authors.error()).toContain('404');
    expect(authors.entities()).toEqual([ada]);
  });

  it('patching the state from outside the store does not compile', () => {
    const store = loaded([write]);

    // @ts-expect-error protected state: the injected store is not a WritableStateSource
    patchState(store, { status: 'idle' });

    // A type, not a lock: a cast writes at runtime (section 8).
    expect(store.status()).toBe('idle');
  });
});
