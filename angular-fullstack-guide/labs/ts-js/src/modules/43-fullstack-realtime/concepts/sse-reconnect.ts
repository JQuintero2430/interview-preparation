// Section 2 model: what an `EventSource` does after each outcome of its connection, from WHATWG HTML §9.2.2 (the
// constructor's processResponse and processResponseEndOfBody steps) and §9.2.3 (announce, reestablish and fail the
// connection); the page read 2026-10-21, "Last Updated 20 October 2026". Our model, not the browser's code. It is a
// pure function of the outcome and the stored state, so it is testable without a socket, a clock or a network.

/** What happened to the request: its response headers arrived, it failed, it was aborted, or its body ended. */
export type ConnectionOutcome =
  | { readonly kind: 'response'; readonly status: number; readonly contentType: string | null }
  | { readonly kind: 'network-error' }
  | { readonly kind: 'aborted' }
  | { readonly kind: 'body-ended' };

/** What the source keeps between connections: the last event ID string and the reconnection time. */
export interface SourceState {
  readonly lastEventId: string;
  /** Milliseconds; the spec's initial value is implementation-defined, "probably in the region of a few seconds". */
  readonly reconnectionTime: number;
}

export type ReadyState = 'CONNECTING' | 'OPEN' | 'CLOSED';

/** Why the connection failed for good. `stop-requested` is the 204 the spec's introduction names as the stop signal. */
export type FailReason = 'aborted' | 'stop-requested' | 'status' | 'content-type';

export type NextStep =
  | { readonly action: 'open'; readonly readyState: 'OPEN' }
  | {
      readonly action: 'reconnect';
      readonly readyState: 'CONNECTING';
      /** The wait before the next request; a user agent may wait longer (backoff), which this model leaves out. */
      readonly afterMs: number;
      /** `Last-Event-ID` only when the last event ID string is not empty. */
      readonly headers: Readonly<Record<string, string>>;
    }
  | { readonly action: 'fail'; readonly readyState: 'CLOSED'; readonly reason: FailReason };

const EVENT_STREAM = 'text/event-stream';
const NO_CONTENT = 204;
const OK = 200;

/** Decides the next step after one outcome: open the stream, reconnect after a wait, or fail without reconnecting. */
export function nextStep(outcome: ConnectionOutcome, state: SourceState): NextStep {
  switch (outcome.kind) {
    case 'aborted':
      return fail('aborted');
    case 'network-error':
    case 'body-ended':
      return reconnect(state);
    case 'response':
      return onResponse(outcome.status, outcome.contentType);
  }
}

function onResponse(status: number, contentType: string | null): NextStep {
  // A 204 takes the same step as a 500: "fail the connection". Only the reason we record differs.
  if (status === NO_CONTENT) return fail('stop-requested');
  if (status !== OK) return fail('status');
  if (mimeEssence(contentType) !== EVENT_STREAM) return fail('content-type');
  return { action: 'open', readyState: 'OPEN' };
}

function reconnect(state: SourceState): NextStep {
  const headers: Record<string, string> = state.lastEventId === '' ? {} : { 'Last-Event-ID': state.lastEventId };
  return { action: 'reconnect', readyState: 'CONNECTING', afterMs: state.reconnectionTime, headers };
}

function fail(reason: FailReason): NextStep {
  return { action: 'fail', readyState: 'CLOSED', reason };
}

// The spec compares the `Content-Type` with `text/event-stream`. Our model ignores parameters such as
// `; charset=utf-8` and letter case, which the spec text does not spell out; no test relies on that choice.
function mimeEssence(contentType: string | null): string {
  return (contentType ?? '').split(';')[0]?.trim().toLowerCase() ?? '';
}
