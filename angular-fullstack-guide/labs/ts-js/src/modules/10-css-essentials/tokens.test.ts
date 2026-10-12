// @vitest-environment jsdom
import { afterEach } from 'vitest';
import { clampAt, fluidClamp, resolveVar, type Scope } from './tokens';
import { computed, mountStyles, unmount } from './support/dom';

afterEach(unmount);

describe('E10.3 A token resolver and a fluid scale', () => {
  it('a name is resolved from the nearest scope outward (inheritance) and a redefinition in an inner scope wins', () => {
    const root: Scope = { '--surface': 'white', '--text': '#111' };
    const dark: Scope = { '--surface': 'black' };
    expect(resolveVar('--surface', [{}, root])).toBe('white');
    expect(resolveVar('--surface', [{}, dark, root])).toBe('black');
    expect(resolveVar('--text', [{}, dark, root])).toBe('#111');
    // A var() inside a custom property is resolved where that property is declared, before the value is inherited.
    expect(resolveVar('--card', [{}, dark, { ...root, '--card': 'var(--surface)' }])).toBe('white');
    expect(resolveVar('--card', [{ '--card': 'var(--surface)' }, dark, root])).toBe('black');
  });

  it('an undefined name uses the fallback, and no fallback gives the guaranteed-invalid value (undefined in the model)', () => {
    expect(resolveVar('--missing', [{ '--a': '1' }])).toBeUndefined();
    expect(resolveVar('--missing', [{ '--a': '1' }], 'red')).toBe('red');
    expect(resolveVar('--missing', [{}], 'var(--a, blue)')).toBe('blue');
    expect(resolveVar('--b', [{ '--b': 'var(--none, green)' }])).toBe('green');
    expect(resolveVar('--Gap', [{ '--gap': '4px' }])).toBeUndefined();
  });

  it('a reference cycle is invalid, not an infinite loop', () => {
    const cyclic: Scope = { '--a': 'var(--b)', '--b': 'var(--a)', '--self': 'var(--self)' };
    expect(resolveVar('--a', [cyclic])).toBeUndefined();
    expect(resolveVar('--self', [cyclic])).toBeUndefined();
    expect(resolveVar('--a', [cyclic], 'red')).toBe('red');
    // Not a cycle: the cycle needs properties on the same element (Custom Properties 1 §2.3).
    expect(resolveVar('--foo', [{ '--foo': 'var(--bar)' }, { '--bar': 'var(--foo)' }, { '--foo': '10px' }])).toBe('10px');
  });

  it('fluidClamp returns clamp(<min>rem, <intercept>rem + <slope>vw, <max>rem) that is minPx at and below minViewportPx, maxPx at and above maxViewportPx, and linear between', () => {
    const css = fluidClamp({ minPx: 16, maxPx: 24, minViewportPx: 320, maxViewportPx: 1280 });
    expect(css).toBe('clamp(1rem, 0.8333rem + 0.8333vw, 1.5rem)');
    const at = (viewport: number) => clampAt(css, viewport);
    expect([at(100), at(320)]).toEqual([16, expect.closeTo(16, 2)]);
    expect([at(1280), at(3000)]).toEqual([expect.closeTo(24, 2), 24]);
    expect([at(800), at(560)]).toEqual([expect.closeTo(20, 2), expect.closeTo(18, 2)]);
  });

  it('the declared scopes round-trip through jsdom: getPropertyValue on a nested element returns what resolveVar returns for that scope (declared literal values only)', () => {
    const scopes: readonly Scope[] = [{ '--surface': 'gray' }, { '--surface': 'black', '--text': '#eee' }, { '--surface': 'white' }];
    const style = (scope: Scope) => Object.entries(scope).map(([name, value]) => `${name}: ${value}`).join('; ');
    const [inner, middle, outer] = scopes as [Scope, Scope, Scope];
    const root = mountStyles('', `<div style="${style(outer)}"><div style="${style(middle)}"><p id="t" style="${style(inner)}"></p></div></div>`);
    const element = root.querySelector('#t') as Element;
    for (const name of ['--surface', '--text', '--missing']) {
      expect(computed(element, name)).toBe(resolveVar(name, scopes) ?? '');
    }
  });
});
