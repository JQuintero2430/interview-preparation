import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';
import { ApiError } from './api-error';
import { Product } from './product';
import { ProductsApi, ProductsApiWithHttpParams } from './products-api';

const ADA: Product = { id: 7, name: 'Lamp', price: 12 };

interface Outcome<T> {
  value?: T;
  error?: ApiError;
}

function run<T>(source: Observable<T>): Outcome<T> {
  const outcome: Outcome<T> = {};
  source.subscribe({
    next: (value) => (outcome.value = value),
    error: (error: ApiError) => (outcome.error = error),
  });
  return outcome;
}

const variants: [string, Type<ProductsApi>][] = [
  ['plain params object', ProductsApi],
  ['HttpParams instance', ProductsApiWithHttpParams],
];

describe.each(variants)('E27.1 typed API service (%s)', (_name, service) => {
  let api: ProductsApi;
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    api = TestBed.inject(service);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  it('search sends the term and page as query parameters', () => {
    const outcome = run(api.search('a b', 2));
    const req = controller.expectOne('/api/products?q=a%20b&page=2');
    expect(req.request.method).toBe('GET');
    req.flush([ADA]);
    expect(outcome.value).toEqual([ADA]);
  });

  it('get returns the product with its ETag header', () => {
    const outcome = run(api.get(7));
    controller.expectOne('/api/products/7').flush(ADA, { headers: { ETag: 'v1' } });
    expect(outcome.value).toEqual({ product: ADA, etag: 'v1' });
  });

  it('a response that fails the guard becomes an invalid-response error', () => {
    const outcome = run(api.get(7));
    controller.expectOne('/api/products/7').flush({ id: '7' });
    expect(outcome.error).toEqual({ kind: 'invalid-response' });
  });

  it('a 404 becomes a not-found error', () => {
    const outcome = run(api.get(9));
    controller.expectOne('/api/products/9').flush({ code: 'NF' }, { status: 404, statusText: 'Not Found' });
    expect(outcome.error).toEqual({ kind: 'not-found' });
  });

  it('a network failure becomes an offline error', () => {
    const outcome = run(api.get(7));
    controller.expectOne('/api/products/7').error(new ProgressEvent('error'));
    expect(outcome.error).toEqual({ kind: 'offline' });
  });

  it('a 422 with field errors becomes a validation error carrying those fields', () => {
    const outcome = run(api.search('', 1));
    controller
      .expectOne('/api/products?q=&page=1')
      .flush({ fields: { q: ['Required'], page: 3 } }, { status: 422, statusText: 'Unprocessable Entity' });
    expect(outcome.error).toEqual({ kind: 'validation', fields: { q: ['Required'] } });
  });
});
