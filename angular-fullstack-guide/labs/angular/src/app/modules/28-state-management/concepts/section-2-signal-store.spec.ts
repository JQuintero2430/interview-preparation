import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TestBed } from '@angular/core/testing';
import { Subject, catchError, map, of, switchMap } from 'rxjs';

interface LabM28Product {
  readonly id: number;
  readonly name: string;
}

type LabM28LoadStatus = 'idle' | 'loading' | 'loaded' | 'error';

interface LabM28CatalogState {
  readonly query: string;
  readonly items: readonly LabM28Product[];
  readonly status: LabM28LoadStatus;
}

/** A feature store: private state, read-only selectors, methods as the only writers. */
@Injectable()
class LabM28CatalogStore {
  private readonly http = inject(HttpClient);
  private readonly state = signal<LabM28CatalogState>({ query: '', items: [], status: 'idle' });
  private readonly queries = new Subject<string>();

  readonly items = computed(() => this.state().items);
  readonly status = computed(() => this.state().status);
  readonly isEmpty = computed(() => this.status() === 'loaded' && this.items().length === 0);

  constructor() {
    this.queries
      .pipe(
        switchMap((q) =>
          this.http.get<LabM28Product[]>('/api/products', { params: { q } }).pipe(
            map((items): Partial<LabM28CatalogState> => ({ items, status: 'loaded' })),
            catchError(() => of<Partial<LabM28CatalogState>>({ status: 'error' })),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((change) => this.patch(change));
  }

  search(query: string): void {
    this.patch({ query, status: 'loading' });
    this.queries.next(query);
  }

  private patch(change: Partial<LabM28CatalogState>): void {
    this.state.update((current) => ({ ...current, ...change }));
  }
}

function setUpStore(): { store: LabM28CatalogStore; http: HttpTestingController } {
  return { store: TestBed.inject(LabM28CatalogStore), http: TestBed.inject(HttpTestingController) };
}

describe('Section 2: the service-with-signals store', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [LabM28CatalogStore, provideHttpClient(), provideHttpClientTesting()],
    }),
  );
  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('Section 2: a selector over the whole state re-runs on every update but its dependants stop when its result is unchanged', () => {
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
    state.update((s) => ({ ...s, filter: 'x' }));
    readAll();

    expect(runs).toEqual({ items: 3, count: 1, loading: 3 });
  });

  it('Section 2: the store exposes read-only signals and named methods', () => {
    const { store } = setUpStore();

    expect(typeof store.search).toBe('function');
    for (const selector of [store.items, store.status, store.isEmpty]) {
      expect('set' in selector).toBe(false);
      expect('update' in selector).toBe(false);
    }
    expect(() => {
      // @ts-expect-error a computed has no set: the selectors cannot be written from outside
      store.items.set([]);
    }).toThrow(TypeError);
    expect(store.status()).toBe('idle');
  });

  it('Section 2: a late response from an earlier search does not overwrite a newer one', () => {
    const { store, http } = setUpStore();

    store.search('pe');
    store.search('pen');
    const [first, second] = http.match((request) => request.url === '/api/products');
    expect([first.request.params.get('q'), second.request.params.get('q')]).toEqual(['pe', 'pen']);
    expect([first.cancelled, second.cancelled]).toEqual([true, false]);

    second.flush([{ id: 2, name: 'pen' }]);
    expect(() => first.flush([{ id: 1, name: 'pear' }])).toThrow('Cannot flush a cancelled request.');

    expect(store.items()).toEqual([{ id: 2, name: 'pen' }]);
    expect(store.status()).toBe('loaded');
  });

  it('Section 2: a failed load sets the error status and keeps the previous items', () => {
    const { store, http } = setUpStore();

    store.search('pen');
    http.expectOne('/api/products?q=pen').flush([{ id: 2, name: 'pen' }]);
    store.search('ink');
    http.expectOne('/api/products?q=ink').flush('boom', { status: 500, statusText: 'Server Error' });

    expect(store.status()).toBe('error');
    expect(store.items()).toEqual([{ id: 2, name: 'pen' }]);
  });

  it('Section 2: an empty result is reported only after the load has finished', () => {
    const { store, http } = setUpStore();

    expect(store.isEmpty()).toBe(false);
    store.search('zzz');
    expect(store.isEmpty()).toBe(false);
    http.expectOne('/api/products?q=zzz').flush([]);
    expect(store.isEmpty()).toBe(true);
  });
});
