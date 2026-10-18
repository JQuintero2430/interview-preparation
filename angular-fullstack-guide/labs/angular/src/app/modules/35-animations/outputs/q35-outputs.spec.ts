import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

/** One callback the template received: which one, and the event's phase and states. */
interface Seen {
  phase: string;
  from: string;
  to: string;
}

// Q35.15: a trigger with two states and a two-way transition, with start and done callbacks.
@Component({
  selector: 'lab-m35-q35-15',
  animations: [
    trigger('t', [
      state('open', style({ height: '80px' })),
      state('closed', style({ height: '20px' })),
      transition('open <=> closed', animate('300ms')),
    ]),
  ],
  template: `<div
    [@t]="current()"
    (@t.start)="seen.push({ phase: $event.phaseName, from: $event.fromState, to: $event.toState })"
    (@t.done)="seen.push({ phase: $event.phaseName, from: $event.fromState, to: $event.toState })"
  >
    Panel
  </div>`,
})
class LabM35Q3515 {
  readonly current = signal<'open' | 'closed'>('open');
  readonly seen: Seen[] = [];
}

describe('Q35.15 a legacy trigger under provideNoopAnimations', () => {
  it('Q35.15 first render reports void to open and a toggle reports open to closed, each start before done', async () => {
    TestBed.configureTestingModule({ providers: [provideNoopAnimations()] });
    const fixture = TestBed.createComponent(LabM35Q3515);
    fixture.detectChanges();
    await fixture.whenStable();
    const first = fixture.componentInstance.seen.splice(0);

    fixture.componentInstance.current.set('closed');
    fixture.detectChanges();
    await fixture.whenStable();
    const toggled = fixture.componentInstance.seen.splice(0);

    expect(first).toEqual([
      { phase: 'start', from: 'void', to: 'open' },
      { phase: 'done', from: 'void', to: 'open' },
    ]);
    expect(toggled).toEqual([
      { phase: 'start', from: 'open', to: 'closed' },
      { phase: 'done', from: 'open', to: 'closed' },
    ]);
  });
});
