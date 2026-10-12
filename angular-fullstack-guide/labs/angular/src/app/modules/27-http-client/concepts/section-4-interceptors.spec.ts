import {
  HttpClient,
  HttpFeature,
  HttpFeatureKind,
  HttpInterceptorFn,
  HttpResponse,
  provideHttpClient,
  withInterceptors,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { InjectionToken, Provider, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, tap } from 'rxjs';
import {
  LAB_M27_LEGACY_LOG,
  labM27HeaderInterceptor,
  labM27LegacyInterceptorProvider,
} from '../legacy/legacy-interceptor';

const GREETING = new InjectionToken<string>('LAB_M27_GREETING');

function logging(log: string[], name: string): HttpInterceptorFn {
  return (req, next) => {
    log.push(`${name} req headers=${req.headers.keys().join(',')}`);
    return next(req).pipe(
      tap((event) => {
        if (event instanceof HttpResponse) {
          log.push(`${name} res`);
        }
      }),
    );
  };
}

describe('Section 4: interceptors', () => {
  function setup(
    log: string[],
    features: HttpFeature<HttpFeatureKind>[],
    extra: Provider[] = [],
  ): { http: HttpClient; controller: HttpTestingController } {
    TestBed.configureTestingModule({
      providers: [
        { provide: LAB_M27_LEGACY_LOG, useValue: log },
        provideHttpClient(...features),
        provideHttpClientTesting(),
        ...extra,
      ],
    });
    return { http: TestBed.inject(HttpClient), controller: TestBed.inject(HttpTestingController) };
  }

  it('Section 4: interceptors run in list order on the way out and in reverse on the way back', () => {
    const log: string[] = [];
    const a: HttpInterceptorFn = (req, next) => logging(log, 'A')(req.clone({ setHeaders: { 'X-A': '1' } }), next);
    const { http, controller } = setup(log, [withInterceptors([a, logging(log, 'B')])]);
    http.get('/v').subscribe();
    const request = controller.expectOne('/v');
    expect(request.request.headers.get('X-A')).toBe('1');
    request.flush('ok');
    expect(log).toEqual(['A req headers=X-A', 'B req headers=X-A', 'B res', 'A res']);
  });

  it('Section 4: a later interceptor sees the header an earlier one added', () => {
    const log: string[] = [];
    const add: HttpInterceptorFn = (req, next) => next(req.clone({ setHeaders: { 'X-First': '1' } }));
    const { http, controller } = setup(log, [withInterceptors([add, logging(log, 'second')])]);
    http.get('/v').subscribe();
    controller.expectOne('/v').flush('ok');
    expect(log[0]).toBe('second req headers=X-First');
  });

  it('Section 4: an interceptor can answer without reaching the backend', () => {
    const log: string[] = [];
    const cached: HttpInterceptorFn = (req, next) =>
      req.url === '/cached' ? of(new HttpResponse({ status: 200, body: 'from-cache' })) : next(req);
    const { http, controller } = setup(log, [withInterceptors([cached])]);
    let body: unknown;
    http.get('/cached').subscribe((value) => (body = value));
    expect(body).toBe('from-cache');
    controller.expectNone('/cached');
    http.get('/live').subscribe();
    controller.expectOne('/live').flush('live');
    controller.verify();
  });

  it('Section 4: inject works inside a functional interceptor', () => {
    const log: string[] = [];
    const greeter: HttpInterceptorFn = (req, next) =>
      next(req.clone({ setHeaders: { 'X-Greeting': inject(GREETING) } }));
    const { http, controller } = setup(log, [withInterceptors([greeter])], [{ provide: GREETING, useValue: 'hello' }]);
    http.get('/v').subscribe();
    const request = controller.expectOne('/v');
    expect(request.request.headers.get('X-Greeting')).toBe('hello');
    request.flush('ok');
  });

  it('Section 4: an interceptor that does not clone sends the request unchanged', () => {
    const log: string[] = [];
    const lost: HttpInterceptorFn = (req, next) => {
      req.headers.set('X-Lost', '1');
      return next(req);
    };
    const { http, controller } = setup(log, [withInterceptors([lost])]);
    http.get('/v').subscribe();
    const request = controller.expectOne('/v');
    expect(request.request.headers.has('X-Lost')).toBe(false);
    request.flush('ok');
  });

  it('Section 4: class interceptors run only with withInterceptorsFromDi', () => {
    const without: string[] = [];
    const first = setup(without, [], [labM27LegacyInterceptorProvider]);
    first.http.get('/v').subscribe();
    first.controller.expectOne('/v').flush('ok');
    expect(without).toEqual([]);

    TestBed.resetTestingModule();
    const withDi: string[] = [];
    const second = setup(withDi, [withInterceptorsFromDi()], [labM27LegacyInterceptorProvider]);
    second.http.get('/v').subscribe();
    const request = second.controller.expectOne('/v');
    expect(request.request.headers.get('X-Lab')).toBe('legacy');
    request.flush('ok');
    expect(withDi).toEqual(['Legacy req']);
  });

  it('Section 4: class interceptors run at the position of withInterceptorsFromDi', () => {
    const functionalFirst: string[] = [];
    const a = setup(
      functionalFirst,
      [withInterceptors([logging(functionalFirst, 'A')]), withInterceptorsFromDi()],
      [labM27LegacyInterceptorProvider],
    );
    a.http.get('/v').subscribe();
    a.controller.expectOne('/v').flush('ok');
    expect(functionalFirst.filter((line) => !line.includes(' res'))).toEqual(['A req headers=', 'Legacy req']);

    TestBed.resetTestingModule();
    const classFirst: string[] = [];
    const b = setup(
      classFirst,
      [withInterceptorsFromDi(), withInterceptors([logging(classFirst, 'A')])],
      [labM27LegacyInterceptorProvider],
    );
    b.http.get('/v').subscribe();
    b.controller.expectOne('/v').flush('ok');
    expect(classFirst.filter((line) => !line.includes(' res'))).toEqual(['Legacy req', 'A req headers=X-Lab']);
  });

  it('Section 4: the functional replacement does what the class interceptor did', () => {
    const log: string[] = [];
    const { http, controller } = setup(log, [withInterceptors([labM27HeaderInterceptor])]);
    http.get('/v').subscribe();
    const request = controller.expectOne('/v');
    expect(request.request.headers.get('X-Lab')).toBe('legacy');
    request.flush('ok');
    expect(log).toEqual(['Header req']);
  });
});
