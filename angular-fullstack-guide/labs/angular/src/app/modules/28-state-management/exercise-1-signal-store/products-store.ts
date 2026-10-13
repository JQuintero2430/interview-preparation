import { HttpClient, httpResource } from '@angular/common/http';
import { Injectable, ResourceStatus, Signal, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { Product, parseProducts } from './product';

export const PRODUCTS_URL = '/api/products';

/** The shortest query that is sent; anything shorter leaves the resource idle. */
export const MIN_QUERY_LENGTH = 2;

export type ProductsStatus = 'idle' | 'loading' | 'loaded' | 'error';

/** Client state only: the server cache lives in the resource, not here. */
interface ProductsState {
  readonly query: string;
  readonly selectedId: number | null;
}

const initialState: ProductsState = { query: '', selectedId: null };

function toStatus(status: ResourceStatus): ProductsStatus {
  switch (status) {
    case 'idle':
      return 'idle';
    case 'loading':
    case 'reloading':
      return 'loading';
    case 'error':
      return 'error';
    default:
      return 'loaded';
  }
}

/** The trimmed query when it is long enough to send, otherwise `undefined`: no request. */
function sendable(query: string): string | undefined {
  const trimmed = query.trim();
  return trimmed.length < MIN_QUERY_LENGTH ? undefined : trimmed;
}

@Injectable({ providedIn: 'root' })
export class ProductsStore {
  private readonly state = signal<ProductsState>(initialState);

  /** The request reads this slice, not the whole state: `select` leaves the request function's result equal. */
  private readonly sendableQuery = computed(() => sendable(this.state().query));

  /** Eager: a changed query cancels the pending request and starts the next one. */
  private readonly resource = httpResource<Product[]>(
    () => {
      const q = this.sendableQuery();
      return q === undefined ? undefined : { url: PRODUCTS_URL, params: { q } };
    },
    { parse: parseProducts },
  );

  readonly products: Signal<readonly Product[]> = computed(() =>
    this.resource.hasValue() ? this.resource.value() : [],
  );
  readonly status: Signal<ProductsStatus> = computed(() => toStatus(this.resource.status()));
  readonly error: Signal<Error | undefined> = this.resource.error;
  readonly selected: Signal<Product | null> = computed(
    () => this.products().find((product) => product.id === this.state().selectedId) ?? null,
  );

  search(query: string): void {
    this.state.update((current) => ({ ...current, query }));
  }

  select(id: number | null): void {
    this.state.update((current) => ({ ...current, selectedId: id }));
  }
}

/** Alternative: the same public API over `HttpClient` and `rxResource`. */
@Injectable({ providedIn: 'root' })
export class RxProductsStore {
  private readonly http = inject(HttpClient);
  private readonly state = signal<ProductsState>(initialState);

  private readonly sendableQuery = computed(() => sendable(this.state().query));

  private readonly resource = rxResource<Product[], string | undefined>({
    params: this.sendableQuery,
    stream: ({ params: q }) =>
      this.http.get<unknown>(PRODUCTS_URL, { params: { q } }).pipe(map(parseProducts)),
  });

  readonly products: Signal<readonly Product[]> = computed(() =>
    this.resource.hasValue() ? this.resource.value() : [],
  );
  readonly status: Signal<ProductsStatus> = computed(() => toStatus(this.resource.status()));
  readonly error: Signal<Error | undefined> = this.resource.error;
  readonly selected: Signal<Product | null> = computed(
    () => this.products().find((product) => product.id === this.state().selectedId) ?? null,
  );

  search(query: string): void {
    this.state.update((current) => ({ ...current, query }));
  }

  select(id: number | null): void {
    this.state.update((current) => ({ ...current, selectedId: id }));
  }
}
