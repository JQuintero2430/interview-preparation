import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BadgeLevel, StatusBadge } from './status-badge';

@Component({
  selector: 'lab-status-badge-host',
  imports: [StatusBadge],
  template: `
    <lab-status-badge
      [level]="level()"
      [label]="label()"
      [pulsing]="pulsing()"
      [hint]="hint()"
      [width]="width()"
      (dismissed)="dismissals.push($event)"
    />
  `,
})
class BadgeHost {
  readonly level = signal<BadgeLevel>('info');
  readonly label = signal<string | null>('Build passed');
  readonly pulsing = signal(false);
  readonly hint = signal<string | null>('Details');
  readonly width = signal<number | null>(120);
  readonly dismissals: (string | null)[] = [];
}

function setup() {
  const fixture = TestBed.createComponent(BadgeHost);
  fixture.detectChanges();
  const span = fixture.nativeElement.querySelector('span') as HTMLSpanElement;
  return { fixture, host: fixture.componentInstance, span };
}

describe('E13.1 A status badge made only of bindings', () => {
  it('the level maps to exactly one level class and the pulsing flag toggles `is-pulsing` without removing it', () => {
    const { fixture, host, span } = setup();
    expect([...span.classList].sort()).toEqual(['badge', 'is-info']);

    host.level.set('warn');
    host.pulsing.set(true);
    fixture.detectChanges();
    expect([...span.classList].sort()).toEqual(['badge', 'is-pulsing', 'is-warn']);

    host.level.set('error');
    fixture.detectChanges();
    expect([...span.classList].sort()).toEqual(['badge', 'is-error', 'is-pulsing']);

    host.pulsing.set(false);
    fixture.detectChanges();
    expect([...span.classList].sort()).toEqual(['badge', 'is-error']);
  });

  it('the tone and width bindings write a custom property and a pixel width, and a `null` width removes the declaration', () => {
    const { fixture, host, span } = setup();
    expect(span.style.getPropertyValue('--badge-tone')).toBe('teal');
    expect(span.style.width).toBe('120px');

    host.level.set('error');
    fixture.detectChanges();
    expect(span.style.getPropertyValue('--badge-tone')).toBe('crimson');

    host.width.set(null);
    fixture.detectChanges();
    expect(span.style.width).toBe('');
    expect(span.getAttribute('style')).not.toContain('width');
  });

  it('`aria-label` is written when the label is set and removed when it is `null`', () => {
    const { fixture, host, span } = setup();
    expect(span.getAttribute('aria-label')).toBe('Build passed');

    host.label.set(null);
    fixture.detectChanges();
    expect(span.hasAttribute('aria-label')).toBe(false);
  });

  it('`hint` binds the `title` property as an empty string for `\'\'` and `null`, never the text "null"', () => {
    const { fixture, host, span } = setup();
    expect(span.title).toBe('Details');

    host.hint.set('');
    fixture.detectChanges();
    expect(span.title).toBe('');

    host.hint.set(null);
    fixture.detectChanges();
    expect(span.title).toBe('');
    expect(span.title).not.toBe('null');
  });

  it('the class object is replaced, not mutated, when the level changes', () => {
    const { fixture, host, span } = setup();
    host.level.set('warn');
    fixture.detectChanges();
    expect(span.classList.contains('is-warn')).toBe(true);
    expect(span.classList.contains('is-info')).toBe(false);

    host.level.set('error');
    fixture.detectChanges();
    expect(span.classList.contains('is-error')).toBe(true);
    expect(span.classList.contains('is-warn')).toBe(false);
  });

  it('clicking emits `dismissed` once with the current label', () => {
    const { fixture, host, span } = setup();
    host.label.set('Deploy failed');
    fixture.detectChanges();

    span.click();
    expect(host.dismissals).toEqual(['Deploy failed']);
  });
});
