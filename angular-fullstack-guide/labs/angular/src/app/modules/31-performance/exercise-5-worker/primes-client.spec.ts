import type { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PrimeRequest, PrimeResponse, primesUpTo } from './primes';
import {
  LAB_M31_PRIMES_WORKER_FACTORY,
  LabM31LongLivedPrimesClient,
  LabM31PerRequestPrimesClient,
  LabM31PrimesClient,
  PrimesWorker,
} from './primes-client';

/** A worker the test drives by hand: it records what the client does and answers on demand. */
class FakeWorker implements PrimesWorker {
  readonly posted: PrimeRequest[] = [];
  terminated = false;
  private onResponse: (response: PrimeResponse) => void = () => undefined;

  constructor(private readonly autoReply: boolean) {}

  post(request: PrimeRequest): void {
    this.posted.push(request);
    if (this.autoReply) this.reply({ id: request.id, primes: primesUpTo(request.limit) });
  }

  listen(onResponse: (response: PrimeResponse) => void): void {
    this.onResponse = onResponse;
  }

  terminate(): void {
    this.terminated = true;
  }

  reply(response: PrimeResponse): void {
    this.onResponse(response);
  }
}

type WorkerMode = 'auto-reply' | 'manual' | 'none';

const variants: [string, Type<LabM31PrimesClient>][] = [
  ['long-lived worker', LabM31LongLivedPrimesClient],
  ['worker per request', LabM31PerRequestPrimesClient],
];

/** Builds a client whose workers are fakes (or absent, in `none` mode) and returns the fakes it created. */
function setUp(client: Type<LabM31PrimesClient>, mode: WorkerMode): { client: LabM31PrimesClient; workers: FakeWorker[] } {
  const workers: FakeWorker[] = [];
  const factory =
    mode === 'none'
      ? null
      : () => {
          const worker = new FakeWorker(mode === 'auto-reply');
          workers.push(worker);
          return worker;
        };
  TestBed.configureTestingModule({
    providers: [client, { provide: LAB_M31_PRIMES_WORKER_FACTORY, useValue: factory }],
  });
  return { client: TestBed.inject(client), workers };
}

function workerAt(workers: FakeWorker[], index: number): FakeWorker {
  const worker = workers.at(index);
  if (!worker) throw new Error(`No worker at ${index}`);
  return worker;
}

describe.each(variants)('E31.5 primes client (%s)', (_label, clientClass) => {
  it('returns the same primes as the main-thread function', async () => {
    const { client, workers } = setUp(clientClass, 'auto-reply');

    const primes = await client.primes(1000);

    expect(client.usesWorker).toBe(true);
    expect(workers).toHaveLength(1);
    expect(primes).toEqual(primesUpTo(1000));
    expect(primes).toHaveLength(168);
  });

  it('ignores the result of a superseded request', async () => {
    const { client, workers } = setUp(clientClass, 'manual');

    const first = client.primes(10);
    const second = client.primes(20);
    workerAt(workers, 0).reply({ id: 1, primes: primesUpTo(10) });
    workerAt(workers, -1).reply({ id: 2, primes: primesUpTo(20) });

    expect(await first).toBeNull();
    expect(await second).toEqual(primesUpTo(20));
  });

  it('computes on the main thread when Worker is unavailable', async () => {
    expect(typeof Worker).toBe('undefined');
    const { client, workers } = setUp(clientClass, 'none');

    expect(client.usesWorker).toBe(false);
    expect(await client.primes(100)).toEqual(primesUpTo(100));
    expect(workers).toHaveLength(0);
  });

  it('terminates its worker when destroyed', async () => {
    const { client, workers } = setUp(clientClass, 'manual');
    const pending = client.primes(10);
    expect(workerAt(workers, -1).terminated).toBe(false);

    TestBed.resetTestingModule();

    expect(workerAt(workers, -1).terminated).toBe(true);
    expect(await pending).toBeNull();
  });
});
