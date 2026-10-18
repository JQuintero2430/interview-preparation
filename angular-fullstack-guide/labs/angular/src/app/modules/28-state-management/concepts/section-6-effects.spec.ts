import { ErrorHandler, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Actions, createEffect, ofType, provideEffects } from '@ngrx/effects';
import { mapResponse, tapResponse } from '@ngrx/operators';
import { Store, createAction, createFeatureSelector, createReducer, on, props, provideStore } from '@ngrx/store';
import { Observable, Subject, catchError, concatMap, config, delay, map, mergeMap, of, switchMap, tap, throwError } from 'rxjs';
import { LabM28Effects, labM28LegacyLoad, labM28LegacyLoaded } from '../legacy/class-effects';

const labM28Load = createAction('Load', props<{ n: number }>());
const labM28Loaded = createAction('Loaded', props<{ n: number }>());
const labM28Failed = createAction('Failed', props<{ n: number }>());

/** The request of the effects below: it fails for 2 and answers with its own argument otherwise. */
function labM28Api(n: number): Observable<number> {
  return n === 2 ? throwError(() => new Error('fail 2')) : of(n);
}

/** A recording stand-in for Angular's ErrorHandler, so the test sees what NgRx reports. */
function labM28RecordingHandler(log: string[]): { handleError: (error: unknown) => void } {
  return { handleError: (error) => log.push(`handled ${error instanceof Error ? error.message : String(error)}`) };
}

/** An effect that only observes: it writes the type of every action it sees into the given array. */
function labM28CreateLogEffect(log: string[]) {
  return createEffect(
    (actions$ = inject(Actions)) =>
      actions$.pipe(
        ofType(labM28Load, labM28Loaded, labM28Failed),
        tap((action) => log.push(action.type)),
      ),
    { functional: true, dispatch: false },
  );
}

/** A loading effect whose error is caught inside the inner pipe, so the outer stream never sees it. */
function labM28CreateInnerCatchEffect() {
  return createEffect(
    (actions$ = inject(Actions)) =>
      actions$.pipe(
        ofType(labM28Load),
        switchMap(({ n }) =>
          labM28Api(n).pipe(
            map((value) => labM28Loaded({ n: value })),
            catchError(() => of(labM28Failed({ n }))),
          ),
        ),
      ),
    { functional: true },
  );
}

/** The same effect with the error caught outside the inner pipe. */
function labM28CreateOuterCatchEffect() {
  return createEffect(
    (actions$ = inject(Actions)) =>
      actions$.pipe(
        ofType(labM28Load),
        switchMap(({ n }) => labM28Api(n).pipe(map((value) => labM28Loaded({ n: value })))),
        catchError(() => of(labM28Failed({ n: 0 }))),
      ),
    { functional: true },
  );
}

/** Dispatches load for 1, 2 and 3 into a store running the given loading effect, and returns the observed action types. */
function labM28RunLoads(loadEffect: ReturnType<typeof labM28CreateInnerCatchEffect>): string[] {
  const log: string[] = [];
  TestBed.configureTestingModule({
    providers: [provideStore(), provideEffects({ loadEffect, logEffect: labM28CreateLogEffect(log) })],
  });
  const store = TestBed.inject(Store);
  store.dispatch(labM28Load({ n: 1 }));
  store.dispatch(labM28Load({ n: 2 }));
  store.dispatch(labM28Load({ n: 3 }));
  return log;
}

/** Runs the callback with RxJS's unhandled-error hook recording into an array, then restores the hook. */
async function recordUnhandledErrors(run: () => void): Promise<unknown[]> {
  const errors: unknown[] = [];
  const previous = config.onUnhandledError;
  config.onUnhandledError = (error) => errors.push(error);
  try {
    run();
    // RxJS reports an unhandled error from a timeout, so the hook fires after the synchronous code.
    await new Promise<void>((resolve) => setTimeout(resolve));
  } finally {
    config.onUnhandledError = previous;
  }
  return errors;
}

/** Feeds `load` for 1 then 2 through the given flattening operator; request 1 takes 20 ms, request 2 takes 10 ms. */
function labM28Flatten(
  flatten: (project: (n: number) => Observable<number>) => (source$: Observable<number>) => Observable<number>,
): number[] {
  const source$ = new Subject<number>();
  const answers: number[] = [];
  source$.pipe(flatten((n) => of(n).pipe(delay(n === 1 ? 20 : 10)))).subscribe((value) => answers.push(value));
  source$.next(1);
  source$.next(2);
  vi.advanceTimersByTime(100);
  return answers;
}

