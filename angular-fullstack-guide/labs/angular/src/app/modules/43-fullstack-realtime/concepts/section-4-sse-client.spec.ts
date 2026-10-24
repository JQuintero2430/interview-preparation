import { TestBed } from '@angular/core/testing';
import { FakeEventSource } from './testing/fake-event-source';
import {
  LAB_M43_SSE_FACTORY,
  LabM43LiveValue,
  fromEventSource,
  fromFetchStream,
  type EventSourceFactory,
  type FetchFn,
  type SseMessage,
} from './sse-client';

// Every source is our fake: no EventSource exists in jsdom and no test opens a connection. The fetch is injected and
// answers with a Response over a ReadableStream the test fills chunk by chunk.
const fakeFactory: EventSourceFactory = (url, init) => new FakeEventSource(url, init);

function latestSource(): FakeEventSource {
  const source = FakeEventSource.instances.at(-1);
  if (source === undefined) throw new Error('no EventSource was created');
  return source;
}

describe('Section 4: the Angular SSE client', () => {
  beforeEach(() => {
    FakeEventSource.instances.length = 0;
  });

  it('Section 4: unsubscribing closes the EventSource', () => {
    const subscription = fromEventSource('/api/prices', { factory: fakeFactory }).subscribe();
    const source = latestSource();
    expect(source.closeCalls).toBe(0);

    subscription.unsubscribe();
    expect(source.closeCalls).toBe(1);
    expect(source.readyState).toBe(2);
  });

  it('Section 4: a named event reaches the subscriber only when it is listed', () => {
    const seen: SseMessage[] = [];
    fromEventSource('/api/prices', { events: ['price'], withCredentials: true, factory: fakeFactory }).subscribe((m) =>
      seen.push(m),
    );
    const source = latestSource();
    expect(source.init).toEqual({ withCredentials: true });

    source.emit('price', '101.5', '7');
    source.emit('tick', 'ignored');
    source.emit('message', 'plain');
    expect(seen).toEqual([
      { type: 'price', data: '101.5', lastEventId: '7' },
      { type: 'message', data: 'plain', lastEventId: '' },
    ]);
  });

  it('Section 4: an error while reconnecting emits nothing and a closed source errors the Observable', () => {
    const events: string[] = [];
    fromEventSource('/api/prices', { factory: fakeFactory }).subscribe({
      next: (m) => events.push(`next ${m.data}`),
      error: (e: unknown) => events.push(`error ${e instanceof Error ? e.message : 'unknown'}`),
    });
    const source = latestSource();

    source.open();
    source.errorWhileReconnecting();
    source.open();
    source.emit('message', 'again');
    expect(events).toEqual(['next again']);

    source.fail();
    expect(events).toEqual(['next again', 'error EventSource to /api/prices failed']);
  });

  it('Section 4: the fetch stream sends the Authorization header and aborts on unsubscribe', async () => {
    const encoder = new TextEncoder();
    let controller!: ReadableStreamDefaultController<Uint8Array>;
    let init: Parameters<FetchFn>[1] | undefined;
    const fetchFn: FetchFn = (_url, requestInit) => {
      init = requestInit;
      const body = new ReadableStream<Uint8Array>({
        start: (c) => {
          controller = c;
          requestInit.signal.addEventListener('abort', () => c.error(requestInit.signal.reason));
        },
      });
      return Promise.resolve(new Response(body, { headers: { 'Content-Type': 'text/event-stream' } }));
    };
    const seen: SseMessage[] = [];
    let failure: unknown;
    const subscription = fromFetchStream(fetchFn, '/api/prices', { Authorization: 'Bearer t0k3n' }).subscribe({
      next: (m) => seen.push(m),
      error: (e: unknown) => (failure = e),
    });
    await vi.waitFor(() => expect(init).toBeDefined());
    expect(init?.headers).toEqual({ Authorization: 'Bearer t0k3n' });

    // The first event ends mid-line in the second chunk, so only one event is complete after two chunks.
    controller.enqueue(encoder.encode('id: 1\nevent: price\ndata: 10'));
    controller.enqueue(encoder.encode('1\n\ndata: half'));
    await vi.waitFor(() => expect(seen).toHaveLength(1));
    expect(seen[0]).toEqual({ type: 'price', data: '101', lastEventId: '1' });

    expect(init?.signal.aborted).toBe(false);
    subscription.unsubscribe();
    expect(init?.signal.aborted).toBe(true);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(failure).toBeUndefined();
    expect(seen).toHaveLength(1);
  });

  it("Section 4: a value from the stream updates a zoneless component's signal", async () => {
    TestBed.configureTestingModule({ providers: [{ provide: LAB_M43_SSE_FACTORY, useValue: fakeFactory }] });
    const fixture = TestBed.createComponent(LabM43LiveValue);
    // Nothing is opened before the first render.
    expect(FakeEventSource.instances).toHaveLength(0);

    await fixture.whenStable();
    const source = latestSource();
    expect(fixture.nativeElement.textContent).toBe('waiting');

    source.open();
    source.emit('price', '101.5');
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toBe('101.5');

    fixture.destroy();
    expect(source.closeCalls).toBe(1);
  });
});
