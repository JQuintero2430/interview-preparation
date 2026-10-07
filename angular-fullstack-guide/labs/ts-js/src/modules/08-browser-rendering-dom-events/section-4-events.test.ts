// @vitest-environment jsdom
// Section 4 (jsdom 30.1): propagation order, the stop methods, default actions, listener options and delegation.

/** Builds `<section><ul><li><button>` attached to the document and returns the four elements. */
const tree = () => {
  document.body.innerHTML = '<section><ul><li data-id="7"><button>Open</button></li></ul></section>';
  return ['section', 'ul', 'li', 'button'].map((tag) => document.querySelector(tag)!) as [Element, Element, Element, Element];
};

describe('Module 08 · section 4', () => {
  it('Section 4: capture listeners run top-down, then the target, then bubble listeners bottom-up', () => {
    const [section, ul, , button] = tree();
    const log: string[] = [];
    const record = (name: string) => (event: Event) => log.push(`${name}:${event.eventPhase}`);
    section.addEventListener('click', record('section-bubble'));
    section.addEventListener('click', record('section-capture'), { capture: true });
    ul.addEventListener('click', record('ul-capture'), true);
    button.addEventListener('click', record('button'));
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(log).toEqual(['section-capture:1', 'ul-capture:1', 'button:2', 'section-bubble:3']);
  });

  it('Section 4: stopPropagation lets the other listeners on the same element run; stopImmediatePropagation does not', () => {
    const [section, , , button] = tree();
    const run = (stop: 'stopPropagation' | 'stopImmediatePropagation') => {
      const log: string[] = [];
      const first = (event: Event) => (log.push('first'), event[stop]());
      const second = () => log.push('second');
      const parent = () => log.push('parent');
      button.addEventListener('click', first);
      button.addEventListener('click', second);
      section.addEventListener('click', parent);
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      button.removeEventListener('click', first);
      button.removeEventListener('click', second);
      section.removeEventListener('click', parent);
      return log;
    };
    expect(run('stopPropagation')).toEqual(['first', 'second']);
    expect(run('stopImmediatePropagation')).toEqual(['first']);
  });

  it('Section 4: preventDefault cancels only cancelable events and does not stop propagation; dispatchEvent returns !defaultPrevented', () => {
    const [section, , , button] = tree();
    let parentSaw = false;
    section.addEventListener('save', () => (parentSaw = true));
    button.addEventListener('save', (event) => event.preventDefault());
    const cancelable = new Event('save', { bubbles: true, cancelable: true });
    const plain = new Event('save', { bubbles: true });
    expect([button.dispatchEvent(cancelable), cancelable.defaultPrevented, parentSaw]).toEqual([false, true, true]);
    expect([button.dispatchEvent(plain), plain.defaultPrevented]).toEqual([true, false]);
  });

  it('Section 4: preventDefault inside a passive listener is ignored', () => {
    const [, , , button] = tree();
    button.addEventListener('wheel', (event) => event.preventDefault(), { passive: true });
    const wheel = new WheelEvent('wheel', { cancelable: true, bubbles: true });
    button.dispatchEvent(wheel);
    expect(wheel.defaultPrevented).toBe(false);
  });

  it('Section 4: a wheel listener on window is passive by default (DOM Standard, applied by jsdom); passive: false opts out', () => {
    const prevented = (options: AddEventListenerOptions) => {
      window.addEventListener('wheel', (event) => event.preventDefault(), { ...options, once: true });
      const wheel = new WheelEvent('wheel', { cancelable: true });
      window.dispatchEvent(wheel);
      return wheel.defaultPrevented;
    };
    expect([prevented({}), prevented({ passive: false })]).toEqual([false, true]);
    // The rule covers window, document, <html> and <body> only: the same listener on a button is not passive.
    const [, , , button] = tree();
    button.addEventListener('wheel', (event) => event.preventDefault());
    const onButton = new WheelEvent('wheel', { cancelable: true });
    button.dispatchEvent(onButton);
    expect(onButton.defaultPrevented).toBe(true);
  });

  it('Section 4: touchstart, touchmove, wheel and mousewheel are passive by default on window, document, <html> and <body>, and on no other target', () => {
    const prevented = (target: EventTarget, type: string) => {
      target.addEventListener(type, (event) => event.preventDefault(), { once: true });
      const event = new Event(type, { cancelable: true });
      target.dispatchEvent(event);
      return event.defaultPrevented;
    };
    const [, , , button] = tree();
    const passiveTargets = [window, document, document.documentElement, document.body];
    for (const type of ['touchstart', 'touchmove', 'wheel', 'mousewheel']) {
      expect(passiveTargets.map((target) => prevented(target, type))).toEqual([false, false, false, false]);
      expect(prevented(button, type)).toBe(true);
    }
  });

  it('Section 4: once removes the listener after its first call; an aborted signal removes it too', () => {
    const [, , , button] = tree();
    const controller = new AbortController();
    let once = 0;
    let signalled = 0;
    button.addEventListener('click', () => once++, { once: true });
    button.addEventListener('click', () => signalled++, { signal: controller.signal });
    button.dispatchEvent(new MouseEvent('click'));
    controller.abort();
    button.dispatchEvent(new MouseEvent('click'));
    expect([once, signalled]).toEqual([1, 1]);
  });

  it('Section 4: one delegated listener finds the row through target.closest()', () => {
    const [section, , , button] = tree();
    const opened: string[] = [];
    section.addEventListener('click', (event) => {
      const row = (event.target as Element).closest<HTMLElement>('li[data-id]');
      if (row && section.contains(row)) opened.push(row.dataset['id'] ?? '');
    });
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    section.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(opened).toEqual(['7']);
  });

  it('Section 4: focus does not bubble, focusin does', () => {
    const [section, , , button] = tree();
    const log: string[] = [];
    section.addEventListener('focus', () => log.push('focus'));
    section.addEventListener('focusin', () => log.push('focusin'));
    (button as HTMLButtonElement).focus();
    expect(log).toEqual(['focusin']);
  });

  it('Section 4: dispatchEvent is synchronous and a CustomEvent carries detail', () => {
    const [section, , , button] = tree();
    const log: string[] = [];
    section.addEventListener('row-open', (event) => log.push(`listener ${(event as CustomEvent<{ id: number }>).detail.id}`));
    button.dispatchEvent(new CustomEvent('row-open', { bubbles: true, detail: { id: 7 } }));
    log.push('after dispatch');
    expect(log).toEqual(['listener 7', 'after dispatch']);
  });

  it('Section 4: delegation across an open shadow root needs composedPath, because target is retargeted to the host', () => {
    document.body.innerHTML = '<ul></ul>';
    const list = document.querySelector('ul')!;
    const host = document.createElement('div');
    host.attachShadow({ mode: 'open' }).innerHTML = '<button data-action="open">Open</button>';
    list.append(host);
    let seen: Record<string, unknown> = {};
    list.addEventListener('click', (event) => {
      const target = event.target as Element;
      const inner = event.composedPath()[0] as Element;
      seen = { target: target.tagName, viaTarget: target.closest('button[data-action]'), inner: inner.tagName, viaPath: inner.closest('button[data-action]')?.getAttribute('data-action') };
    });
    host.shadowRoot!.querySelector('button')!.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
    expect(seen).toEqual({ target: 'DIV', viaTarget: null, inner: 'BUTTON', viaPath: 'open' });
  });

  it('Section 4: a closed shadow root hides its nodes from composedPath outside it', () => {
    document.body.innerHTML = '<ul></ul>';
    const list = document.querySelector('ul')!;
    const host = document.createElement('div');
    const root = host.attachShadow({ mode: 'closed' });
    root.innerHTML = '<button>Open</button>';
    list.append(host);
    const button = root.querySelector('button')!;
    let path: EventTarget[] = [];
    list.addEventListener('click', (event) => (path = event.composedPath()));
    button.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
    expect([path[0] === host, path.includes(button)]).toEqual([true, false]);
  });
});
