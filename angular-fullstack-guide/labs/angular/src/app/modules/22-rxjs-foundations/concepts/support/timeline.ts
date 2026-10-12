// The measuring instrument of module 22: runs an Observable in virtual time and records every notification
// with the frame it arrived at. Not a spec (ng build compiles it), so it uses neither `vi` nor `expect`.
// Marble authoring and TestScheduler assertions are taught in module 23.
import { Observable } from 'rxjs';
import { RunHelpers, TestScheduler } from 'rxjs/testing';

/** One notification: `[frame, 'N', value]`, `[frame, 'E', error name or value]` or `[frame, 'C']`. */
export type TimelineEntry = [frame: number, kind: 'N' | 'E' | 'C', value?: unknown];

/**
 * Subscribes at frame 0 to the Observable that `build` returns, inside `TestScheduler.run` (one frame per
 * marble character), and returns the notifications in order. Errors that are `Error` objects are recorded
 * by `name`, because RxJS error constructors print as `…Impl`.
 */
export function timeline(build: (helpers: RunHelpers) => Observable<unknown>): TimelineEntry[] {
  const entries: TimelineEntry[] = [];
  const scheduler = new TestScheduler(() => undefined);
  scheduler.run((helpers) => {
    build(helpers).subscribe({
      next: (value) => entries.push([scheduler.now(), 'N', value]),
      error: (err: unknown) => entries.push([scheduler.now(), 'E', err instanceof Error ? err.name : err]),
      complete: () => entries.push([scheduler.now(), 'C']),
    });
  });
  return entries;
}
