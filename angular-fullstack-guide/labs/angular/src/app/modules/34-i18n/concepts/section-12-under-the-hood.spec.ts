/// <reference types="@angular/localize" />
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { clearTranslations } from '@angular/localize';

// Section 12 claims: the compiler puts a component's messages in a `consts` function, the runtime calls it
// once per component type (when it first builds the type's template blueprint), bindings update only the
// expressions of a message, and an ICU creates the nodes of its active case only, swapping them when the
// bound value picks another case. `ɵcmp` is a private definition (12 §8) that may change in any release; it is
// read here through `Reflect.get` because no public API exposes `consts`. Each test owns its host type, because
// a type's messages are built once, and every test removes the translate hook it installed.
function readConsts(type: object): unknown {
  const definition: unknown = Reflect.get(type, 'ɵcmp');
  return typeof definition === 'object' && definition !== null
    ? Reflect.get(definition, 'consts')
    : undefined;
}

/** Installs a pass-through `$localize.translate` that counts how often each message text is built. */
function countTranslations(): Map<string, number> {
  const calls = new Map<string, number>();
  $localize.translate = (parts, substitutions) => {
    const key = parts.join('|');
    calls.set(key, (calls.get(key) ?? 0) + 1);
    return [parts, substitutions];
  };
  return calls;
}

@Component({
  selector: 'lab-m34-consts-host',
  template: `<h2 i18n="@@m34.hood.title">Order summary</h2>`,
})
class LabM34ConstsHost {}

@Component({
  selector: 'lab-m34-once-host',
  template: `<p i18n="@@m34.hood.items">You have {{ count() }} items</p>`,
})
class LabM34OnceHost {
  readonly count = signal(2);
}

@Component({
  selector: 'lab-m34-swap-host',
  template: `<p i18n="@@m34.hood.cart">
    {n(), plural, =0 {<i>Cart empty</i>} other {<b>{{ n() }}</b> in cart}}
  </p>`,
})
class LabM34SwapHost {
  readonly n = signal(0);
}

describe('Section 12: under the hood', () => {
  afterEach(() => clearTranslations());

  it("Section 12: a component's consts is a function that returns its messages", () => {
    const consts = readConsts(LabM34ConstsHost);

    expect(typeof consts).toBe('function');
    expect(typeof consts === 'function' ? consts() : undefined).toEqual(['Order summary']);
  });

  it('Section 12: the message is built once per component type', () => {
    const calls = countTranslations();
    const first = TestBed.createComponent(LabM34OnceHost);
    first.detectChanges();
    const second = TestBed.createComponent(LabM34OnceHost);
    second.detectChanges();
    second.componentInstance.count.set(5);
    second.detectChanges();

    expect([...calls.values()]).toEqual([1]);
    expect(first.nativeElement.textContent).toBe('You have 2 items');
    expect(second.nativeElement.textContent).toBe('You have 5 items');
  });

  it('Section 12: an ICU swaps its nodes when the bound value changes', () => {
    const fixture = TestBed.createComponent(LabM34SwapHost);
    fixture.detectChanges();
    const paragraph: HTMLElement = fixture.nativeElement.querySelector('p');
    const empty = paragraph.querySelector('i');

    expect(paragraph.querySelector('b')).toBeNull();
    expect(empty?.textContent).toBe('Cart empty');

    fixture.componentInstance.n.set(3);
    fixture.detectChanges();

    expect(empty?.isConnected).toBe(false);
    expect(paragraph.querySelector('i')).toBeNull();
    expect(paragraph.textContent?.trim()).toBe('3 in cart');
  });
});
