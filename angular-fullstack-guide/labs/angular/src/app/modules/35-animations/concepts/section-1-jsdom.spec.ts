import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

@Component({
  selector: 'lab-m35-jsdom-enter',
  template: `@if (shown()) {
    <p animate.enter="m35-fade-in">Entering</p>
  }`,
})
class LabM35JsdomEnter {
  readonly shown = signal(false);
}

// The animate.* instructions return at once when document.documentElement.getAnimations is not a function
// (areAnimationSupported in @angular/core 22.2.1), before they read TestBed's animationsEnabled option.
describe('Section 1: jsdom', () => {
  it('Section 1: under jsdom animate.enter adds no class even with animationsEnabled', () => {
    TestBed.configureTestingModule({ animationsEnabled: true });
    expect(typeof document.documentElement.getAnimations).toBe('undefined');

    const fixture = TestBed.createComponent(LabM35JsdomEnter);
    fixture.componentInstance.shown.set(true);
    fixture.detectChanges();

    const paragraph: HTMLElement = fixture.nativeElement.querySelector('p');
    expect(paragraph).not.toBeNull();
    expect(paragraph.classList.contains('m35-fade-in')).toBe(false);
  });
});
