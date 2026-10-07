import { fetchJson, HttpError, TimeoutError } from './resilient-fetch';
import { startServer, type Handler, type TestServer } from './support/http-server.js';

const servers: TestServer[] = [];
afterEach(async () => {
  await Promise.all(servers.splice(0).map((started) => started.close()));
});
const start = async (handler: Handler) => {
  const started = await startServer(handler);
  servers.push(started);
  return started;
};

const failureOf = (promise: Promise<unknown>) =>
  promise.then(
    () => undefined,
    (error: unknown) => error,
  );
/** Starts a server that records each request's method and answers from `replies` in turn (the last one repeats). */
const serve = async (...replies: number[]) => {
  const seen: string[] = [];
  const handler: Handler = (request, response) => {
    seen.push(request.method ?? '');
    const status = replies[Math.min(seen.length - 1, replies.length - 1)] ?? 200;
    response.writeHead(status, { 'Content-Type': 'application/json' }).end(JSON.stringify({ status }));
  };
  const started = await start(handler);
  return { url: started.baseUrl, seen };
};
const hang: Handler = () => new Promise(() => undefined);
const recordingSleep = () => {
  const waits: number[] = [];
  return { waits, sleep: (ms: number) => (waits.push(ms), Promise.resolve()) };
};

describe('E09.2 resilient fetch wrapper', () => {
  it('a non-2xx status rejects with an HttpError that carries the status (plain fetch resolves)', async () => {
    const { url } = await serve(404);
    expect((await fetch(url)).status).toBe(404);
    const error = await failureOf(fetchJson(url));
    expect(error).toBeInstanceOf(HttpError);
    expect((error as HttpError).status).toBe(404);
    const { url: okUrl } = await serve(200);
    expect(await fetchJson(okUrl)).toEqual({ status: 200 });
  });

  it('a request slower than timeoutMs is aborted and rejects with a TimeoutError', async () => {
    let hits = 0;
    const hanging = await start((request, response) => (hits++, hang(request, response)));
    const error = await failureOf(fetchJson(hanging.baseUrl, { timeoutMs: 30, retries: 2, sleep: () => Promise.resolve() }));
    expect(error).toBeInstanceOf(TimeoutError);
    expect((error as TimeoutError).timeoutMs).toBe(30);
    expect(hits).toBe(1); // a timeout is final: retries: 2 is not used

    // The timeout is per attempt: a 503 answers at once, then the retry hangs and has its own 30 ms.
    let attempts = 0;
    const slowSecond = await start((request, response) =>
      ++attempts === 1 ? response.writeHead(503).end() : hang(request, response),
    );
    const second = await failureOf(fetchJson(slowSecond.baseUrl, { timeoutMs: 30, retries: 1, sleep: () => Promise.resolve() }));
    expect(second).toBeInstanceOf(TimeoutError);
    expect(attempts).toBe(2);
  });

  it("aborting the caller's signal rejects with its reason and sends no retry", async () => {
    let hits = 0;
    const counting = await start(() => (hits++, new Promise(() => undefined)));
    const controller = new AbortController();
    const reason = new Error('user left the page');
    const { sleep, waits } = recordingSleep();
    setTimeout(() => controller.abort(reason), 30);
    const error = await failureOf(fetchJson(counting.baseUrl, { retries: 3, signal: controller.signal, sleep }));
    expect(error).toBe(reason);
    expect([hits, waits]).toEqual([1, []]);
  });

  it('only idempotent methods are retried, and only on network errors and 502/503/504; a POST is never retried', async () => {
    const flaky = await serve(503, 503, 200);
    expect(await fetchJson(flaky.url, { retries: 2, sleep: () => Promise.resolve() })).toEqual({ status: 200 });
    expect(flaky.seen).toEqual(['GET', 'GET', 'GET']);

    const put = await serve(503, 200);
    await fetchJson(put.url, { method: 'PUT', body: { a: 1 }, retries: 1, sleep: () => Promise.resolve() });
    expect(put.seen).toEqual(['PUT', 'PUT']);

    const post = await serve(503, 200);
    expect(await failureOf(fetchJson(post.url, { method: 'POST', body: {}, retries: 3, sleep: () => Promise.resolve() }))).toMatchObject({ status: 503 });
    expect(post.seen).toEqual(['POST']);

    const notFound = await serve(404, 200);
    await failureOf(fetchJson(notFound.url, { retries: 3, sleep: () => Promise.resolve() }));
    expect(notFound.seen).toEqual(['GET']);

    const closed = await startServer(hang);
    const url = closed.baseUrl;
    await closed.close(); // the port now refuses connections: a network error
    const refused = recordingSleep();
    expect(await failureOf(fetchJson(url, { retries: 2, sleep: refused.sleep, jitter: () => 1 }))).toBeInstanceOf(TypeError);
    expect(refused.waits).toHaveLength(2);
  });

  it('waits between attempts come from the injected sleep, grow exponentially from the injected jitter, and stop once the signal is aborted', async () => {
    const { url } = await serve(503);
    const recorded = recordingSleep();
    await failureOf(fetchJson(url, { retries: 3, baseDelayMs: 100, jitter: () => 1, sleep: recorded.sleep }));
    expect(recorded.waits).toEqual([100, 200, 400]);
    const halved = recordingSleep();
    await failureOf(fetchJson(url, { retries: 2, baseDelayMs: 100, jitter: () => 0.5, sleep: halved.sleep }));
    expect(halved.waits).toEqual([50, 100]);

    const seen = await serve(503);
    const controller = new AbortController();
    const abortingSleep = () => (controller.abort(new Error('stop')), Promise.resolve());
    const error = await failureOf(fetchJson(seen.url, { retries: 5, signal: controller.signal, sleep: abortingSleep }));
    expect((error as Error).message).toBe('stop');
    expect(seen.seen).toHaveLength(1);

    const real = new AbortController();
    const started = Date.now();
    setTimeout(() => real.abort(new Error('enough')), 40);
    const waiting = await failureOf(fetchJson(seen.url, { retries: 2, baseDelayMs: 10_000, jitter: () => 1, signal: real.signal }));
    expect((waiting as Error).message).toBe('enough');
    expect(Date.now() - started).toBeLessThan(5_000);
  });
});