describe('Section 6: Effects', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('Section 6: a class effect with createEffect runs under provideEffects', () => {
    TestBed.configureTestingModule({
      providers: [
        provideStore({ n: createReducer(0, on(labM28LegacyLoaded, (_state, { n }) => n)) }),
        provideEffects(LabM28Effects),
      ],
    });
    const store = TestBed.inject(Store);
    const n = store.selectSignal(createFeatureSelector<number>('n'));
    expect(n()).toBe(0);

    store.dispatch(labM28LegacyLoad({ n: 5 }));

    expect(n()).toBe(5);
  });

  it('Section 6: an effect that throws is resubscribed and the error reaches ErrorHandler', () => {
    const log: string[] = [];
    const throwOnSecond = createEffect(
      (actions$ = inject(Actions)) =>
        actions$.pipe(
          ofType(labM28Load),
          tap(({ n }) => {
            log.push(`fx ${n}`);
            if (n === 2) throw new Error('boom');
          }),
        ),
      { functional: true, dispatch: false },
    );
    TestBed.configureTestingModule({
      providers: [
        provideStore(),
        provideEffects({ throwOnSecond }),
        { provide: ErrorHandler, useValue: labM28RecordingHandler(log) },
      ],
    });
    const store = TestBed.inject(Store);

    store.dispatch(labM28Load({ n: 1 }));
    store.dispatch(labM28Load({ n: 2 }));
    store.dispatch(labM28Load({ n: 3 }));

    expect(log).toEqual(['fx 1', 'fx 2', 'handled boom', 'fx 3']);
  });

  it('Section 6: catchError inside switchMap keeps the effect alive', () => {
    const log = labM28RunLoads(labM28CreateInnerCatchEffect());

    expect(log).toEqual(['Load', 'Loaded', 'Load', 'Failed', 'Load', 'Loaded']);
  });

  it('Section 6: catchError outside switchMap completes the effect after the first failure', () => {
    const log = labM28RunLoads(labM28CreateOuterCatchEffect());

    expect(log).toEqual(['Load', 'Loaded', 'Load', 'Failed', 'Load']);
  });

  it('Section 6: mapResponse maps both outcomes to actions', () => {
    const mapper = mapResponse({
      next: (value: number) => labM28Loaded({ n: value }),
      error: (_error: unknown) => labM28Failed({ n: 0 }),
    });
    const results: string[] = [];

    of(4).pipe(mapper).subscribe((action) => results.push(action.type));
    throwError(() => new Error('x')).pipe(mapper).subscribe((action) => results.push(action.type));

    expect(results).toEqual(['Loaded', 'Failed']);
  });

  it('Section 6: tapResponse takes an object of callbacks', () => {
    const calls: string[] = [];
    const values: number[] = [];
    let completed = false;
    const tapper = tapResponse({
      next: (value: number) => calls.push(`next ${value}`),
      error: (_error: unknown) => calls.push('error'),
    });

    of(1).pipe(tapper).subscribe((value) => values.push(value));
    throwError(() => new Error('x'))
      .pipe(tapper)
      .subscribe({ next: (value) => values.push(value), complete: () => (completed = true) });

    expect(calls).toEqual(['next 1', 'error']);
    expect(values).toEqual([1]);
    expect(completed).toBe(true);
    // @ts-expect-error the removed signature of two callbacks fails to compile (TS2554: expected 1 argument)
    expect(typeof tapResponse((value: number) => value, () => 0)).toBe('function');
  });

  it('Section 6: the flattening operator decides which response wins', () => {
    vi.useFakeTimers();

    expect(labM28Flatten((project) => switchMap(project))).toEqual([2]);
    expect(labM28Flatten((project) => mergeMap(project))).toEqual([2, 1]);
    expect(labM28Flatten((project) => concatMap(project))).toEqual([1, 2]);
  });

  it('Section 6: the handler reports ten errors and then stops catching', async () => {
    const handled: string[] = [];
    const runs: number[] = [];
    const alwaysThrow = createEffect(
      (actions$ = inject(Actions)) =>
        actions$.pipe(
          ofType(labM28Load),
          tap(({ n }) => {
            runs.push(n);
            throw new Error('boom');
          }),
        ),
      { functional: true, dispatch: false },
    );
    TestBed.configureTestingModule({
      providers: [
        provideStore(),
        provideEffects({ alwaysThrow }),
        { provide: ErrorHandler, useValue: labM28RecordingHandler(handled) },
      ],
    });
    const store = TestBed.inject(Store);

    const unhandled = await recordUnhandledErrors(() => {
      for (let n = 1; n <= 14; n++) store.dispatch(labM28Load({ n }));
    });

    expect(runs).toHaveLength(11);
    expect(handled).toHaveLength(10);
    expect(unhandled.length).toBeGreaterThan(0);
    expect(unhandled.every((error) => error instanceof Error && error.message === 'boom')).toBe(true);
  });
});
