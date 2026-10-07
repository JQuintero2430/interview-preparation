import { listen } from './listen';

const fire = (target: EventTarget, type = 'ping'): boolean => target.dispatchEvent(new Event(type));

describe('E05.1 listen', () => {
  it('the handler runs for every event until the handle is disposed', () => {
    const target = new EventTarget();
    const handler = vi.fn<EventListener>();
    const handle = listen(target, 'ping', handler);
    fire(target);
    fire(target);
    handle[Symbol.dispose]();
    fire(target);
    expect([handler.mock.calls.length, handle.active]).toEqual([2, false]);
  });

  it('using removes the handler at the end of the block', () => {
    const target = new EventTarget();
    const handler = vi.fn<EventListener>();
    {
      using handle = listen(target, 'ping', handler);
      fire(target);
      expect(handle.active).toBe(true);
    }
    fire(target);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('an aborted signal removes the handler, and a later dispose is a no-op', () => {
    const target = new EventTarget();
    const remove = vi.spyOn(target, 'removeEventListener');
    const controller = new AbortController();
    const handler = vi.fn<EventListener>();
    const handle = listen(target, 'ping', handler, { signal: controller.signal });
    controller.abort();
    fire(target);
    handle[Symbol.dispose]();
    expect([handler.mock.calls.length, handle.active, remove.mock.calls.length]).toEqual([0, false, 1]);
  });

  it('an already-aborted signal never adds the handler', () => {
    const target = new EventTarget();
    const add = vi.spyOn(target, 'addEventListener');
    const handle = listen(target, 'ping', vi.fn<EventListener>(), { signal: AbortSignal.abort() });
    expect([add.mock.calls.length, handle.active]).toEqual([0, false]);
  });

  it('disposal is idempotent', () => {
    const target = new EventTarget();
    const remove = vi.spyOn(target, 'removeEventListener');
    const handle = listen(target, 'ping', vi.fn<EventListener>());
    handle[Symbol.dispose]();
    handle[Symbol.dispose]();
    expect(remove).toHaveBeenCalledTimes(1);
  });

  it('disposal also removes the abort listener from the signal', () => {
    const controller = new AbortController();
    const removeFromSignal = vi.spyOn(controller.signal, 'removeEventListener');
    const handle = listen(new EventTarget(), 'ping', vi.fn<EventListener>(), { signal: controller.signal });
    handle[Symbol.dispose]();
    expect(removeFromSignal).toHaveBeenCalledWith('abort', expect.any(Function));
  });

  it('several handles in a DisposableStack are removed in reverse order', () => {
    const target = new EventTarget();
    const removed: string[] = [];
    vi.spyOn(target, 'removeEventListener').mockImplementation((type) => {
      removed.push(type);
    });
    {
      using stack = new DisposableStack();
      stack.use(listen(target, 'resize', vi.fn<EventListener>()));
      stack.use(listen(target, 'scroll', vi.fn<EventListener>()));
      stack.use(listen(target, 'keydown', vi.fn<EventListener>()));
    }
    expect(removed).toEqual(['keydown', 'scroll', 'resize']);
  });
});
