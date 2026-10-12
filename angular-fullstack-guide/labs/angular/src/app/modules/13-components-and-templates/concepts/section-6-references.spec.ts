import { TemplateRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Kid, LetCalls, LetDemo, Plain, ReferenceDemo, Tally } from './reference-demo';

function mount<T>(type: new () => T) {
  const fixture = TestBed.createComponent(type);
  fixture.detectChanges();
  return fixture;
}

function el(root: HTMLElement, selector: string): HTMLElement {
  const found = root.querySelector<HTMLElement>(selector);
  if (!found) {
    throw new Error(`no element for ${selector}`);
  }
  return found;
}

function text(root: HTMLElement, selector: string): string {
  return (el(root, selector).textContent ?? '').trim();
}

describe('Section 6: template reference variables and @let', () => {
  it('Section 6: a reference on an element is the DOM element, on a component its instance, on ng-template a TemplateRef', () => {
    const fixture = mount(ReferenceDemo);
    const root: HTMLElement = fixture.nativeElement;
    el(root, '#inspect').click();
    const [box, kid, tpl] = fixture.componentInstance.seen;

    expect(box).toBe(el(root, 'input'));
    expect(kid).toBeInstanceOf(Kid);
    expect(tpl).toBeInstanceOf(TemplateRef);
  });

  it('Section 6: exportAs names a directive instance', () => {
    const fixture = mount(ReferenceDemo);
    const root: HTMLElement = fixture.nativeElement;
    el(root, '#inspect').click();
    const [, , , tally, plain] = fixture.componentInstance.seen;

    expect(tally).toBeInstanceOf(Tally);
    expect(plain).toBeInstanceOf(HTMLSpanElement);
    expect(plain).not.toBeInstanceOf(Plain);
  });

  it('Section 6: a reference is visible in nested blocks', () => {
    const fixture = mount(ReferenceDemo);
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('#nested')).toBeNull();

    const box = el(root, 'input');
    if (!(box instanceof HTMLInputElement)) {
      throw new Error('input expected');
    }
    box.value = 'typed';
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();
    expect(text(root, '#nested')).toBe('typed');
  });

  it('Section 6: @let re-evaluates when its signals change and is visible in nested blocks', () => {
    const fixture = mount(LetDemo);
    const root: HTMLElement = fixture.nativeElement;
    expect(text(root, '#top')).toBe('2-n=2');
    expect(root.querySelector('#nested')).toBeNull();

    fixture.componentInstance.show.set(true);
    fixture.detectChanges();
    expect(text(root, '#nested')).toBe('12');

    fixture.componentInstance.n.set(5);
    fixture.detectChanges();
    expect(text(root, '#top')).toBe('10-n=10');
    expect(text(root, '#nested')).toBe('20');
  });

  it('Section 6: @let evaluates its expression once per check however often it is read', () => {
    const fixture = TestBed.createComponent(LetCalls);
    fixture.detectChanges(false);
    const root: HTMLElement = fixture.nativeElement;

    expect(text(root, '#let')).toBe('111');
    expect(text(root, '#calls')).toBe('234');
    expect(fixture.componentInstance.calls).toBe(4);
  });
});
