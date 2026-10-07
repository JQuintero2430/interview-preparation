// @vitest-environment jsdom
// Section 5 (jsdom 30.1): custom element lifecycle, shadow root modes, slots and events across the shadow boundary.
// Styling (:host, ::slotted, ::part) and declarative shadow DOM are not computed by jsdom; §5 cites MDN for them.

describe('Module 08 · section 5', () => {
  it('Section 5: lifecycle order: constructor, attributeChangedCallback (observed only), connected, disconnected', () => {
    const log: string[] = [];
    class LifecycleProbe extends HTMLElement {
      static observedAttributes = ['value'];
      constructor() {
        super();
        log.push('constructor');
      }
      attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
        log.push(`${name}: ${oldValue} -> ${newValue}`);
      }
      connectedCallback() {
        log.push('connected');
      }
      disconnectedCallback() {
        log.push('disconnected');
      }
    }
    customElements.define('lifecycle-probe', LifecycleProbe);
    const probe = document.createElement('lifecycle-probe');
    probe.setAttribute('value', '1');
    probe.setAttribute('title', 'not observed');
    document.body.append(probe);
    probe.remove();
    expect(log).toEqual(['constructor', 'value: null -> 1', 'connected', 'disconnected']);
  });

  it('Section 5: a name without a hyphen is rejected; an element in the page before define() is upgraded', () => {
    expect(() => customElements.define('rating', class extends HTMLElement {})).toThrow(DOMException);
    document.body.innerHTML = '<late-widget></late-widget>';
    const early = document.querySelector('late-widget')!;
    class LateWidget extends HTMLElement {}
    expect(early instanceof LateWidget).toBe(false);
    customElements.define('late-widget', LateWidget);
    expect(early instanceof LateWidget).toBe(true);
  });

  it('Section 5: a closed shadow root is not reachable through element.shadowRoot; an open one is', () => {
    const open = document.createElement('div');
    const closed = document.createElement('div');
    const openRoot = open.attachShadow({ mode: 'open' });
    const closedRoot = closed.attachShadow({ mode: 'closed' });
    expect([open.shadowRoot === openRoot, closed.shadowRoot, closedRoot.mode]).toEqual([true, null, 'closed']);
  });

  it('Section 5: light DOM children fill the default slot or the slot named by their slot attribute', async () => {
    const host = document.createElement('div');
    host.innerHTML = '<span slot="label">Rating</span><b>4</b>';
    const root = host.attachShadow({ mode: 'open' });
    root.innerHTML = '<slot name="label"></slot>: <slot></slot>';
    document.body.append(host);
    const [named, fallback] = root.querySelectorAll('slot');
    const changes: string[] = [];
    named!.addEventListener('slotchange', () => changes.push('label changed'));
    expect([named!.assignedElements().map((e) => e.tagName), fallback!.assignedElements().map((e) => e.tagName)]).toEqual([['SPAN'], ['B']]);
    host.append(Object.assign(document.createElement('i'), { slot: 'label' }));
    await Promise.resolve();
    expect(changes).toEqual(['label changed']);
  });

  it('Section 5: a composed event is retargeted to the host outside; a non-composed one stops at the shadow root', () => {
    const host = document.createElement('div');
    const root = host.attachShadow({ mode: 'open' });
    root.innerHTML = '<button>star</button>';
    document.body.append(host);
    const seen: string[] = [];
    document.body.addEventListener('rate', (event) => seen.push(`${event.type} from ${(event.target as Element).tagName}`));
    const button = root.querySelector('button')!;
    button.dispatchEvent(new CustomEvent('rate', { bubbles: true, composed: true }));
    button.dispatchEvent(new CustomEvent('rate', { bubbles: true }));
    expect(seen).toEqual(['rate from DIV']);
  });
});
