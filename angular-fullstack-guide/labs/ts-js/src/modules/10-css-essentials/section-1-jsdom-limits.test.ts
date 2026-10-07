// @vitest-environment jsdom
// Module 10 runs CSS in jsdom, which implements the cascade (see section-2-cascade.test.ts) and no layout. The `Section 1:`
// pins below record what jsdom 30.1.1 does NOT do, so no later section can claim an observation it cannot make and a jsdom
// upgrade that changes one of them is noticed.
import { afterEach } from 'vitest';
import { computed, mountStyles, unmount } from './support/dom';

afterEach(unmount);

describe('Module 10 · section 1', () => {
  it('Section 1: jsdom does no layout (offsetWidth and getBoundingClientRect are 0)', () => {
    const root = mountStyles('#box { width: 100px; height: 40px; }', '<div id="box"></div>');
    const box = root.querySelector('#box') as HTMLElement;
    expect([computed(box, 'width'), box.offsetWidth, box.getBoundingClientRect().width]).toEqual(['100px', 0, 0]);
  });

  it('Section 1: box-sizing is read as declared, content-box by default', () => {
    const root = mountStyles('.b { box-sizing: border-box; }', '<p id="a"></p><p id="b" class="b"></p>');
    const [a, b] = [root.querySelector('#a'), root.querySelector('#b')] as Element[];
    expect([computed(a as Element, 'box-sizing'), computed(b as Element, 'box-sizing')]).toEqual(['content-box', 'border-box']);
  });

  it('Section 1: box-sizing is not inherited', () => {
    const root = mountStyles('.parent { box-sizing: border-box; }', '<div class="parent"><p id="child"></p></div>');
    expect(computed(root.querySelector('#child') as Element, 'box-sizing')).toBe('content-box');
  });

  it('Section 1: jsdom ignores rules inside @layer', () => {
    const root = mountStyles('@layer base { p { color: red; } }', '<p id="p"></p>');
    const sheet = document.styleSheets[0];
    expect([sheet?.cssRules[0]?.constructor.name, computed(root.querySelector('#p') as Element, 'color')]).toEqual([
      'CSSLayerBlockRule',
      'rgb(0, 0, 0)',
    ]);
  });

  it('Section 1: jsdom applies neither rule of two layers, so layer order is not computed', () => {
    const root = mountStyles('@layer b, a; @layer a { p { color: red; } } @layer b { p { color: blue; } }', '<p id="p"></p>');
    expect(computed(root.querySelector('#p') as Element, 'color')).toBe('rgb(0, 0, 0)');
  });

  it('Section 1: jsdom applies no @media rule and has no matchMedia', () => {
    const root = mountStyles('p { color: black; } @media (min-width: 500px) { p { color: red; } }', '<p id="p"></p>');
    expect([window.innerWidth, computed(root.querySelector('#p') as Element, 'color'), typeof window.matchMedia]).toEqual([
      1024,
      'rgb(0, 0, 0)',
      'undefined',
    ]);
  });

  it('Section 1: jsdom parses @container and applies no container rule', () => {
    const root = mountStyles(
      '.wrap { container-type: inline-size; } p { color: black; } @container (min-width: 0px) { p { color: red; } }',
      '<div class="wrap"><p id="p"></p></div>',
    );
    const rule = document.styleSheets[0]?.cssRules[2];
    expect([rule?.constructor.name, computed(root.querySelector('#p') as Element, 'color')]).toEqual(['CSSContainerRule', 'rgb(0, 0, 0)']);
  });

  it('Section 1: jsdom applies no rule written with native nesting', () => {
    const root = mountStyles('.a { color: black; & .b { color: red; } }', '<div class="a"><p class="b" id="p"></p></div>');
    expect(computed(root.querySelector('#p') as Element, 'color')).toBe('rgb(0, 0, 0)');
  });

  it('Section 1: jsdom does not resolve var() in computed values', () => {
    const root = mountStyles(':root { --c: red; } p { color: var(--c); }', '<p id="p"></p>');
    expect(computed(root.querySelector('#p') as Element, 'color')).toBe('var(--c)');
  });

  it('Section 1: jsdom does not map logical properties to physical ones', () => {
    const root = mountStyles('p { margin-inline-start: 4px; }', '<p id="p"></p>');
    expect(computed(root.querySelector('#p') as Element, 'margin-left')).toBe('0');
  });

  it('Section 1: jsdom applies no @scope and no @property rule', () => {
    const root = mountStyles(
      '@scope (.a) { p { color: red; } } @property --x { syntax: "<length>"; inherits: false; initial-value: 7px; } p { width: var(--x); }',
      '<div class="a"><p id="p"></p></div>',
    );
    const p = root.querySelector('#p') as Element;
    expect([computed(p, 'color'), computed(p, 'width')]).toEqual(['rgb(0, 0, 0)', 'var(--x)']);
  });
});
