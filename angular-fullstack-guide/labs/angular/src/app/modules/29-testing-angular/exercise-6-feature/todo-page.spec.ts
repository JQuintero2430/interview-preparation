import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
  type TestRequest,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Subject, type Observable } from 'rxjs';
import { todoRoutes } from './routes';
import type { Todo } from './todo';
import { LabM29TodoPage } from './todo-page';
import { TodosApi } from './todos-api';

/** The server side as a test sees it, whichever backend answers. */
interface Backend {
  /** Answers the open list call with `items`. */
  respondList(items: readonly Todo[]): void;
  /** Answers the open save with `result`, or fails it with `'fail'`. */
  respondCreate(result: Todo | 'fail'): void;
  /** Calls made and not answered yet. */
  pending(): number;
}

/** Solution: the real TodosApi and HttpClient over HttpTestingController. */
function httpBackend(): Backend {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      provideRouter(todoRoutes, withComponentInputBinding()),
    ],
  });
  const controller = TestBed.inject(HttpTestingController);
  // match() takes requests off the controller's open list, so they are kept here until answered.
  const open: TestRequest[] = [];
  const collect = (): void => {
    open.push(...controller.match(() => true));
  };
  const take = (method: string): TestRequest => {
    collect();
    const index = open.findIndex(
      ({ request }) => request.method === method && request.url === '/api/todos',
    );
    if (index === -1) {
      throw new Error(`no open ${method} /api/todos`);
    }
    return open.splice(index, 1)[0];
  };
  return {
    respondList: (items) => take('GET').flush(items),
    respondCreate: (result) => {
      const request = take('POST');
      if (result === 'fail') {
        request.flush('Server error', { status: 500, statusText: 'Server Error' });
        return;
      }
      expect(request.request.body).toEqual({ title: result.title });
      request.flush(result);
    },
    pending: () => {
      collect();
      return open.length;
    },
  };
}

/** Alternative: an in-memory TodosApi whose calls wait until the test answers them. */
class FakeTodosApi implements Pick<TodosApi, 'list' | 'create'>, Backend {
  private readonly items: Todo[] = [];
  private readonly lists: Subject<Todo[]>[] = [];
  private readonly saves: Subject<Todo>[] = [];

  list(): Observable<Todo[]> {
    return hold(this.lists);
  }

  create(): Observable<Todo> {
    return hold(this.saves);
  }

  respondList(items: readonly Todo[]): void {
    this.items.push(...items);
    const call = oldest(this.lists);
    call.next([...this.items]);
    call.complete();
  }

  respondCreate(result: Todo | 'fail'): void {
    const call = oldest(this.saves);
    if (result === 'fail') {
      call.error(new Error('save failed'));
      return;
    }
    this.items.push(result);
    call.next(result);
    call.complete();
  }

  pending(): number {
    return this.lists.length + this.saves.length;
  }
}

function hold<T>(queue: Subject<T>[]): Observable<T> {
  const call = new Subject<T>();
  queue.push(call);
  return call.asObservable();
}

function oldest<T>(queue: Subject<T>[]): Subject<T> {
  const call = queue.shift();
  if (call === undefined) {
    throw new Error('no open call');
  }
  return call;
}

function fakeBackend(): Backend {
  const fake = new FakeTodosApi();
  TestBed.configureTestingModule({
    providers: [
      { provide: TodosApi, useValue: fake },
      provideRouter(todoRoutes, withComponentInputBinding()),
    ],
  });
  return fake;
}

const backends: [string, () => Backend][] = [
  ['HttpTestingController', httpBackend],
  ['fake TodosApi', fakeBackend],
];

const SEED: readonly Todo[] = [
  { id: 1, title: 'Buy milk' },
  { id: 2, title: 'Write tests' },
];

