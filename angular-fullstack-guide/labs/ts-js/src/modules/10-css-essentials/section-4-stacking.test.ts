// @vitest-environment jsdom
// These tests show that the helper reads DECLARED values with getComputedStyle (jsdom computes no layout). That a browser
// paints elements according to the stacking contexts is the MDN and CSS 2.2 Appendix E account, documented, not observed here.
import { afterEach } from 'vitest';
import { findCulprit, stackingContextReasons } from './stacking-context';
import { mountStyles, unmount } from './support/dom';

afterEach(unmount);

function reasonsOf(css: string, html = '<div id="t"></div>', selector = '#t'): string[] {
  unmount();
  const root = mountStyles(css, html);
  return stackingContextReasons(root.querySelector(selector) as Element);
}

describe('Module 10 · section 4', () => {
  it('Section 4: positioned with z-index auto creates no context and with z-index 2 does', () => {
    expect(reasonsOf('#t { position: relative; }')).toEqual([]);
    expect(reasonsOf('#t { position: relative; z-index: 2; }')).toEqual(['position: relative with z-index: 2']);
    expect(reasonsOf('#t { z-index: 2; }')).toEqual([]);
  });

  it('Section 4: fixed and sticky create one without a z-index', () => {
    expect(reasonsOf('#t { position: fixed; }')).toEqual(['position: fixed']);
    expect(reasonsOf('#t { position: sticky; top: 0; }')).toEqual(['position: sticky']);
  });

  it('Section 4: opacity below 1, transform, filter, isolation, will-change, contain and container-type each create one', () => {
    expect(reasonsOf('#t { opacity: 0.9; }')).toEqual(['opacity: 0.9']);
    expect(reasonsOf('#t { opacity: 1; }')).toEqual([]);
    expect(reasonsOf('#t { transform: translateX(1px); }')).toEqual(['transform: translateX(1px)']);
    expect(reasonsOf('#t { filter: blur(2px); }')).toEqual(['filter: blur(2px)']);
    expect(reasonsOf('#t { isolation: isolate; }')).toEqual(['isolation: isolate']);
    expect(reasonsOf('#t { will-change: transform; }')).toEqual(['will-change: transform']);
    expect(reasonsOf('#t { will-change: color; }')).toEqual([]);
    expect(reasonsOf('#t { contain: paint; }')).toEqual(['contain: paint']);
    expect(reasonsOf('#t { container-type: inline-size; }')).toEqual(['container-type: inline-size']);
  });

  it('Section 4: a flex child with z-index creates one without position', () => {
    const html = '<div id="parent"><p id="t"></p></div>';
    expect(reasonsOf('#parent { display: flex; } #t { z-index: 1; }', html)).toEqual(['flex item with z-index: 1']);
    expect(reasonsOf('#parent { display: grid; } #t { z-index: 1; }', html)).toEqual(['grid item with z-index: 1']);
    expect(reasonsOf('#t { z-index: 1; }', html)).toEqual([]);
  });

  it('Section 4: the root element is a stacking context', () => {
    expect(stackingContextReasons(document.documentElement)).toEqual(['root element']);
  });

  it('Section 4: findCulprit walks the ancestors to the nearest context', () => {
    const root = mountStyles(
      '#a { opacity: 0.5; } #b { position: relative; } #c { transform: scale(1.1); }',
      '<div id="a"><div id="b"><div id="c"><span id="t"></span></div></div></div>',
    );
    const found = findCulprit(root.querySelector('#t') as Element);
    expect([found?.element.id, found?.reasons]).toEqual(['c', ['transform: scale(1.1)']]);
    const none = findCulprit(root.querySelector('#a') as Element);
    expect(none?.element).toBe(document.documentElement);
  });
});
