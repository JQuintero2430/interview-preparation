// Exercise 22.4: four UI streams thinned by the timing operator that fits each. Every function takes an
// Observable and returns one; the clock is the library's (asyncScheduler), so tests drive it with fake timers.
import { Observable, auditTime, debounceTime, distinctUntilChanged, filter, map, sampleTime, throttleTime } from 'rxjs';

export const SEARCH_SILENCE_MS = 300;
export const SCROLL_WINDOW_MS = 100;
export const AUTOSAVE_WINDOW_MS = 1000;
export const STATUS_PERIOD_MS = 250;
export const CLICK_GUARD_MS = 500;

/** The trimmed term once typing pauses; empty terms and repeats of the previous term are dropped. */
export function searchTerms(input$: Observable<string>): Observable<string> {
  return input$.pipe(
    map((term) => term.trim()),
    debounceTime(SEARCH_SILENCE_MS),
    filter((term) => term.length > 0),
    distinctUntilChanged(),
  );
}

/** The first position of a burst at once and its last position when the window ends. */
export function scrollPosition(position$: Observable<number>): Observable<number> {
  return position$.pipe(throttleTime(SCROLL_WINDOW_MS, undefined, { leading: true, trailing: true }));
}

/**
 * At most one save per window, always with the latest draft. auditTime, not debounceTime: a steady typist never
 * pauses, so debounce would never save; and audit emits a pending draft when its window ends after complete.
 */
export function autosave<T>(draft$: Observable<T>): Observable<T> {
  return draft$.pipe(auditTime(AUTOSAVE_WINDOW_MS));
}

/** The latest value on a fixed clock; a tick with no new value emits nothing. */
export function statusPanel<T>(status$: Observable<T>): Observable<T> {
  return status$.pipe(sampleTime(STATUS_PERIOD_MS));
}

/** The first click passes; clicks inside the guard window are ignored (throttleTime's default, leading only). */
export function doubleClickGuard<T>(click$: Observable<T>): Observable<T> {
  return click$.pipe(throttleTime(CLICK_GUARD_MS));
}
