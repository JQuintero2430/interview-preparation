import { DestroyRef, Injectable, InjectionToken, inject } from '@angular/core';
import { PrimeRequest, PrimeResponse, primesUpTo } from './primes';

/** What the client needs from a worker; a fake one stands in for it in unit tests. */
export interface PrimesWorker {
  post(request: PrimeRequest): void;
  listen(onResponse: (response: PrimeResponse) => void, onError: () => void): void;
  terminate(): void;
}

/** Creates one worker. */
export type PrimesWorkerFactory = () => PrimesWorker;

const WORKER_FAILED = 'The worker stopped before it answered.';

/** Wraps a real `Worker`, so the client never depends on the DOM `Worker` type. */
function createBrowserWorker(): PrimesWorker {
  // The literal `new Worker(new URL(...), ...)` form is the only shape the builder bundles.
  const worker = new Worker(new URL('./primes.worker', import.meta.url), { type: 'module' });
  return {
    post: (request) => worker.postMessage(request),
    listen: (onResponse, onError) => {
      worker.addEventListener('message', (event: MessageEvent<PrimeResponse>) => onResponse(event.data));
      worker.addEventListener('error', () => onError());
    },
    terminate: () => worker.terminate(),
  };
}

/**
 * Where workers come from: the browser's `Worker`, or `null` where it is undefined (jsdom,
 * server rendering), which makes the client compute on the main thread. Tests override it.
 */
export const LAB_M31_PRIMES_WORKER_FACTORY = new InjectionToken<PrimesWorkerFactory | null>(
  'LAB_M31_PRIMES_WORKER_FACTORY',
  { providedIn: 'root', factory: () => (typeof Worker === 'undefined' ? null : createBrowserWorker) },
);

interface PendingRequest {
  resolve: (primes: number[] | null) => void;
  reject: (reason: Error) => void;
}

/**
 * Finds primes off the main thread when a worker exists and on it otherwise. Only the newest
 * request's answer is delivered; the variants differ in how they own their workers.
 */
@Injectable()
export abstract class LabM31PrimesClient {
  private readonly createWorker = inject(LAB_M31_PRIMES_WORKER_FACTORY);
  private latestId = 0;

  /** False where no worker can be created: the same function then runs on the main thread. */
  readonly usesWorker = this.createWorker !== null;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.shutdown());
  }

  /**
   * Lists the primes up to `limit`.
   * @param limit - Upper bound of the range.
   * @returns The primes, or `null` when a newer request was made before this one finished.
   */
  primes(limit: number): Promise<number[] | null> {
    const id = ++this.latestId;
    if (!this.createWorker) return Promise.resolve(this.deliver(id, primesUpTo(limit)));
    return this.send({ id, limit }, this.createWorker);
  }

  protected abstract send(request: PrimeRequest, createWorker: PrimesWorkerFactory): Promise<number[] | null>;

  protected abstract shutdown(): void;

  // A result is stale when a newer request exists; its sender gets null and shows nothing.
  protected deliver(id: number, primes: number[]): number[] | null {
    return id === this.latestId ? primes : null;
  }
}

/** Solution: one long-lived worker created on the first request; answers are matched by id. */
@Injectable()
export class LabM31LongLivedPrimesClient extends LabM31PrimesClient {
  private worker: PrimesWorker | undefined;
  private readonly pending = new Map<number, PendingRequest>();

  protected send(request: PrimeRequest, createWorker: PrimesWorkerFactory): Promise<number[] | null> {
    return new Promise((resolve, reject) => {
      this.pending.set(request.id, { resolve, reject });
      this.ensureWorker(createWorker).post(request);
    });
  }

  // Created on the first request, so a page that never asks never downloads the worker file.
  private ensureWorker(createWorker: PrimesWorkerFactory): PrimesWorker {
    if (this.worker) return this.worker;
    const worker = createWorker();
    worker.listen((response) => this.settle(response), () => this.fail());
    this.worker = worker;
    return worker;
  }

  private settle(response: PrimeResponse): void {
    const request = this.pending.get(response.id);
    this.pending.delete(response.id);
    request?.resolve(this.deliver(response.id, response.primes));
  }

  private fail(): void {
    const requests = this.drain();
    for (const request of requests) request.reject(new Error(WORKER_FAILED));
  }

  protected shutdown(): void {
    const requests = this.drain();
    for (const request of requests) request.resolve(null);
  }

  private drain(): PendingRequest[] {
    const requests = [...this.pending.values()];
    this.pending.clear();
    this.worker?.terminate();
    this.worker = undefined;
    return requests;
  }
}

interface RunningRequest {
  worker: PrimesWorker;
  resolve: (primes: number[] | null) => void;
}

/** Alternative: one worker per request, terminated as soon as a newer request supersedes it. */
@Injectable()
export class LabM31PerRequestPrimesClient extends LabM31PrimesClient {
  private current: RunningRequest | undefined;

  protected send(request: PrimeRequest, createWorker: PrimesWorkerFactory): Promise<number[] | null> {
    this.supersede();
    return new Promise((resolve, reject) => {
      const worker = createWorker();
      this.current = { worker, resolve };
      worker.listen(
        (response) => {
          this.finish(worker);
          resolve(this.deliver(response.id, response.primes));
        },
        () => {
          this.finish(worker);
          reject(new Error(WORKER_FAILED));
        },
      );
      worker.post(request);
    });
  }

  protected shutdown(): void {
    this.supersede();
  }

  // Stopping the old worker frees its thread at once; the long-lived variant lets it finish first.
  private supersede(): void {
    const running = this.current;
    if (!running) return;
    this.current = undefined;
    running.worker.terminate();
    running.resolve(null);
  }

  private finish(worker: PrimesWorker): void {
    if (this.current?.worker === worker) this.current = undefined;
    worker.terminate();
  }
}
