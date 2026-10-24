// Section 1 model: what each way of getting news from a server costs in requests and in waiting. Our model, not the
// browser's or Spring's. It mirrors RFC 6202 sections 2.1 and 2.2 (long polling, and its latency of up to three network
// transits) and RFC 6455 section 1.3 (a WebSocket starts as one HTTP request). Times are seconds. Nothing here reads
// a clock or opens a connection: the caller passes every time.

export type Transport = 'polling' | 'long-polling' | 'sse' | 'websocket';

export interface Scenario {
  /** Length of the observed window. */
  readonly durationSeconds: number;
  /** When each event happens on the server, sorted ascending. */
  readonly eventTimes: readonly number[];
  /** One-way network time between client and server. Must be above 0. */
  readonly transitSeconds: number;
  /** Time between two polls of plain polling. Must be above 0. */
  readonly pollIntervalSeconds: number;
  /** How long the server holds a long poll before it answers empty. Must be above 0. */
  readonly longPollTimeoutSeconds: number;
}

export interface Cost {
  /** Requests the server answered inside the window (one connection request for a stream). */
  readonly requests: number;
  /** Answers that carried no event. */
  readonly emptyAnswers: number;
  /** For each event the server sent inside the window, seconds from the event to its arrival at the client. */
  readonly latencies: readonly number[];
}

/** Counts the requests, the empty answers and the waiting of one transport over one scenario. */
export function costOf(transport: Transport, scenario: Scenario): Cost {
  assertPositive(scenario);
  switch (transport) {
    case 'polling':
      return polling(scenario);
    case 'long-polling':
      return longPolling(scenario);
    case 'sse':
    case 'websocket':
      return stream(scenario);
  }
}

function assertPositive(scenario: Scenario): void {
  const { transitSeconds, pollIntervalSeconds, longPollTimeoutSeconds } = scenario;
  if (transitSeconds <= 0 || pollIntervalSeconds <= 0 || longPollTimeoutSeconds <= 0) {
    throw new RangeError('transit, poll interval and long-poll timeout must be above 0');
  }
}

/** A poll goes out every interval; the first poll that reaches the server after an event carries it back. */
function polling(scenario: Scenario): Cost {
  const { durationSeconds, eventTimes, transitSeconds, pollIntervalSeconds } = scenario;
  const requests = Math.floor(durationSeconds / pollIntervalSeconds);
  const latencies: number[] = [];
  const pollsWithNews = new Set<number>();
  for (const at of eventTimes) {
    const poll = Math.max(0, Math.ceil((at - transitSeconds) / pollIntervalSeconds));
    if (poll >= requests) continue;
    pollsWithNews.add(poll);
    latencies.push(poll * pollIntervalSeconds + 2 * transitSeconds - at);
  }
  return { requests, emptyAnswers: requests - pollsWithNews.size, latencies };
}

/**
 * The server holds each request until an event or the timeout. After an answer leaves, the client's next request
 * needs two more transits to arrive, and an event in that gap waits for it (RFC 6202 section 2.2, "Maximal Latency").
 * An answer carries every event that has happened by then, as the RFC allows ("delivered in a batch").
 */
function longPolling(scenario: Scenario): Cost {
  const { durationSeconds, eventTimes, transitSeconds, longPollTimeoutSeconds } = scenario;
  const latencies: number[] = [];
  let requests = 0;
  let emptyAnswers = 0;
  let next = 0;
  let arrivesAt = transitSeconds;
  for (;;) {
    const deadline = arrivesAt + longPollTimeoutSeconds;
    const pending = eventTimes[next];
    const hasNews = pending !== undefined && pending <= deadline;
    const answersAt = hasNews ? Math.max(pending, arrivesAt) : deadline;
    if (answersAt > durationSeconds) break;
    requests += 1;
    if (!hasNews) emptyAnswers += 1;
    for (let at = eventTimes[next]; at !== undefined && at <= answersAt; at = eventTimes[next]) {
      latencies.push(answersAt + transitSeconds - at);
      next += 1;
    }
    arrivesAt = answersAt + 2 * transitSeconds;
  }
  return { requests, emptyAnswers, latencies };
}

/** One request opens the stream (an SSE response, or the WebSocket upgrade); each event then travels one way. */
function stream(scenario: Scenario): Cost {
  const { durationSeconds, eventTimes, transitSeconds } = scenario;
  const inWindow = eventTimes.filter((at) => at <= durationSeconds);
  return { requests: 1, emptyAnswers: 0, latencies: inWindow.map(() => transitSeconds) };
}
