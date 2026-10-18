import { DestroyRef, Injectable, inject } from '@angular/core';
import { PrimeRequest, PrimeResponse, countPrimes } from './prime-count';

interface PendingRequest {
  resolve: (count: number | null) => void;
  reject: (reason: Error) => void;
}

const WORKER_FAILED = 'The worker stopped before it answered.';

/**
 * Counts primes in a Web Worker when the browser has one, and on the main thread otherwise
 * (jsdom, server rendering). Only the newest request's answer is delivered.
 */
@Injectable({ providedIn: 'root' })
export class LabM31PrimeService {
  /** False where `Worker` is undefined: the same function then runs on the main thread. */
  readonly usesWorker = typeof Worker !== 'undefined';

  private worker: Worker | undefined;
  private latestId = 0;
  private readonly pending = new Map<number, PendingRequest>();

  constructor() {
    inject(DestroyRef).onDestroy(() => this.worker?.terminate());
  }

  /**
   * Counts the primes up to `limit`.
   * @param limit - Upper bound of the range.
   * @returns The count, or `null` when a newer request was made before this one finished.
   */
  count(limit: number): Promise<number | null> {
    const id = ++this.latestId;
    if (!this.usesWorker) return Promise.resolve(this.deliver(id, countPrimes(limit)));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      const request: PrimeRequest = { id, limit };
      this.ensureWorker().postMessage(request);
    });
  }

  // Created on the first request, so a page that never counts never downloads the worker file.
  private ensureWorker(): Worker {
    if (this.worker) return this.worker;
    const worker = new Worker(new URL('./sum.worker', import.meta.url), { type: 'module' });
    worker.addEventListener('message', (event: MessageEvent<PrimeResponse>) => this.settle(event.data));
    worker.addEventListener('error', () => this.fail());
    this.worker = worker;
    return worker;
  }

  private settle(response: PrimeResponse): void {
    const request = this.pending.get(response.id);
    this.pending.delete(response.id);
    request?.resolve(this.deliver(response.id, response.count));
  }

  private fail(): void {
    const requests = [...this.pending.values()];
    this.pending.clear();
    this.worker?.terminate();
    this.worker = undefined;
    for (const request of requests) request.reject(new Error(WORKER_FAILED));
  }

  // A result is stale when a newer request exists; its sender gets null and shows nothing.
  private deliver(id: number, count: number): number | null {
    return id === this.latestId ? count : null;
  }
}
