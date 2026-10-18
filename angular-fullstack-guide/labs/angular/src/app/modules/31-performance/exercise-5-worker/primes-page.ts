import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  LabM31LongLivedPrimesClient,
  LabM31PerRequestPrimesClient,
  LabM31PrimesClient,
} from './primes-client';

/** The two clients the page can use. */
type ClientVariant = 'long-lived' | 'per-request';

const CLIENTS: Readonly<Record<ClientVariant, () => LabM31PrimesClient>> = {
  'long-lived': () => new LabM31LongLivedPrimesClient(),
  'per-request': () => new LabM31PerRequestPrimesClient(),
};

/** Reads `?variant=`; anything else uses the long-lived client. */
function variantOf(route: ActivatedRoute): ClientVariant {
  const value = route.snapshot.queryParamMap.get('variant');
  return value === 'per-request' ? value : 'long-lived';
}

const FRAMES_HOOK = '__m31Frames';
const PRIME_LIMIT = 5_000_000;
const FAILURE_MESSAGE = 'The count failed. Try again.';

/**
 * Primes lab page: the button lists primes through the client chosen by `?variant=`. A frame
 * counter (lab instrumentation on `window.__m31Frames`) shows whether the page kept drawing.
 */
@Component({
  selector: 'lab-m31-primes-page',
  providers: [{ provide: LabM31PrimesClient, useFactory: () => CLIENTS[variantOf(inject(ActivatedRoute))]() }],
  template: `
    <h1>Primes lab</h1>
    <p>Variant: {{ variant }}</p>
    <p>Lists the primes up to {{ limit }}, in a worker when the browser has one.</p>
    <button type="button" (click)="start()">List primes</button>
    @if (running()) {
      <p>Counting…</p>
    }
    @if (primes(); as found) {
      <p>Result: <output>{{ found.length }} primes, largest {{ largest() }}</output></p>
    }
    <div role="alert" aria-live="assertive">
      @if (error(); as message) {
        <p>{{ message }}</p>
      }
    </div>
  `,
})
export class LabM31PrimesPage {
  private readonly client = inject(LabM31PrimesClient);
  protected readonly variant = variantOf(inject(ActivatedRoute));
  protected readonly limit = PRIME_LIMIT;
  protected readonly primes = signal<number[] | null>(null);
  protected readonly largest = computed(() => this.primes()?.at(-1) ?? 0);
  protected readonly running = signal(false);
  protected readonly error = signal('');

  constructor() {
    this.trackFrames(inject(DestroyRef));
  }

  /** Starts a request; an answer that a later click has superseded is ignored by the client. */
  protected async start(): Promise<void> {
    this.running.set(true);
    this.error.set('');
    try {
      const found = await this.client.primes(PRIME_LIMIT);
      if (found === null) return;
      this.primes.set(found);
      this.running.set(false);
    } catch {
      this.error.set(FAILURE_MESSAGE);
      this.running.set(false);
    }
  }

  private trackFrames(destroyRef: DestroyRef): void {
    if (typeof requestAnimationFrame !== 'function') return;
    let frames = 0;
    let handle = 0;
    const tick = (): void => {
      Reflect.set(window, FRAMES_HOOK, ++frames);
      handle = requestAnimationFrame(tick);
    };
    handle = requestAnimationFrame(tick);
    destroyRef.onDestroy(() => {
      cancelAnimationFrame(handle);
      Reflect.deleteProperty(window, FRAMES_HOOK);
    });
  }
}
