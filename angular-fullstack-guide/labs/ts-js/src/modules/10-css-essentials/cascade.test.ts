// @vitest-environment jsdom
import { afterEach } from 'vitest';
import { resolve, type Declaration } from './cascade';
import { computed, mountStyles, unmount } from './support/dom';

afterEach(unmount);

const color = (value: string, rest: Omit<Declaration, 'property' | 'value'> = {}): Declaration => ({ property: 'color', value, ...rest });
const winner = (declarations: readonly Declaration[], layerOrder: readonly string[] = []) => resolve(declarations, layerOrder).get('color');

describe('E10.2 A cascade resolver with layers', () => {
  it('an !important declaration beats any normal one, whatever the specificity (Cascade 5 §6.1, Origin and Importance)', () => {
    expect(winner([color('red', { selector: '#a.b.c' }), color('blue', { selector: 'p', important: true })])).toBe('blue');
    expect(winner([color('blue', { selector: 'p', important: true }), color('red', { selector: '#a.b.c' })])).toBe('blue');
    expect(winner([color('red'), color('blue', { selector: 'p', important: true })])).toBe('blue');
  });

  it('among normal author declarations an unlayered one beats a layered one, and a later layer beats an earlier one (Cascade 5 §6.1, Layers)', () => {
    expect(winner([color('red', { selector: '#a', layer: 'base' }), color('blue', { selector: 'p' })], ['base'])).toBe('blue');
    const inLayers = [color('red', { selector: 'p', layer: 'a' }), color('blue', { selector: 'p', layer: 'b' })];
    expect(winner(inLayers, ['a', 'b'])).toBe('blue');
    expect(winner([...inLayers].reverse(), ['a', 'b'])).toBe('blue');
    expect(winner(inLayers, ['b', 'a'])).toBe('red');
    expect(winner([color('red', { selector: '#a', layer: 'a' }), color('blue', { selector: 'p', layer: 'b' })], ['a', 'b'])).toBe('blue');
  });

  it('among !important author declarations the layer order is reversed and an unlayered one is the weakest (Cascade 5 §6.1, Layers)', () => {
    const [a, b] = [color('red', { selector: 'p', layer: 'a', important: true }), color('blue', { selector: 'p', layer: 'b', important: true })];
    expect(winner([a, b], ['a', 'b'])).toBe('red');
    expect(winner([a, color('blue', { selector: '#t', important: true })], ['a'])).toBe('red');
    expect(winner([color('blue', { selector: '#t', important: true }), b], ['b'])).toBe('blue');
  });

  it('an element-attached (inline) declaration beats selector declarations of the same importance, layered or not (Cascade 5 §6.1, Element-Attached Styles)', () => {
    expect(winner([color('red', { selector: '#a.b.c' }), color('blue')])).toBe('blue');
    expect(winner([color('red', { selector: 'p', layer: 'a' }), color('blue')], ['a'])).toBe('blue');
    expect(winner([color('red', { selector: 'p', important: true }), color('blue', { important: true })])).toBe('blue');
    expect(winner([color('red', { selector: 'p', layer: 'a', important: true }), color('blue', { important: true })], ['a'])).toBe('blue');
    expect(winner([color('red', { selector: 'p', important: true }), color('blue')])).toBe('red');
  });

  it('on equal importance and layer, higher specificity wins, then the later declaration', () => {
    expect(winner([color('red', { selector: '#t' }), color('blue', { selector: '.c.d' })])).toBe('red');
    expect(winner([color('red', { selector: '.c' }), color('blue', { selector: '.d' })])).toBe('blue');
    expect(winner([color('red', { selector: 'p', layer: 'a' }), color('blue', { selector: 'p', layer: 'a' })], ['a'])).toBe('blue');
  });

  it('the cases without layers agree with jsdom (layered cases are checked against the specification text only)', () => {
    const rgb: Record<string, string> = { red: 'rgb(255, 0, 0)', blue: 'rgb(0, 0, 255)', green: 'rgb(0, 128, 0)' };
    const cases: ReadonlyArray<readonly Declaration[]> = [
      [color('red', { selector: '#t' }), color('blue', { selector: '.c' })],
      [color('blue', { selector: '.c' }), color('green', { selector: 'p' })],
      [color('red', { selector: 'p' }), color('blue', { selector: 'p' })],
      [color('red', { selector: '.c', important: true }), color('blue', { selector: '#t' })],
      [color('green'), color('blue', { selector: '#t' })],
      [color('red', { selector: 'p', important: true }), color('blue')],
      [color('blue', { important: true }), color('red', { selector: 'p', important: true })],
    ];
    for (const declarations of cases) {
      unmount();
      const css = declarations.filter((d) => d.selector).map((d) => `${d.selector} { color: ${d.value}${d.important ? ' !important' : ''}; }`).join(' ');
      const inline = declarations.find((d) => !d.selector);
      const style = inline ? ` style="color: ${inline.value}${inline.important ? ' !important' : ''}"` : '';
      const root = mountStyles(css, `<p id="t" class="c"${style}></p>`);
      expect(computed(root.querySelector('#t') as Element, 'color')).toBe(rgb[winner(declarations)!]);
    }
  });
});