/** Navigates to `url` and drives the page through the DOM only. */
async function openPage(url: string) {
  const harness = await RouterTestingHarness.create();
  await harness.navigateByUrl(url, LabM29TodoPage);
  const root: HTMLElement = harness.fixture.nativeElement;
  const settle = async (): Promise<void> => {
    await harness.fixture.whenStable();
  };
  const field = (): HTMLInputElement => {
    const input = root.querySelector('input');
    if (input === null) {
      throw new Error('no input rendered');
    }
    return input;
  };
  const addButton = (): HTMLButtonElement => {
    const button = root.querySelector('button');
    if (button === null) {
      throw new Error('no button rendered');
    }
    return button;
  };
  const texts = (selector: string): string[] =>
    Array.from(root.querySelectorAll(selector), (element) => element.textContent?.trim() ?? '');
  return {
    settle,
    field,
    addButton,
    titles: () => texts('li'),
    alerts: () => texts('[role="alert"]'),
    type: async (text: string) => {
      field().value = text;
      field().dispatchEvent(new Event('input'));
      await settle();
    },
    submit: async () => {
      addButton().click();
      await settle();
    },
  };
}

// The backend each test started, so afterEach can check that nothing was left unanswered.
let started: Backend | undefined;
const trackedBackends = backends.map(
  ([name, create]) => [name, (): Backend => (started = create())] as const,
);

describe.each(trackedBackends)('E29.6 routed todo feature (%s)', (_name, setup) => {
  afterEach(() => {
    // The HTTP backend takes requests off the controller with match(), so verify() alone
    // cannot see an unanswered call; pending() counts the ones the backend still holds.
    expect(started?.pending() ?? 0).toBe(0);
    started = undefined;
    TestBed.inject(HttpTestingController, null, { optional: true })?.verify();
  });

  it('opening the page loads and lists the todos', async () => {
    const backend = setup();
    const page = await openPage('/todos');
    expect(page.titles()).toEqual([]);

    backend.respondList(SEED);
    await page.settle();

    expect(page.titles()).toEqual(['Buy milk', 'Write tests']);
  });

  it('the filter in the URL shows only matching todos', async () => {
    const backend = setup();
    const page = await openPage('/todos?q=milk');

    backend.respondList(SEED);
    await page.settle();

    expect(page.titles()).toEqual(['Buy milk']);
  });

  it('an empty title shows a validation error and sends nothing', async () => {
    const backend = setup();
    const page = await openPage('/todos');
    backend.respondList(SEED);
    await page.settle();

    await page.submit();

    expect(page.alerts()).toEqual(['Enter a title of at most 80 characters']);
    expect(backend.pending()).toBe(0);
  });

  it('adding a todo saves it and shows it in the list', async () => {
    const backend = setup();
    const page = await openPage('/todos');
    backend.respondList(SEED);
    await page.settle();

    await page.type('Call mom');
    await page.submit();
    expect(page.addButton().disabled).toBe(true);

    backend.respondCreate({ id: 3, title: 'Call mom' });
    await page.settle();

    expect(page.titles()).toEqual(['Buy milk', 'Write tests', 'Call mom']);
    expect(page.field().value).toBe('');
    expect(page.addButton().disabled).toBe(false);
  });

  it('a failed save shows an error and keeps the typed title', async () => {
    const backend = setup();
    const page = await openPage('/todos');
    backend.respondList(SEED);
    await page.settle();

    await page.type('Call mom');
    await page.submit();
    backend.respondCreate('fail');
    await page.settle();

    expect(page.alerts()).toEqual(['Could not save the todo']);
    expect(page.field().value).toBe('Call mom');
    expect(page.titles()).toEqual(['Buy milk', 'Write tests']);
  });

  it('no backend call is left pending', async () => {
    const backend = setup();
    const page = await openPage('/todos');
    expect(backend.pending()).toBe(1);

    backend.respondList(SEED);
    await page.type('Call mom');
    await page.submit();
    expect(backend.pending()).toBe(1);

    backend.respondCreate({ id: 3, title: 'Call mom' });
    await page.settle();
    expect(backend.pending()).toBe(0);
  });
});
