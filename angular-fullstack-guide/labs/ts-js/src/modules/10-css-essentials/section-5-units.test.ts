// @vitest-environment jsdom
// jsdom resolves em and rem against font sizes. It applies no @media or @container rule and has no matchMedia
// (pinned in section-1-jsdom-limits.test.ts), so media and container query behavior is documented, never observed here.
import { afterEach } from 'vitest';
import { computed, mountStyles, unmount } from './support/dom';

afterEach(unmount);

describe('Module 10 · section 5', () => {
  it('Section 5: em compounds through nested elements and rem follows the root (jsdom)', () => {
    const root = mountStyles(
      'html { font-size: 20px; } .outer { font-size: 2em; } .inner { font-size: 2em; } .r { font-size: 2rem; }',
      '<div class="outer"><div class="inner" id="inner"></div><div class="r" id="r"></div></div>',
    );
    const [inner, rem] = [root.querySelector('#inner'), root.querySelector('#r')] as Element[];
    expect([computed(document.documentElement, 'font-size'), computed(inner as Element, 'font-size'), computed(rem as Element, 'font-size')]).toEqual([
      '20px',
      '80px',
      '40px',
    ]);
  });

  it('Section 5: percentage font-size is relative to the parent and rem is not', () => {
    const root = mountStyles('html { font-size: 16px; } .p { font-size: 50%; } .c { font-size: 50%; }', '<div class="p"><div class="c" id="c"></div></div>');
    expect(computed(root.querySelector('#c') as Element, 'font-size')).toBe('4px');
  });

  it('Section 5: the fluid clamp slope and intercept give the minimum and the maximum at the two viewport widths', () => {
    const [minPx, maxPx, minViewport, maxViewport] = [16, 24, 320, 1280];
    const slope = (maxPx - minPx) / (maxViewport - minViewport);
    const intercept = minPx - slope * minViewport;
    const at = (viewport: number) => Math.min(Math.max(intercept + slope * viewport, minPx), maxPx);
    expect([at(320), at(800), at(1280), at(100), at(2000)]).toEqual([16, 20, 24, 16, 24].map((value) => expect.closeTo(value, 9)));
    expect([slope * 100, intercept / 16]).toEqual([expect.closeTo(0.8333333, 6), expect.closeTo(0.8333333, 6)]);
  });
});
