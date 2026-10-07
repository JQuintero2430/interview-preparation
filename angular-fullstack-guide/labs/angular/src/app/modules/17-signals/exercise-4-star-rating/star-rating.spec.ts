import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { StarRating } from './star-rating';

@Component({
  imports: [StarRating],
  template: `<lab-star-rating [(value)]="score" max="4" [readonly]="locked()" label="Book rating" />`,
})
class Host {
  readonly score = signal(2);
  readonly locked = signal(false);
}

async function setup() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const root = fixture.nativeElement as HTMLElement;
  const buttons = () => Array.from(root.querySelectorAll('button'));
  return { fixture, root, buttons };
}

describe('E17.4 StarRating with model() and input transforms', () => {
  it('renders one button per star, using the numeric transform on the max attribute', async () => {
    const { buttons } = await setup();
    expect(buttons()).toHaveLength(4);
  });

  it('reflects the parent value', async () => {
    const { buttons } = await setup();
    expect(buttons().map((b) => b.getAttribute('aria-pressed'))).toEqual(['true', 'true', 'false', 'false']);
  });

  it('writes the clicked star back to the parent signal (two-way binding)', async () => {
    const { fixture, buttons } = await setup();
    buttons()[3]!.click();
    expect(fixture.componentInstance.score()).toBe(4);
  });

  it('updates the stars when the parent changes the value', async () => {
    const { fixture, buttons } = await setup();
    fixture.componentInstance.score.set(1);
    await fixture.whenStable();
    expect(buttons().filter((b) => b.getAttribute('aria-pressed') === 'true')).toHaveLength(1);
  });

  it('ignores clicks and disables buttons when readonly', async () => {
    const { fixture, buttons } = await setup();
    fixture.componentInstance.locked.set(true);
    await fixture.whenStable();
    expect(buttons().every((b) => b.disabled)).toBe(true);
    const rating = fixture.debugElement.children[0]!.componentInstance as StarRating;
    rating.rate(4);
    expect(fixture.componentInstance.score()).toBe(2);
  });

  it('supports arrow keys and clamps to the range', async () => {
    const { fixture, root } = await setup();
    const host = root.querySelector('lab-star-rating')!;
    host.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    host.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    host.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(fixture.componentInstance.score()).toBe(4);
  });

  it('exposes an accessible group name', async () => {
    const { root } = await setup();
    const host = root.querySelector('lab-star-rating')!;
    expect(host.getAttribute('role')).toBe('group');
    expect(host.getAttribute('aria-label')).toBe('Book rating');
  });
});
