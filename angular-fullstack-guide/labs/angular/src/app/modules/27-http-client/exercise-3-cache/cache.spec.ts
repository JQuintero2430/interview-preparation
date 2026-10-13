import { HttpClient, HttpContext, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { cacheInterceptor, CACHE_TTL_MS, NO_CACHE } from './cache.interceptor';
import { CACHE_CLOCK, HttpCache, TwoMapHttpCache } from './http-cache';

const variants: [string, Type<Pick<HttpCache, keyof HttpCache>>][] = [
  ['single entry', HttpCache],
  ['two maps', TwoMapHttpCache],
];

describe.each(variants)('E27.3 cache interceptor (%s)', (_name, cacheType) => {
  let http: HttpClient;
  let controller: HttpTestingController;
  let now: number;
  const withTtl = (ms: number) => ({ context: new HttpContext().set(CACHE_TTL_MS, ms) });

  beforeEach(() => {
    now = 0;
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([cacheInterceptor])),
        provideHttpClientTesting(),
        { provide: CACHE_CLOCK, useValue: () => now },
        { provide: HttpCache, useClass: cacheType },
      ],
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  it('a second GET within the time to live is served without a request', () => {
    const bodies: unknown[] = [];
    http.get('/items?page=1', withTtl(1000)).subscribe((b) => bodies.push(b));
    controller.expectOne('/items?page=1').flush({ v: 1 });
    now = 999;
    http.get('/items?page=1', withTtl(1000)).subscribe((b) => bodies.push(b));
    controller.expectNone('/items?page=1');
    expect(bodies).toEqual([{ v: 1 }, { v: 1 }]);
  });

  it('a GET after the time to live expires sends a new request', () => {
    const bodies: unknown[] = [];
    http.get('/items', withTtl(1000)).subscribe((b) => bodies.push(b));
    controller.expectOne('/items').flush({ v: 1 });
    now = 1000;
    http.get('/items', withTtl(1000)).subscribe((b) => bodies.push(b));
    controller.expectOne('/items').flush({ v: 2 });
    expect(bodies).toEqual([{ v: 1 }, { v: 2 }]);
  });

  it('two concurrent GETs send one request and both receive the response', () => {
    const bodies: unknown[] = [];
    http.get('/items').subscribe((b) => bodies.push(b));
    http.get('/items').subscribe((b) => bodies.push(b));
    controller.expectOne('/items').flush({ v: 1 });
    expect(bodies).toEqual([{ v: 1 }, { v: 1 }]);
  });

  it('a successful POST to the collection invalidates its cached GETs', () => {
    http.get('/items?page=1').subscribe();
    controller.expectOne('/items?page=1').flush([]);
    http.get('/other').subscribe();
    controller.expectOne('/other').flush([]);

    http.post('/items', { name: 'a' }).subscribe();
    controller.expectOne({ method: 'POST', url: '/items' }).flush({ id: 1 });

    http.get('/items?page=1').subscribe();
    controller.expectOne('/items?page=1').flush([{ id: 1 }]);
    http.get('/other').subscribe();
    controller.expectNone('/other');
  });

  it('a request with an Authorization header is never cached', () => {
    const headers = { Authorization: 'Bearer a' };
    http.get('/me', { headers }).subscribe();
    controller.expectOne('/me').flush({ user: 'a' });
    http.get('/me', { headers: { Authorization: 'Bearer b' } }).subscribe();
    controller.expectOne('/me').flush({ user: 'b' });
  });

  it('a request with the NO_CACHE token always reaches the backend', () => {
    const context = new HttpContext().set(NO_CACHE, true);
    http.get('/items', { context }).subscribe();
    controller.expectOne('/items').flush({ v: 1 });
    http.get('/items', { context }).subscribe();
    controller.expectOne('/items').flush({ v: 2 });
    http.get('/items').subscribe();
    controller.expectOne('/items').flush({ v: 3 });
  });
});
