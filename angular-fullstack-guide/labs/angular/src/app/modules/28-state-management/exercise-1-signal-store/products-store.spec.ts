import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, TestRequest, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationRef, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Product } from './product';
import { PRODUCTS_URL, ProductsStore, RxProductsStore } from './products-store';

const variants: [string, Type<ProductsStore | RxProductsStore>][] = [
  ['httpResource', ProductsStore],
  ['rxResource', RxProductsStore],
];

const pen: Product = { id: 1, name: 'pen' };
const pencil: Product = { id: 2, name: 'pencil' };

describe.each(variants)('E28.1 a feature store with signals (%s)', (_name, storeType) => {
  let controller: HttpTestingController;

  function setUp(): ProductsStore | RxProductsStore {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    controller = TestBed.inject(HttpTestingController);
    return TestBed.inject(storeType);
  }

  /** Runs the effects so the resource issues its request before the test looks. */
  function search(store: ProductsStore | RxProductsStore, query: string): void {
    store.search(query);
    TestBed.tick();
  }

  function productRequests(): TestRequest[] {
    return controller.match((req) => req.url === PRODUCTS_URL);
  }

  async function settle(): Promise<void> {
    await TestBed.inject(ApplicationRef).whenStable();
  }

  afterEach(() => controller.verify());

  it('a query of two or more characters sends one request with q as a parameter', async () => {
    const store = setUp();
    search(store, 'pe');
    const [request, ...others] = productRequests();
    expect(others).toHaveLength(0);
    expect(request.request.method).toBe('GET');
    expect(request.request.urlWithParams).toBe('/api/products?q=pe');
    expect(store.status()).toBe('loading');
    request.flush([pen, pencil]);
    await settle();
    expect(store.products()).toEqual([pen, pencil]);
    expect(store.status()).toBe('loaded');
  });

  it('a newer query cancels the earlier request', async () => {
    const store = setUp();
    search(store, 'pe');
    search(store, 'pen');
    const [first, second] = productRequests();
    expect([first.request.params.get('q'), second.request.params.get('q')]).toEqual(['pe', 'pen']);
    expect([first.cancelled, second.cancelled]).toEqual([true, false]);
    second.flush([pen]);
    await settle();
    expect(() => first.flush([pen, pencil])).toThrow('Cannot flush a cancelled request.');
    expect(store.products()).toEqual([pen]);
  });

  it('the store exposes products, status and error as read-only signals', () => {
    const store = setUp();
    for (const signal of [store.products, store.status, store.error, store.selected]) {
      expect('set' in signal).toBe(false);
      expect('update' in signal).toBe(false);
    }
    expect(() => {
      // @ts-expect-error a read-only signal has no set: only the store's methods write
      store.products.set([]);
    }).toThrow(TypeError);
    expect([store.products(), store.status(), store.error()]).toEqual([[], 'idle', undefined]);
  });

  it('selecting an id derives the selected product without a request', async () => {
    const store = setUp();
    search(store, 'pe');
    productRequests()[0].flush([pen, pencil]);
    await settle();
    expect(store.selected()).toBeNull();
    store.select(2);
    TestBed.tick();
    expect(store.selected()).toEqual(pencil);
    store.select(99);
    expect(store.selected()).toBeNull();
    expect(productRequests()).toHaveLength(0);
  });

  it('a failed request sets the error status', async () => {
    const store = setUp();
    search(store, 'pe');
    productRequests()[0].flush('boom', { status: 500, statusText: 'Server Error' });
    await settle();
    expect(store.status()).toBe('error');
    expect(store.error()).toBeDefined();
    expect(store.products()).toEqual([]);
  });

  it('a query shorter than two characters sends no request', () => {
    const store = setUp();
    search(store, 'p');
    search(store, ' p ');
    expect(productRequests()).toHaveLength(0);
    expect(store.status()).toBe('idle');
  });
});
