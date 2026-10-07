// @vitest-environment jsdom
// Q08.07–Q08.12. Output questions run the question's code in jsdom 30.1 with console.log redirected to `log`.
import { captureLogs } from '../capture';

describe('Module 08 · Output questions: events and shadow roots', () => {
  it('Q08.08 capture listeners run top-down; at the target, capture listeners run before non-capture ones', async () => {
    const lines = await captureLogs((log) => {
      document.body.innerHTML = '<div id="outer"><button id="inner">Go</button></div>';
      const outer = document.querySelector('#outer')!;
      const inner = document.querySelector('#inner')!;
      outer.addEventListener('click', () => log('outer bubble'));
      outer.addEventListener('click', () => log('outer capture'), { capture: true });
      inner.addEventListener('click', () => log('inner bubble'));
      inner.addEventListener('click', () => log('inner capture'), { capture: true });
      document.addEventListener('click', () => log('document capture'), true);
      inner.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(lines).toEqual(['document capture', 'outer capture', 'inner capture', 'inner bubble', 'outer bubble']);
  });

  it('Q08.09 follow-up: without cancelable, preventDefault does nothing and dispatchEvent returns true', () => {
    const link = document.createElement('a');
    link.addEventListener('click', (event) => event.preventDefault());
    const event = new MouseEvent('click', { bubbles: true });
    expect([link.dispatchEvent(event), event.defaultPrevented]).toEqual([true, false]);
  });

  it('Q08.12 follow-up: a composed event without bubbles reaches the host listener and capture listeners above it, not a bubble listener on document', async () => {
    const lines = await captureLogs((log) => {
      const host = document.createElement('div');
      const root = host.attachShadow({ mode: 'open' });
      root.innerHTML = '<button>rate</button>';
      document.body.append(host);
      host.addEventListener('rate', () => log('host'));
      document.addEventListener('rate', () => log('document bubble'));
      document.addEventListener('rate', () => log('document capture'), true);
      root.querySelector('button')!.dispatchEvent(new CustomEvent('rate', { composed: true }));
    });
    expect(lines).toEqual(['document capture', 'host']);
  });

  it('Q08.09 stopPropagation keeps same-element listeners, preventDefault keeps propagation; stopImmediatePropagation stops C', async () => {
    const run = (stop: 'stopPropagation' | 'stopImmediatePropagation') =>
      captureLogs((log) => {
        document.body.innerHTML = '<form><a href="#next">next</a></form>';
        const link = document.querySelector('a')!;
        const form = document.querySelector('form')!;
        link.addEventListener('click', (event) => {
          event.preventDefault();
          log('A');
        });
        link.addEventListener('click', (event) => {
          event[stop]();
          log('B');
        });
        link.addEventListener('click', () => log('C'));
        form.addEventListener('click', () => log('form'));
        const event = new MouseEvent('click', { bubbles: true, cancelable: true });
        log(link.dispatchEvent(event), event.defaultPrevented);
      });
    expect(await run('stopPropagation')).toEqual(['A', 'B', 'C', 'false true']);
    expect(await run('stopImmediatePropagation')).toEqual(['A', 'B', 'false true']);
  });

  it('Q08.12 a non-composed event stops at the shadow root; a composed one reaches document with the host as target', async () => {
    const lines = await captureLogs((log) => {
      const host = document.createElement('div');
      const root = host.attachShadow({ mode: 'open' });
      root.innerHTML = '<button>rate</button>';
      document.body.append(host);
      const button = root.querySelector('button')!;
      root.addEventListener('rate', (event) => log('root sees', (event.target as Element).tagName));
      document.addEventListener('rate', (event) => log('document sees', (event.target as Element).tagName));
      button.dispatchEvent(new CustomEvent('rate', { bubbles: true }));
      button.dispatchEvent(new CustomEvent('rate', { bubbles: true, composed: true }));
    });
    expect(lines).toEqual(['root sees BUTTON', 'root sees BUTTON', 'document sees DIV']);
  });
});
