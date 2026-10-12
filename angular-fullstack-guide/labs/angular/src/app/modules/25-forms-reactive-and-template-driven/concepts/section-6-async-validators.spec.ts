import { AsyncValidatorFn, FormControl, ValidationErrors, Validators } from '@angular/forms';
import { NEVER, Observable, Subject, of, startWith, switchMap, timer } from 'rxjs';

interface LabM25TakenLog {
  readonly calls: string[];
  readonly cancelled: string[];
}

function labM25Taken(log: LabM25TakenLog, answerAfterMs = 100): AsyncValidatorFn {
  return (control) =>
    new Observable<ValidationErrors | null>((subscriber) => {
      const value = String(control.value);
      let answered = false;
      log.calls.push(value);
      const timerId = setTimeout(() => {
        answered = true;
        subscriber.next(value === 'ann' ? { taken: true } : null);
        subscriber.complete();
      }, answerAfterMs);
      return () => {
        clearTimeout(timerId);
        if (!answered) log.cancelled.push(value);
      };
    });
}

function labM25Log(): LabM25TakenLog {
  return { calls: [], cancelled: [] };
}

function labM25Debounced(serverCalls: string[], pauseMs: number): AsyncValidatorFn {
  return (control) =>
    timer(pauseMs).pipe(
      switchMap(() => {
        serverCalls.push(String(control.value));
        return of(null);
      }),
    );
}

const labM25FirstEmissionOnly: AsyncValidatorFn = () => NEVER.pipe(startWith(null));

describe('Section 6: async validators', () => {
  it('Section 6: async validators wait for the sync validators to pass', () => {
    const log = labM25Log();
    const control = new FormControl('', { validators: Validators.required, asyncValidators: labM25Taken(log) });
    expect(control.status).toBe('INVALID');
    expect(log.calls).toEqual([]);

    const short = new FormControl('ab', {
      validators: Validators.minLength(3),
      asyncValidators: labM25Taken(log),
    });
    expect(short.status).toBe('INVALID');
    expect(log.calls).toEqual([]);

    short.setValue('abc');
    expect(short.status).toBe('PENDING');
    expect(log.calls).toEqual(['abc']);
    short.setValue('ab');
    expect(short.status).toBe('INVALID');
    expect(log.cancelled).toEqual(['abc']);
  });

  it('Section 6: a new value cancels the running async validator', () => {
    vi.useFakeTimers();
    try {
      const log = labM25Log();
      const control = new FormControl('', { validators: Validators.required, asyncValidators: labM25Taken(log) });
      control.setValue('a');
      control.setValue('an');
      control.setValue('ann');
      expect(log.calls).toEqual(['a', 'an', 'ann']);
      expect(log.cancelled).toEqual(['a', 'an']);
      vi.advanceTimersByTime(150);
      expect(control.status).toBe('INVALID');
      expect(control.errors).toEqual({ taken: true });
      expect(log.cancelled).toEqual(['a', 'an']);
    } finally {
      vi.useRealTimers();
    }
  });

  it('Section 6: the control is PENDING while the async validator runs', () => {
    vi.useFakeTimers();
    try {
      const log = labM25Log();
      const control = new FormControl('', { validators: Validators.required, asyncValidators: labM25Taken(log) });
      const statuses: string[] = [];
      control.statusChanges.subscribe((status) => statuses.push(status));
      control.setValue('free');
      expect(control.status).toBe('PENDING');
      expect(control.pending).toBe(true);
      expect(control.valid).toBe(false);
      expect(control.invalid).toBe(false);
      vi.advanceTimersByTime(100);
      expect(control.status).toBe('VALID');
      expect(control.pending).toBe(false);
      expect(statuses).toEqual(['PENDING', 'VALID']);
    } finally {
      vi.useRealTimers();
    }
  });

  it('Section 6: a timer inside the validator sends one request per pause', () => {
    vi.useFakeTimers();
    try {
      const serverCalls: string[] = [];
      const control = new FormControl('', { asyncValidators: labM25Debounced(serverCalls, 300) });
      control.setValue('x');
      vi.advanceTimersByTime(100);
      control.setValue('xy');
      vi.advanceTimersByTime(100);
      control.setValue('xyz');
      vi.advanceTimersByTime(299);
      expect(control.status).toBe('PENDING');
      expect(serverCalls).toEqual([]);
      vi.advanceTimersByTime(1);
      expect(serverCalls).toEqual(['xyz']);
      expect(control.status).toBe('VALID');
    } finally {
      vi.useRealTimers();
    }
  });

  it('Section 6: one async validator settles on its first emission', () => {
    const control = new FormControl('', { asyncValidators: labM25FirstEmissionOnly });
    control.setValue('m');
    expect(control.status).toBe('VALID');
    expect(control.errors).toBeNull();
  });

  it('Section 6: two async validators wait for both to complete', () => {
    const late = new Subject<ValidationErrors | null>();
    const control = new FormControl('', { asyncValidators: [() => of(null), () => late] });
    control.setValue('m');
    expect(control.status).toBe('PENDING');
    late.next({ late: true });
    expect(control.status).toBe('PENDING');
    late.complete();
    expect(control.status).toBe('INVALID');
    expect(control.errors).toEqual({ late: true });

    const neverCompletes = new FormControl('', { asyncValidators: [() => of(null), labM25FirstEmissionOnly] });
    neverCompletes.setValue('m');
    expect(neverCompletes.status).toBe('PENDING');
  });

  it('Section 6: an array of one async validator also waits for completion', () => {
    const wrapped = new FormControl('', { asyncValidators: [labM25FirstEmissionOnly] });
    wrapped.setValue('m');
    expect(wrapped.status).toBe('PENDING');
    const bare = new FormControl('', { asyncValidators: labM25FirstEmissionOnly });
    bare.setValue('m');
    expect(bare.status).toBe('VALID');
  });
});
