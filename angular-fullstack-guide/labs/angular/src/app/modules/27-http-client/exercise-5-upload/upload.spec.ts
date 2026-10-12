import {
  HttpErrorResponse,
  HttpEventType,
  provideHttpClient,
  withXhr,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UploadPanel } from './upload-panel';
import { RequestUploadService, UPLOAD_URL, UploadService, UploadState } from './upload.service';

const variants: [string, Type<UploadService>][] = [
  ['HttpClient.post', UploadService],
  ['HttpClient.request', RequestUploadService],
];

describe.each(variants)('E27.5 upload with progress and cancel (%s)', (_name, serviceType) => {
  /** The XHR backend first, then the testing backend, which replaces it. */
  function setUpXhr(): { service: UploadService; controller: HttpTestingController } {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
        { provide: UploadService, useClass: serviceType },
      ],
    });
    return { service: TestBed.inject(UploadService), controller: TestBed.inject(HttpTestingController) };
  }

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('the request asks for upload progress events', () => {
    const { service, controller } = setUpXhr();
    const blob = new Blob(['abc']);
    service.upload(blob).subscribe();
    const request = controller.expectOne(UPLOAD_URL);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toBe(blob);
    expect(request.request.reportUploadProgress).toBe(true);
    request.flush({ id: 'x' });
    controller.verify();
  });

  it('upload progress events become rounded percentages', () => {
    const { service, controller } = setUpXhr();
    const states: UploadState[] = [];
    service.upload(new Blob(['abc'])).subscribe((state) => states.push(state));
    const request = controller.expectOne(UPLOAD_URL);
    for (const [loaded, total] of [[1, 3], [2, 3], [999, 1000]]) {
      request.event({ type: HttpEventType.UploadProgress, loaded, total });
    }
    expect(states).toEqual([
      { kind: 'progress', percent: 33 },
      { kind: 'progress', percent: 66 },
      { kind: 'progress', percent: 99 },
    ]);
    request.flush({ id: 'x' });
    controller.verify();
  });

  it('the response becomes a done state with the server id', () => {
    const { service, controller } = setUpXhr();
    const states: UploadState[] = [];
    let completed = false;
    service.upload(new Blob(['abc'])).subscribe({ next: (state) => states.push(state), complete: () => (completed = true) });
    const request = controller.expectOne(UPLOAD_URL);
    request.event({ type: HttpEventType.UploadProgress, loaded: 1, total: 2 });
    request.flush({ id: 'file-7' });
    expect(states).toEqual([
      { kind: 'progress', percent: 50 },
      { kind: 'done', id: 'file-7' },
    ]);
    expect(completed).toBe(true);
    controller.verify();
  });

  it('cancel aborts the request', () => {
    const { controller } = setUpXhr();
    const fixture = TestBed.createComponent(UploadPanel);
    fixture.componentInstance.start(new Blob(['abc']));
    const request = controller.expectOne(UPLOAD_URL);
    request.event({ type: HttpEventType.UploadProgress, loaded: 1, total: 4 });
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    const button = element.querySelector<HTMLButtonElement>('button.cancel');
    expect(element.querySelector('.status')?.textContent).toBe('25%');
    expect(request.cancelled).toBe(false);
    button?.click();
    fixture.detectChanges();
    expect(request.cancelled).toBe(true);
    expect(element.querySelector('.status')?.textContent).toBe('Cancelled');
    expect(button?.disabled).toBe(true);
    controller.verify();
  });

  it('an error response becomes a failed state', () => {
    const { service, controller } = setUpXhr();
    const states: UploadState[] = [];
    let completed = false;
    service.upload(new Blob(['abc'])).subscribe({ next: (state) => states.push(state), complete: () => (completed = true) });
    controller.expectOne(UPLOAD_URL).flush({ message: 'too big' }, { status: 413, statusText: 'Payload Too Large' });
    expect(states).toHaveLength(1);
    const state = states[0];
    expect(state.kind).toBe('failed');
    const error = state.kind === 'failed' ? state.error : null;
    expect(error).toBeInstanceOf(HttpErrorResponse);
    expect((error as HttpErrorResponse).status).toBe(413);
    expect(completed).toBe(true);
    controller.verify();
  });

  it('on the default fetch backend the upload fails with NG02824', async () => {
    const stub = vi.fn<typeof fetch>(async () => new Response('{"id":"x"}', { status: 200 }));
    vi.stubGlobal('fetch', stub);
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), { provide: UploadService, useClass: serviceType }],
    });
    const states = await new Promise<UploadState[]>((resolve) => {
      const seen: UploadState[] = [];
      TestBed.inject(UploadService)
        .upload(new Blob(['abc']))
        .subscribe({ next: (state) => seen.push(state), complete: () => resolve(seen) });
    });
    expect(states).toHaveLength(1);
    const state = states[0];
    const error = state.kind === 'failed' ? state.error : null;
    expect(error).toBeInstanceOf(HttpErrorResponse);
    expect((error as HttpErrorResponse).status).toBe(0);
    expect((error as HttpErrorResponse).error.message).toContain('NG02824');
    expect(stub).not.toHaveBeenCalled();
  });
});
