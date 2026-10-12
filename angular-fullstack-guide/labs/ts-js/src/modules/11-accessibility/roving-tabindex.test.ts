// @vitest-environment jsdom
// Exercise 11.1 tests. jsdom has no sequential focus navigation, so the keys are dispatched here and the assertions read
// tabindex attributes, document.activeElement and defaultPrevented: DOM state of a model, not what a browser or a screen reader does.
import { afterEach, describe, expect, it } from 'vitest';
import { createRovingTabindex, type Orientation } from './roving-tabindex';
import { key, mount, need, unmount } from './support/dom';

afterEach(unmount);

const BAR = '<div id="bar"><button>A</button><button>B</button><button>C</button></div>';
const WITH_DISABLED = '<div id="bar"><button>A</button><button disabled>B</button><button>C</button><button>D</button></div>';

function setup(html: string, orientation: Orientation, extra: { wrap?: boolean; direction?: 'ltr' | 'rtl' } = {}) {
  const root = mount(html);
  const bar = need(root, '#bar');
  const roving = createRovingTabindex(bar, { itemSelector: 'button', orientation, ...extra });
  const items = [...bar.querySelectorAll('button')];
  const stops = (): Array<string | null> => items.map((item) => item.getAttribute('tabindex'));
  const labels = (): string | undefined => document.activeElement?.textContent ?? undefined;
  return { bar, roving, items, stops, labels };
}

describe('E11.1 A roving-tabindex controller', () => {
  it('exactly one enabled item has tabindex="0" (the first), the others -1', () => {
    expect(setup(WITH_DISABLED, 'horizontal').stops()).toEqual(['0', '-1', '-1', '-1']);
  });

  it('the arrows of the orientation move the stop to the next or previous item and focus it (both accepts both pairs)', () => {
    const horizontal = setup(BAR, 'horizontal');
    key(horizontal.items[0]!, 'ArrowRight');
    expect([horizontal.stops(), horizontal.labels()]).toEqual([['-1', '0', '-1'], 'B']);
    expect(key(horizontal.items[1]!, 'ArrowDown').defaultPrevented).toBe(false);
    key(horizontal.items[1]!, 'ArrowLeft');
    expect(horizontal.labels()).toBe('A');
    unmount();

    const vertical = setup(BAR, 'vertical');
    key(vertical.items[0]!, 'ArrowDown');
    key(vertical.items[1]!, 'ArrowDown');
    key(vertical.items[2]!, 'ArrowUp');
    expect([vertical.stops(), vertical.labels()]).toEqual([['-1', '0', '-1'], 'B']);
    expect(key(vertical.items[1]!, 'ArrowRight').defaultPrevented).toBe(false);
    unmount();

    const both = setup(BAR, 'both');
    key(both.items[0]!, 'ArrowRight');
    key(both.items[1]!, 'ArrowDown');
    expect(both.labels()).toBe('C');
    key(both.items[2]!, 'ArrowLeft');
    key(both.items[1]!, 'ArrowUp');
    expect(both.labels()).toBe('A');
  });

  it('Home and End move to the first and last enabled item', () => {
    const { items, labels } = setup(WITH_DISABLED, 'horizontal');
    key(items[0]!, 'End');
    expect(labels()).toBe('D');
    key(items[3]!, 'Home');
    expect(labels()).toBe('A');
  });

  it('at the ends the stop stays, or wraps when wrap is true', () => {
    const fixed = setup(BAR, 'horizontal');
    expect(key(fixed.items[0]!, 'ArrowLeft').defaultPrevented).toBe(true);
    fixed.items[2]!.focus();
    key(fixed.items[2]!, 'ArrowRight');
    expect([fixed.stops(), fixed.labels()]).toEqual([['-1', '-1', '0'], 'C']);
    unmount();

    const wrapping = setup(BAR, 'horizontal', { wrap: true });
    key(wrapping.items[0]!, 'ArrowLeft');
    expect(wrapping.labels()).toBe('C');
    key(wrapping.items[2]!, 'ArrowRight');
    expect(wrapping.labels()).toBe('A');
  });

  it('disabled items are skipped both ways', () => {
    const { items, labels, stops } = setup(WITH_DISABLED, 'horizontal');
    key(items[0]!, 'ArrowRight');
    expect([labels(), stops()]).toEqual(['C', ['-1', '-1', '0', '-1']]);
    key(items[2]!, 'ArrowLeft');
    expect(labels()).toBe('A');
  });

  it('with direction rtl the horizontal arrows are mirrored', () => {
    const { items, labels } = setup(BAR, 'horizontal', { direction: 'rtl' });
    key(items[0]!, 'ArrowLeft');
    expect(labels()).toBe('B');
    key(items[1]!, 'ArrowRight');
    expect(labels()).toBe('A');
  });

  it('focusing an item (focus() or activate) makes it the tab stop', () => {
    const { items, stops, roving } = setup(BAR, 'horizontal');
    items[2]!.focus();
    expect(stops()).toEqual(['-1', '-1', '0']);
    roving.activate(1);
    expect([stops(), document.activeElement]).toEqual([['-1', '0', '-1'], items[1]]);
  });

  it('handled keys call preventDefault; other keys are untouched', () => {
    const { items, stops } = setup(BAR, 'horizontal');
    expect(key(items[0]!, 'ArrowRight').defaultPrevented).toBe(true);
    expect(key(items[1]!, 'Home').defaultPrevented).toBe(true);
    expect(key(items[0]!, 'a').defaultPrevented).toBe(false);
    expect(key(items[0]!, 'Tab').defaultPrevented).toBe(false);
    expect(stops()).toEqual(['0', '-1', '-1']);
  });

  it('after destroy() keys do nothing', () => {
    const { items, stops, roving } = setup(BAR, 'horizontal');
    roving.destroy();
    expect(key(items[0]!, 'ArrowRight').defaultPrevented).toBe(false);
    expect(stops()).toEqual(['0', '-1', '-1']);
  });
});
