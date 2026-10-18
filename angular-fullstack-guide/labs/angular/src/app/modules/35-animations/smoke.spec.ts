import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

@Component({
  selector: 'lab-m35-smoke',
  template: `@if (shown()) {
    <p animate.leave="m35-fade-out">Leaving</p>
  }`,
})
class LabM35Smoke {
  readonly shown = signal(true);
}

// jsdom has no `document.documentElement.getAnimations`, so the animate.* instructions return early
// and the element is removed in the same change detection pass (prediction F4; the run decides the title).
describe('Module 35 lab smoke', () => {
  it('Smoke: animate.leave removes the element synchronously under jsdom', () => {
    const fixture = TestBed.createComponent(LabM35Smoke);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('p')).not.toBeNull();

    fixture.componentInstance.shown.set(false);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('p')).toBeNull();
  });
});
