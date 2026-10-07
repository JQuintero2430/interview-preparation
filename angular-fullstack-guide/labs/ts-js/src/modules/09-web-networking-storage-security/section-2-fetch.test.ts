// Section 2 (Node 24 `fetch`, undici, against a local server): the response head versus the one-shot body, streaming, `duplex`, abort during a body read and `Request` defaults.
import { readBody, startServer, type TestServer } from './support/http-server.js';

let server: TestServer | undefined;
afterEach(async () => {
  await server?.close();
  server = undefined;
});

const failureOf = (promise: Promise<unknown>) =>
  promise.then(
    () => undefined,
    (error: unknown) => error,
  );

describe('Module 09 · section 2', () => {
  it('Section 2: a body can be read once; the second read throws and bodyUsed is true; clone() before reading gives two reads', async () => {
    server = await startServer((_request, response) => response.end('hello'));
    const response = await fetch(server.baseUrl);
    const copy = response.clone();
    expect(await response.text()).toBe('hello');
    expect(response.bodyUsed).toBe(true);
    const second = await failureOf(response.text());
    expect(second).toBeInstanceOf(TypeError);
    expect((second as TypeError).message).toContain('Body is unusable');
    expect(await copy.text()).toBe('hello');
  });

  it('Section 2: a streamed body arrives as Uint8Array chunks that can be counted for download progress', async () => {
    server = await startServer(async (_request, response) => {
      response.writeHead(200, { 'Content-Length': 6 });
      response.write('one');
      await new Promise((resolve) => setTimeout(resolve, 20));
      response.end('two');
    });
    const response = await fetch(server.baseUrl);
    const total = Number(response.headers.get('content-length'));
    const reader = response.body!.getReader();
    const chunks: Uint8Array[] = [];
    let received = 0;
    for (let step = await reader.read(); !step.done; step = await reader.read()) {
      chunks.push(step.value);
      received += step.value.byteLength;
    }
    expect(chunks.every((chunk) => chunk instanceof Uint8Array)).toBe(true);
    expect([received, total]).toEqual([6, 6]);
    expect(new TextDecoder().decode(await new Blob(chunks as BlobPart[]).arrayBuffer())).toBe('onetwo');
  });

  it('Section 2: a ReadableStream request body needs duplex "half"', async () => {
    server = await startServer(async (request, response) => response.end(await readBody(request)));
    const stream = () =>
      new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('streamed'));
          controller.close();
        },
      });
    const withoutDuplex = await failureOf(fetch(server.baseUrl, { method: 'POST', body: stream() }));
    expect(withoutDuplex).toBeInstanceOf(TypeError);
    expect((withoutDuplex as TypeError).message).toContain('duplex');
    const response = await fetch(server.baseUrl, { method: 'POST', body: stream(), duplex: 'half' } as RequestInit);
    expect(await response.text()).toBe('streamed');
  });

  it('Section 2: fetch resolves with the head while the body is still arriving, and aborting then rejects the body read with signal.reason', async () => {
    server = await startServer((_request, response) => {
      response.writeHead(200);
      response.write('part');
    });
    const controller = new AbortController();
    const response = await fetch(server.baseUrl, { signal: controller.signal });
    expect(response.status).toBe(200);
    const reading = failureOf(response.text());
    const reason = new Error('user left');
    controller.abort(reason);
    expect(await reading).toBe(reason);
  });

  it('Section 2: abort() without a reason rejects the body read with an AbortError', async () => {
    server = await startServer((_request, response) => {
      response.writeHead(200);
      response.write('part');
    });
    const controller = new AbortController();
    const response = await fetch(server.baseUrl, { signal: controller.signal });
    const reading = failureOf(response.text());
    controller.abort();
    expect(((await reading) as DOMException).name).toBe('AbortError');
  });

  it('Section 2: Request defaults are credentials "same-origin", mode "cors" and cache "default"', () => {
    const request = new Request('http://127.0.0.1:1/');
    expect([request.credentials, request.mode, request.cache]).toEqual(['same-origin', 'cors', 'default']);
  });
});
