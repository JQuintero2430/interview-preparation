import { Component, DestroyRef, inject, signal } from '@angular/core';
import { LabM31PrimeService } from './prime-service';

const FRAMES_HOOK = '__m31Frames';
const PRIME_LIMIT = 5_000_000;
const FAILURE_MESSAGE = 'The count failed. Try again.';

/**
 * Worker lab page: the button counts primes through `LabM31PrimeService`. A frame counter
 * (lab instrumentation on `window.__m31Frames`) shows whether the page kept drawing meanwhile.
 */
@Component({
  selector: 'lab-m31-worker-page',
  template: `
    <h1>Worker lab</h1>
    <p>Counts the primes up to {{ limit }}, in a worker when the browser has one.</p>
    <button type="button" (click)="start()">Count primes</button>
    @if (running()) {
      <p>Counting…</p>
    }
    @if (result() !== null) {
      <p>Primes found: <output>{{ result() }}</output></p>
    }
    <div role="alert" aria-live="assertive">
      @if (error(); as message) {
        <p>{{ message }}</p>
      }
    </div>
  `,
})
export class LabM31WorkerPage {
  private readonly primes = inject(LabM31PrimeService);
  protected readonly limit = PRIME_LIMIT;
  protected readonly result = signal<number | null>(null);
  protected readonly running = signal(false);
  protected readonly error = signal('');

  constructor() {
    this.trackFrames(inject(DestroyRef));
  }

  /** Starts a count; an answer that a later click has superseded is ignored by the service. */
  protected async start(): Promise<void> {
    this.running.set(true);
    this.error.set('');
    try {
      const count = await this.primes.count(PRIME_LIMIT);
      if (count === null) return;
      this.result.set(count);
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
