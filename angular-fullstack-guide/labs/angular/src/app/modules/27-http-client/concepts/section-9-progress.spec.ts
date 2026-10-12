import {
  HttpClient,
  HttpErrorResponse,
  HttpEvent,
  HttpEventType,
  HttpResponse,
  httpResource,
  provideHttpClient,
  withXhr,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationRef, Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, toArray } from 'rxjs';

const BODY = 'hello world';

function textFetch(): ReturnType<typeof vi.fn<typeof fetch>> {
  return vi.fn<typeof fetch>(
    async () => new Response(BODY, { status: 200, headers: { 'content-length': String(BODY.length) } }),
  );
}

function typesOf(events: HttpEvent<unknown>[]): HttpEventType[] {
  return events.map((event) => event.type);
}

describe('Section 9: progress events', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('Section 9: reportUploadProgress on the fetch backend fails with NG02824', async () => {
    const stub = textFetch();
    vi.stubGlobal('fetch', stub);
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    const http = TestBed.inject(HttpClient);
    const failure = await firstValueFrom(
      http.post('/up', new Blob(['x']), { reportUploadProgress: true, observe: 'events' }),
    ).then(
      () => undefined,
      (error: unknown) => error,
    );
    expect(failure).toBeInstanceOf(HttpErrorResponse);
    const response = failure as HttpErrorResponse;
    expect(response.status).toBe(0);
    expect(response.error.message).toContain('NG02824: The FetchBackend does not support upload progress reporting.');
    expect(response.message).toBe('Http failure response for (unknown url): undefined undefined');
    expect(stub).not.toHaveBeenCalled();
  });

  it('Section 9: the fetch backend reports download progress', async () => {
    vi.stubGlobal('fetch', textFetch());
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    const events = await firstValueFrom(
      TestBed.inject(HttpClient)
        .get('/d', { responseType: 'text', observe: 'events', reportDownloadProgress: true })
        .pipe(toArray()),
    );
    expect(typesOf(events)).toEqual([
      HttpEventType.Sent,
      HttpEventType.ResponseHeader,
      HttpEventType.DownloadProgress,
      HttpEventType.Response,
    ]);
    const progress = events[2];
    expect(progress.type === HttpEventType.DownloadProgress && [progress.loaded, progress.total]).toEqual([11, 11]);
  });

  it('Section 9: the deprecated reportProgress still reports download progress on the fetch backend', async () => {
    vi.stubGlobal('fetch', textFetch());
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    const events = await firstValueFrom(
      TestBed.inject(HttpClient)
        .get('/d', { responseType: 'text', observe: 'events', reportProgress: true })
        .pipe(toArray()),
    );
    expect(typesOf(events)).toContain(HttpEventType.DownloadProgress);
  });

  it("Section 9: observe 'response' delivers no progress events", async () => {
    vi.stubGlobal('fetch', textFetch());
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    const emissions = await firstValueFrom(
      TestBed.inject(HttpClient)
        .get('/d', { responseType: 'text', observe: 'response', reportDownloadProgress: true })
        .pipe(toArray()),
    );
    expect(emissions).toHaveLength(1);
    expect(emissions[0]).toBeInstanceOf(HttpResponse);
  });

  it('Section 9: an upload progress event reaches an events subscriber', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(withXhr()), provideHttpClientTesting()] });
    const controller = TestBed.inject(HttpTestingController);
    const events: HttpEvent<unknown>[] = [];
    TestBed.inject(HttpClient)
      .post('/up', new Blob(['x']), { reportUploadProgress: true, observe: 'events' })
      .subscribe((event) => events.push(event));
    const request = controller.expectOne('/up');
    expect(request.request.reportUploadProgress).toBe(true);
    request.event({ type: HttpEventType.UploadProgress, loaded: 5, total: 10 });
    request.flush({ id: 1 });
    expect(typesOf(events)).toEqual([HttpEventType.Sent, HttpEventType.UploadProgress, HttpEventType.Response]);
    const progress = events[1];
    expect(progress.type === HttpEventType.UploadProgress && [progress.loaded, progress.total]).toEqual([5, 10]);
    controller.verify();
  });

  it('Section 9: httpResource exposes download progress', async () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const controller = TestBed.inject(HttpTestingController);
    const resource = TestBed.runInInjectionContext(() =>
      httpResource.text(() => ({ url: '/big', reportProgress: true }), { injector: TestBed.inject(Injector) }),
    );
    TestBed.tick();
    const request = controller.expectOne('/big');
    expect(request.request.reportDownloadProgress).toBe(true);
    expect(resource.progress()).toBeUndefined();
    request.event({ type: HttpEventType.DownloadProgress, loaded: 3, total: 11 });
    expect(resource.progress()).toEqual({ type: HttpEventType.DownloadProgress, loaded: 3, total: 11 });
    request.flush(BODY);
    await TestBed.inject(ApplicationRef).whenStable();
    expect(resource.value()).toBe(BODY);
    controller.verify();
  });
});
