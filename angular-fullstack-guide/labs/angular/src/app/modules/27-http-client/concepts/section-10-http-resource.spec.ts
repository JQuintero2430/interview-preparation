import {
  HttpErrorResponse,
  HttpHeaders,
  HttpInterceptorFn,
  httpResource,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationRef, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

interface LabM27User {
  readonly id: number;
  readonly name: string;
}

function setup(...features: Parameters<typeof provideHttpClient>): HttpTestingController {
  TestBed.configureTestingModule({ providers: [provideHttpClient(...features), provideHttpClientTesting()] });
  return TestBed.inject(HttpTestingController);
}

function userResource(id: () => number | undefined) {
  return TestBed.runInInjectionContext(() =>
    httpResource<LabM27User>(() => (id() === undefined ? undefined : `/users/${id()}`)),
  );
}

async function settle(): Promise<void> {
  await TestBed.inject(ApplicationRef).whenStable();
}

describe('Section 10: httpResource', () => {
  it('Section 10: an undefined request leaves the resource idle with no request', () => {
    const controller = setup();
    const resource = userResource(() => undefined);
    TestBed.tick();
    expect(resource.status()).toBe('idle');
    expect(controller.match(() => true)).toHaveLength(0);
  });

  it('Section 10: a URL change cancels the previous request', () => {
    const controller = setup();
    const id = signal<number | undefined>(undefined);
    const resource = userResource(id);
    id.set(1);
    TestBed.tick();
    expect(resource.status()).toBe('loading');
    expect(resource.value()).toBeUndefined();
    const first = controller.expectOne('/users/1');
    id.set(2);
    TestBed.tick();
    expect(first.cancelled).toBe(true);
    controller.expectOne('/users/2');
  });

  it('Section 10: a resolved resource exposes value, statusCode and headers', async () => {
    const controller = setup();
    const resource = userResource(() => 2);
    TestBed.tick();
    controller.expectOne('/users/2').flush({ id: 2, name: 'Bo' }, { headers: { ETag: 'e2' } });
    await settle();
    expect(resource.status()).toBe('resolved');
    expect(resource.value()).toEqual({ id: 2, name: 'Bo' });
    expect(resource.statusCode()).toBe(200);
    expect(resource.headers()?.get('ETag')).toBe('e2');
    expect(resource.hasValue()).toBe(true);
    expect(resource.isLoading()).toBe(false);
    controller.verify();
  });

  it('Section 10: a params change resets value while reload keeps it', async () => {
    const controller = setup();
    const id = signal(1);
    const resource = userResource(id);
    TestBed.tick();
    controller.expectOne('/users/1').flush({ id: 1, name: 'Al' });
    await settle();
    resource.reload();
    TestBed.tick();
    expect(resource.status()).toBe('reloading');
    expect(resource.value()).toEqual({ id: 1, name: 'Al' });
    controller.expectOne('/users/1').flush({ id: 1, name: 'Al' });
    await settle();
    id.set(3);
    TestBed.tick();
    expect(resource.status()).toBe('loading');
    expect(resource.value()).toBeUndefined();
    controller.expectOne('/users/3');
  });

  it('Section 10: set puts the resource in local with the written value', async () => {
    const controller = setup();
    const resource = userResource(() => 1);
    TestBed.tick();
    controller.expectOne('/users/1').flush({ id: 1, name: 'Al' });
    await settle();
    resource.set({ id: 1, name: 'Local' });
    expect(resource.status()).toBe('local');
    expect(resource.value()).toEqual({ id: 1, name: 'Local' });
    controller.verify();
  });

  it('Section 10: a 404 puts the resource in error and value throws', async () => {
    const controller = setup();
    const resource = userResource(() => 3);
    TestBed.tick();
    controller.expectOne('/users/3').flush('missing', { status: 404, statusText: 'Not Found' });
    await settle();
    expect(resource.status()).toBe('error');
    const error = resource.error();
    expect(error).toBeInstanceOf(HttpErrorResponse);
    expect((error as HttpErrorResponse).status).toBe(404);
    expect(resource.statusCode()).toBe(404);
    expect(resource.hasValue()).toBe(false);
    expect(() => resource.value()).toThrow(
      'Resource is currently in an error state (see Error.cause for details): Http failure response for /users/3: 404 Not Found',
    );
    controller.verify();
  });

  it('Section 10: reload after an error is reloading', async () => {
    const controller = setup();
    const resource = userResource(() => 3);
    TestBed.tick();
    controller.expectOne('/users/3').flush('missing', { status: 404, statusText: 'Not Found' });
    await settle();
    resource.reload();
    TestBed.tick();
    expect(resource.status()).toBe('reloading');
    controller.expectOne('/users/3').flush({ id: 3, name: 'Cy' });
    await settle();
    expect(resource.status()).toBe('resolved');
    expect(resource.value()).toEqual({ id: 3, name: 'Cy' });
    controller.verify();
  });

  it('Section 10: a request object sends params and headers', () => {
    const controller = setup();
    const q = signal('ab');
    TestBed.runInInjectionContext(() =>
      httpResource<string[]>(() => ({ url: '/search', params: { q: q() }, headers: { 'X-T': '1' } })),
    );
    TestBed.tick();
    const request = controller.expectOne((req) => req.url === '/search');
    expect(request.request.urlWithParams).toBe('/search?q=ab');
    expect(request.request.method).toBe('GET');
    expect(request.request.headers.get('X-T')).toBe('1');
  });

  it('Section 10: defaultValue is the value while loading', () => {
    const controller = setup();
    const resource = TestBed.runInInjectionContext(() =>
      httpResource<string[]>(() => '/list', { defaultValue: [] }),
    );
    TestBed.tick();
    expect(resource.status()).toBe('loading');
    expect(resource.value()).toEqual([]);
    controller.expectOne('/list');
  });

  it('Section 10: a throwing parse puts the resource in error', async () => {
    const controller = setup();
    const parse = (raw: unknown): string[] => {
      if (!Array.isArray(raw)) {
        throw new Error('bad shape');
      }
      return raw.map(String);
    };
    const resource = TestBed.runInInjectionContext(() => httpResource(() => '/list', { parse }));
    TestBed.tick();
    controller.expectOne('/list').flush({ not: 'an array' });
    await TestBed.inject(ApplicationRef).whenStable();
    expect(resource.status()).toBe('error');
    expect((resource.error() as Error).message).toBe('bad shape');
    controller.verify();
  });

  it('Section 10: httpResource requests pass through interceptors', async () => {
    const seen: string[] = [];
    const auth: HttpInterceptorFn = (req, next) => {
      seen.push(req.url);
      return next(req.clone({ headers: new HttpHeaders({ Authorization: 'Bearer t' }) }));
    };
    const controller = setup(withInterceptors([auth]));
    const resource = TestBed.runInInjectionContext(() => httpResource.text(() => '/me'));
    TestBed.tick();
    const request = controller.expectOne('/me');
    expect(request.request.headers.get('Authorization')).toBe('Bearer t');
    request.flush('plain');
    await settle();
    expect(seen).toEqual(['/me']);
    expect(resource.value()).toBe('plain');
    controller.verify();
  });

  it('Section 10: httpResource outside an injection context throws NG0203', () => {
    expect(() => httpResource(() => '/x')).toThrow(/NG0203/);
  });
});
