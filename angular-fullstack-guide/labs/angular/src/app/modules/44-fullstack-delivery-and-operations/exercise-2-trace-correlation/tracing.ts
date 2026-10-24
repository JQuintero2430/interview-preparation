// Exercise 44.2: the half both variants share: tokens, our `traceparent` format, the Tracer and the ErrorReporter.
// Our code, not OpenTelemetry's or a tracker SDK's. Angular cannot import labs/ts-js, so section 10's format (W3C Trace
// Context Level 1 §3.2.2, version 00) is re-implemented here, and the spec checks it against the W3C pattern and example.
// The propagation rule follows `@opentelemetry/web-common` 0.300.0 (same origin always, other origins only when listed)
// with one difference: a string entry here is an origin, while OpenTelemetry's `urlMatches` needs it to equal the whole URL.
import { HttpErrorResponse } from '@angular/common/http';
import { DOCUMENT, Injectable, InjectionToken, type OnDestroy, inject, signal } from '@angular/core';

export interface TraceConfig {
  /** Other origins that may receive `traceparent`: a string is compared with the URL's origin, a RegExp is tested on the URL. */
  readonly propagateTo: readonly (string | RegExp)[];
  /** The release identifier every report carries (the `release` value of `config.json`, section 5). */
  readonly release: string;
  /** The share of interactions whose trace is recorded, from 0 to 1. */
  readonly sampleRate: number;
}

export const TRACE_CONFIG = new InjectionToken<TraceConfig>('TRACE_CONFIG');

/** A random source in [0, 1), injected so a test decides the sample and the IDs. */
export const RANDOM = new InjectionToken<() => number>('RANDOM', { providedIn: 'root', factory: () => Math.random });

/** `navigator.sendBeacon` as a function: true when the browser queued the data for transfer. */
export type BeaconFn = (url: string, body: string) => boolean;

export const BEACON = new InjectionToken<BeaconFn>('BEACON', {
  providedIn: 'root',
  factory: () => (url, body) => navigator.sendBeacon(url, body),
});

export const REPORT_URL = new InjectionToken<string>('REPORT_URL', { providedIn: 'root', factory: () => '/errors' });

/** One user action, such as a click on Pay; every request it makes belongs to one trace. */
export interface Interaction {
  readonly name: string;
  readonly traceId: string;
  readonly sampled: boolean;
}

export interface ErrorReport {
  readonly message: string;
  readonly status: number;
  readonly traceId: string;
  readonly release: string;
  readonly route: string;
}

/** What the tracer gives one request: its trace, and the header to send or null for an origin that is not listed. */
export interface RequestTrace {
  readonly traceId: string;
  readonly traceparent: string | null;
}

const ALL_ZEROES = /^0+$/;

function randomHex(random: () => number, bytes: number): string {
  let hex = '';
  for (let index = 0; index < bytes; index++) {
    hex += Math.floor(random() * 256)
      .toString(16)
      .padStart(2, '0');
  }
  return hex;
}

/** Draws until the ID is not all zeroes, because §3.2.2.2 forbids all-zero trace and parent IDs. */
function nonZeroId(random: () => number, bytes: number): string {
  let id = randomHex(random, bytes);
  while (ALL_ZEROES.test(id)) id = randomHex(random, bytes);
  return id;
}

/** Version 00, as section 10 states it: `00-<32 hex trace-id>-<16 hex parent-id>-<2 hex flags>`, flag 01 = sampled. */
export function formatTraceparent(traceId: string, parentId: string, sampled: boolean): string {
  return `00-${traceId}-${parentId}-${sampled ? '01' : '00'}`;
}

/** True for a 5xx or a network error (status 0); a 4xx is an answer the caller handles, not a failure to report. */
export function isFailure(error: unknown): error is HttpErrorResponse {
  return error instanceof HttpErrorResponse && (error.status === 0 || error.status >= 500);
}

@Injectable({ providedIn: 'root' })
export class Tracer {
  private readonly config = inject(TRACE_CONFIG);
  private readonly random = inject(RANDOM);
  private readonly origin = inject(DOCUMENT).location.origin;
  private readonly active = signal<Interaction | null>(null);

  readonly current = this.active.asReadonly();

  /** Starts a trace for one user action. The sampling decision is drawn here, once, so every span agrees. */
  startInteraction(name: string): Interaction {
    const interaction = this.create(name);
    this.active.set(interaction);
    return interaction;
  }

  endInteraction(): void {
    this.active.set(null);
  }

  /** A new span ID per request; outside an interaction, each request is a trace of its own. */
  traceRequest(url: string): RequestTrace {
    const interaction = this.current() ?? this.create('request');
    const header = formatTraceparent(interaction.traceId, nonZeroId(this.random, 8), interaction.sampled);
    return { traceId: interaction.traceId, traceparent: this.shouldPropagate(url) ? header : null };
  }

  private create(name: string): Interaction {
    const sampled = this.random() < this.config.sampleRate;
    return { name, traceId: nonZeroId(this.random, 16), sampled };
  }

  /** Same origin always; another origin only when listed, because a cross-origin `traceparent` forces a preflight. */
  private shouldPropagate(url: string): boolean {
    const target = new URL(url, this.origin);
    if (target.origin === this.origin) return true;
    return this.config.propagateTo.some((entry) =>
      typeof entry === 'string' ? entry === target.origin : entry.test(target.href),
    );
  }
}

/** Queues failure reports and sends them in one beacon when the page becomes hidden (section 9's transport). */
@Injectable({ providedIn: 'root' })
export class ErrorReporter implements OnDestroy {
  private readonly beacon = inject(BEACON);
  private readonly url = inject(REPORT_URL);
  private readonly document = inject(DOCUMENT);
  private readonly release = inject(TRACE_CONFIG).release;

  private route = '/';
  private queue: ErrorReport[] = [];
  private readonly onVisibilityChange = (): void => {
    if (this.document.visibilityState === 'hidden') this.flush();
  };

  constructor() {
    this.document.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  setRoute(route: string): void {
    this.route = route;
  }

  /** Queues one report for a 5xx or a network error; any other error is ignored here and still reaches the caller. */
  report(error: unknown, traceId: string): void {
    if (!isFailure(error)) return;
    this.queue.push({ message: error.message, status: error.status, traceId, release: this.release, route: this.route });
  }

  /** Sends the queue in one beacon; if the browser refuses it, the reports stay for the next flush. */
  flush(): boolean {
    if (this.queue.length === 0) return false;
    const accepted = this.beacon(this.url, JSON.stringify(this.queue));
    if (accepted) this.queue = [];
    return accepted;
  }

  ngOnDestroy(): void {
    this.document.removeEventListener('visibilitychange', this.onVisibilityChange);
  }
}
