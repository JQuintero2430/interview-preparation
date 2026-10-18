import { Injector, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActiveDescendantKeyManager, FocusKeyManager, type FocusableOption, type FocusOrigin, type Highlightable } from '@angular/cdk/a11y';
import { DOWN_ARROW } from '@angular/cdk/keycodes';

/** The key managers read `keyCode`, so the events carry it; jsdom's `KeyboardEventInit` accepts it. */
function arrowDown(): KeyboardEvent {
  return new KeyboardEvent('keydown', { keyCode: DOWN_ARROW });
}

/** An item for `FocusKeyManager`: it records the origin of every `focus` call it receives. */
class FocusRow implements FocusableOption {
  readonly focusOrigins: FocusOrigin[] = [];

  focus(origin?: FocusOrigin): void {
    this.focusOrigins.push(origin ?? null);
  }
}

/** An item for `ActiveDescendantKeyManager`: it points the list's `aria-activedescendant` at itself, as the manager's contract leaves to the item. */
class ActiveOption implements Highlightable {
  readonly element = document.createElement('li');
  readonly id: string;
  private readonly list: HTMLElement;

  constructor(id: string, list: HTMLElement) {
    this.id = id;
    this.list = list;
    this.element.id = id;
    list.append(this.element);
  }

  setActiveStyles(): void {
    this.element.classList.add('m36-active');
    this.list.setAttribute('aria-activedescendant', this.id);
  }

  setInactiveStyles(): void {
    this.element.classList.remove('m36-active');
  }
}

describe('Section 9: key managers', () => {
  it('Section 9: FocusKeyManager wraps from the last item to the first', () => {
    const [apple, banana, cherry] = [new FocusRow(), new FocusRow(), new FocusRow()];
    const wrapping = new FocusKeyManager([apple, banana, cherry]).withWrap();
    wrapping.setActiveItem(2);
    expect(cherry.focusOrigins).toEqual(['program']);

    // ArrowDown on the last item moves to the first, and the manager focuses it with its default origin.
    wrapping.onKeydown(arrowDown());
    expect(wrapping.activeItemIndex).toBe(0);
    expect(apple.focusOrigins).toEqual(['program']);

    // Without withWrap the same key on the last item changes nothing.
    const plain = new FocusKeyManager([apple, banana, cherry]);
    plain.setActiveItem(2);
    plain.onKeydown(arrowDown());
    expect(plain.activeItemIndex).toBe(2);
  });

  it('Section 9: ActiveDescendantKeyManager marks the active item without moving focus', () => {
    const list = document.createElement('ul');
    list.tabIndex = 0;
    document.body.append(list);
    try {
      const [one, two] = [new ActiveOption('m36-one', list), new ActiveOption('m36-two', list)];
      const manager = new ActiveDescendantKeyManager([one, two]);
      list.focus();
      expect(document.activeElement).toBe(list);

      manager.onKeydown(arrowDown());
      expect(manager.activeItemIndex).toBe(0);
      expect(one.element.classList.contains('m36-active')).toBe(true);
      expect(list.getAttribute('aria-activedescendant')).toBe('m36-one');

      // The second ArrowDown clears the first item's styles and sets the second's; focus never left the list.
      manager.onKeydown(arrowDown());
      expect(manager.activeItemIndex).toBe(1);
      expect(one.element.classList.contains('m36-active')).toBe(false);
      expect(two.element.classList.contains('m36-active')).toBe(true);
      expect(list.getAttribute('aria-activedescendant')).toBe('m36-two');
      expect(document.activeElement).toBe(list);
    } finally {
      list.remove();
    }
  });

  it('Section 9: a key manager built from a signal follows the items it reads', () => {
    const [a, b, c, zero] = [new FocusRow(), new FocusRow(), new FocusRow(), new FocusRow()];
    const items = signal([a, b, c]);
    const manager = new FocusKeyManager(items, TestBed.inject(Injector));
    TestBed.tick();
    manager.setActiveItem(b);
    expect(manager.activeItemIndex).toBe(1);

    // A new item is put first. The index is stale until the manager's effect has run.
    items.set([zero, a, b, c]);
    expect(manager.activeItemIndex).toBe(1);
    TestBed.tick();
    expect(manager.activeItemIndex).toBe(2);
    expect(manager.activeItem).toBe(b);
  });
});
