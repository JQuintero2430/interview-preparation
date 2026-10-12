import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

@Component({
  selector: 'lab-m18-s3-switch',
  template: `
    @switch (value()) {
      @case (1) {
        <p>number one</p>
      }
      @case ('1') {
        <p>string one</p>
      }
      @case (2) {
        <p>first two</p>
      }
      @case (2) {
        <p>second two</p>
      }
    }
  `,
})
class SwitchHost {
  readonly value = signal<unknown>(1);
}

function rendered(value: unknown): string[] {
  const fixture = TestBed.createComponent(SwitchHost);
  fixture.componentInstance.value.set(value);
  fixture.detectChanges();
  const root: HTMLElement = fixture.nativeElement;
  return Array.from(root.querySelectorAll('p')).map((p) => p.textContent ?? '');
}

describe('Section 3: @switch', () => {
  it('Section 3: @switch uses strict equality, the first match wins and nothing falls through', () => {
    expect(rendered(1)).toEqual(['number one']);
    expect(rendered('1')).toEqual(['string one']);
    // Two cases match 2: only the first renders, and the case after it does not.
    expect(rendered(2)).toEqual(['first two']);
  });

  it('Section 3: with no match and no @default nothing renders', () => {
    expect(rendered(99)).toEqual([]);
    expect(rendered(undefined)).toEqual([]);
  });
});
