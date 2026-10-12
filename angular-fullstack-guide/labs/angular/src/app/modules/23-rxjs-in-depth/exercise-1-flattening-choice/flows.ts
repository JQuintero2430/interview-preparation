import {
  Observable,
  concatAll,
  exhaustAll,
  map,
  mergeAll,
  mergeMap,
  concatMap,
  exhaustMap,
  switchAll,
  switchMap,
} from 'rxjs';

/** An outer stream of inputs and a request function become one stream of results. */
export type Flow = <In, Out>(
  outer: Observable<In>,
  request: (input: In) => Observable<Out>,
) => Observable<Out>;

/** The most thumbnail requests that may run at once. */
export const THUMBNAIL_CONCURRENCY = 2;

/** A query: only the answer to the latest term matters. */
export const searchFlow: Flow = (outer, request) => outer.pipe(switchMap(request));

/** Writes whose order matters: one at a time, in arrival order. */
export const saveFlow: Flow = (outer, request) => outer.pipe(concatMap(request));

/** A command that must not run twice at once: inputs that arrive while it runs are dropped. */
export const submitFlow: Flow = (outer, request) => outer.pipe(exhaustMap(request));

/** Independent jobs, with a limit. */
export const thumbnailFlow: Flow = (outer, request) => outer.pipe(mergeMap(request, THUMBNAIL_CONCURRENCY));

/** The same four flows written as `map` followed by the matching `All` operator. */
export const allFormFlows: Record<'search' | 'save' | 'submit' | 'thumbnail', Flow> = {
  search: (outer, request) => outer.pipe(map(request), switchAll()),
  save: (outer, request) => outer.pipe(map(request), concatAll()),
  submit: (outer, request) => outer.pipe(map(request), exhaustAll()),
  thumbnail: (outer, request) => outer.pipe(map(request), mergeAll(THUMBNAIL_CONCURRENCY)),
};
