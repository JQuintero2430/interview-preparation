// Section 9's real-user-monitoring queue. Our queue, not a vendor SDK's code: it mirrors what MDN says about
// `navigator.sendBeacon` and `visibilitychange` (F40) and the `web-vitals` README's queue that flushes when the page is hidden (F39).
import { DOCUMENT, Injectable, InjectionToken, inject, type OnDestroy } from '@angular/core';

/** `navigator.sendBeacon` as a function: true when the browser queued the data for transfer. */
export type BeaconFn = (url: string, body: string) => boolean;

export const BEACON = new InjectionToken<BeaconFn>('BEACON', {
  providedIn: 'root',
  factory: () => (url, body) => navigator.sendBeacon(url, body),
});

/** A random source in [0, 1), injected so a test decides the sample and the page-view id. */
export const RUM_RANDOM = new InjectionToken<() => number>('RUM_RANDOM', {
  providedIn: 'root',
  factory: () => Math.random,
});

export interface RumConfig {
  readonly url: string;
  /** The release identifier the app reports everywhere (the `release` value of `config.json`). */
  readonly release: string;
  /** The share of page views that send anything, from 0 to 1. */
  readonly sampleRate: number;
}

export const RUM_CONFIG = new InjectionToken<RumConfig>('RUM_CONFIG');

export interface RumEvent {
  readonly kind: 'metric' | 'error';
  readonly name: string;
  readonly value: number | string;
}

export interface StampedEvent extends RumEvent {
  readonly route: string;
  readonly release: string;
  readonly pageViewId: string;
}

/**
 * Batches events for one page view. The sampling decision is drawn once, when the page view starts, so a sampled
 * page view sends every event and any other sends none. The batch leaves in one beacon when the page becomes hidden.
 */
@Injectable({ providedIn: 'root' })
export class BeaconQueue implements OnDestroy {
  private readonly beacon = inject(BEACON);
  private readonly document = inject(DOCUMENT);
  private readonly config = inject(RUM_CONFIG);
  private readonly random = inject(RUM_RANDOM);

  readonly pageViewId = `pv-${this.random().toString(36).slice(2, 10)}`;
  readonly sampled = this.random() < this.config.sampleRate;

  private route = '/';
  private events: StampedEvent[] = [];
  private readonly onVisibilityChange = (): void => {
    if (this.document.visibilityState === 'hidden') this.flush();
  };

  constructor() {
    this.document.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  setRoute(route: string): void {
    this.route = route;
  }

  track(event: RumEvent): void {
    if (!this.sampled) return;
    this.events.push({ ...event, route: this.route, release: this.config.release, pageViewId: this.pageViewId });
  }

  /** Sends the batch in one beacon; if the browser refuses it, the events stay for the next flush. */
  flush(): boolean {
    if (this.events.length === 0) return false;
    const accepted = this.beacon(this.config.url, JSON.stringify(this.events));
    if (accepted) this.events = [];
    return accepted;
  }

  ngOnDestroy(): void {
    this.document.removeEventListener('visibilitychange', this.onVisibilityChange);
  }
}
