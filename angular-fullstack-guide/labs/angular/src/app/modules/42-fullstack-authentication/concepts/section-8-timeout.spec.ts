import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { redirectOn401 } from './auth.interceptor';
import { LAB_M42_NAVIGATE } from './bff-client';
import {
  LAB_M42_DRAFT_STORAGE,
  LabM42DraftSubmit,
  LabM42IdleTimer,
  type LabM42DraftStorage,
  restartIdleOnResponse,
} from './idle-timer';

// Every server answer is our stub. The timer's default is 30 minutes with a warning one minute before; Vitest fake timers
// move it, so no test waits and none reads the clock.
const MINUTE = 60_000;
const UNAUTHORIZED = { status: 401, statusText: 'Unauthorized' };

function setUp() {
  const navigate = vi.fn<(url: string) => void>();
  const drafts = new Map<string, string>();
  const storage: LabM42DraftStorage = {
    getItem: (key) => drafts.get(key) ?? null,
    setItem: (key, value) => void drafts.set(key, value),
    removeItem: (key) => void drafts.delete(key),
  };
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(withInterceptors([redirectOn401, restartIdleOnResponse])),
      provideHttpClientTesting(),
      { provide: LAB_M42_NAVIGATE, useValue: navigate },
      { provide: LAB_M42_DRAFT_STORAGE, useValue: storage },
    ],
  });
  return {
    controller: TestBed.inject(HttpTestingController),
    http: TestBed.inject(HttpClient),
    timer: TestBed.inject(LabM42IdleTimer),
    form: TestBed.inject(LabM42DraftSubmit),
    navigate,
  };
}

describe('Section 8: session timeout UX', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('Section 8: the warning appears one minute before the idle timeout', () => {
    const { timer } = setUp();
    timer.restart();

    vi.advanceTimersByTime(29 * MINUTE - 1);
    expect(timer.phase()).toBe('active');
    vi.advanceTimersByTime(1);
    expect(timer.phase()).toBe('warning');
    vi.advanceTimersByTime(MINUTE);
    expect(timer.phase()).toBe('expired');
  });

  it('Section 8: activity before the warning restarts the countdown', () => {
    const { controller, http, timer } = setUp();
    timer.restart();
    vi.advanceTimersByTime(20 * MINUTE);

    http.get('/api/orders').subscribe();
    controller.expectOne('/api/orders').flush([]);

    // 29 minutes after the response, not after the first restart, the warning shows.
    vi.advanceTimersByTime(29 * MINUTE - 1);
    expect(timer.phase()).toBe('active');
    vi.advanceTimersByTime(1);
    expect(timer.phase()).toBe('warning');
    controller.verify();
  });

  it('Section 8: a 401 on submit keeps the draft for after login', async () => {
    const { controller, form, navigate, timer } = setUp();
    timer.restart();
    vi.advanceTimersByTime(MINUTE);

    const failed = form.submit('note', '/api/notes', 'a long text');
    controller.expectOne('/api/notes').flush(null, UNAUTHORIZED);
    await expect(failed).rejects.toMatchObject({ status: 401 });

    expect(navigate).toHaveBeenCalledOnce();
    expect(navigate).toHaveBeenCalledWith('/oauth2/authorization/idp');
    expect(form.restore('note')).toBe('a long text');
    // A 401 is not activity: the countdown is still running from the restart.
    vi.advanceTimersByTime(28 * MINUTE);
    expect(timer.phase()).toBe('warning');

    const retried = form.submit('note', '/api/notes', form.restore('note') ?? '');
    controller.expectOne('/api/notes').flush({});
    await retried;
    expect(form.restore('note')).toBeNull();
    controller.verify();
  });
});
