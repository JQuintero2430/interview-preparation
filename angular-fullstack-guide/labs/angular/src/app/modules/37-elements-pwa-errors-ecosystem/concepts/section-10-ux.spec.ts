import { HttpClient, HttpErrorResponse, httpResource, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationRef, Component, ErrorHandler, inject, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

/** Expected: the screen that asked can say something specific about it. */
class NotFound extends Error {}

/** Unexpected: nobody on this screen can act on it. */
class ServerFault extends Error {}

/** A tiny mapping layer: HTTP failures become domain errors. */
function toDomainError(error: unknown): unknown {
  if (!(error instanceof HttpErrorResponse)) return error;
  if (error.status === 404) return new NotFound('not found', { cause: error });
  return new ServerFault(`server answered ${error.status}`, { cause: error });
}

/** The avatar is optional: a 404 is a normal answer, anything else is passed on to the ErrorHandler. */
@Component({
  selector: 'lab-m37-s10-avatar',
  template: `<p data-testid="avatar">{{ message() }}</p>`,
})
class Avatar {
  private readonly http = inject(HttpClient);
  private readonly handler = inject(ErrorHandler);
  protected readonly message = signal('Loading');

  constructor() {
    this.http.get<{ name: string }>('/api/avatar').subscribe({
      next: (avatar) => this.message.set(avatar.name),
      error: (error: unknown) => this.fail(toDomainError(error)),
    });
  }

  private fail(error: unknown): void {
    if (error instanceof NotFound) {
      this.message.set('No avatar yet');
      return;
    }
    this.message.set('Something went wrong');
    this.handler.handleError(error);
  }
}

function setup(): { handled: unknown[]; http: HttpTestingController } {
  const handled: unknown[] = [];
  TestBed.configureTestingModule({
    rethrowApplicationErrors: false,
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: ErrorHandler, useValue: { handleError: (error: unknown) => handled.push(error) } },
    ],
  });
  return { handled, http: TestBed.inject(HttpTestingController) };
}

describe('Section 10: error UX', () => {
  it('Section 10: a 404 for an optional resource shows an inline message and does not reach ErrorHandler', async () => {
    const { handled, http } = setup();
    const fixture = TestBed.createComponent(Avatar);

    http.expectOne('/api/avatar').flush('missing', { status: 404, statusText: 'Not Found' });
    await fixture.whenStable();

    const texts = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('p')).map((p) => p.textContent);
    expect(texts).toEqual(['No avatar yet']);
    expect(handled).toEqual([]);
    http.verify();
  });

  it('Section 10: a 500 after the mapping layer reaches ErrorHandler once', async () => {
    const { handled, http } = setup();
    const fixture = TestBed.createComponent(Avatar);

    http.expectOne('/api/avatar').flush('boom', { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();

    const texts = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('p')).map((p) => p.textContent);
    expect(texts).toEqual(['Something went wrong']);
    expect(handled).toHaveLength(1);
    expect(handled[0]).toBeInstanceOf(ServerFault);
    expect((handled[0] as ServerFault).message).toBe('server answered 500');
    http.verify();
  });

  it('Section 10: a resource error stays in the resource state', async () => {
    const { handled, http } = setup();
    const profile = TestBed.runInInjectionContext(() => httpResource<{ name: string }>(() => '/api/profile'));
    TestBed.tick();

    http.expectOne('/api/profile').flush('boom', { status: 500, statusText: 'Server Error' });
    await TestBed.inject(ApplicationRef).whenStable();

    expect(profile.status()).toBe('error');
    expect(profile.error()).toBeInstanceOf(HttpErrorResponse);
    expect(handled).toEqual([]);
    http.verify();
  });
});
