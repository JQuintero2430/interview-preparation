import { animate, style, transition, trigger } from '@angular/animations';
import { ANIMATION_MODULE_TYPE, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

/** One callback the template received: the phase and the two states of the event. */
interface Seen {
  phase: string;
  from: string;
  to: string;
}

@Component({
  selector: 'lab-m35-legacy-spec',
  animations: [trigger('flag', [transition('off => on', animate('300ms', style({ opacity: 1 })))])],
  template: `<p
    [@flag]="state()"
    (@flag.start)="
      seen.push({ phase: $event.phaseName, from: $event.fromState, to: $event.toState })
    "
    (@flag.done)="
      seen.push({ phase: $event.phaseName, from: $event.fromState, to: $event.toState })
    "
  >
    Flag
  </p>`,
})
class LabM35LegacySpec {
  readonly state = signal('off');
  readonly seen: Seen[] = [];
}

// A [@flag] binding is a synthetic property: the DOM renderer refuses it unless an animation provider replaced
// the renderer factory (@angular/platform-browser 22.2.1, the DomRenderer's setProperty, error NG05105).
describe('Section 8: legacy animation providers', () => {
  it('Section 8: under provideNoopAnimations the start and done callbacks report fromState and toState', async () => {
    TestBed.configureTestingModule({ providers: [provideNoopAnimations()] });
    const fixture = TestBed.createComponent(LabM35LegacySpec);
    fixture.detectChanges();
    fixture.componentInstance.state.set('on');
    fixture.detectChanges();
    await fixture.whenStable();

    const seen = fixture.componentInstance.seen.filter((entry) => entry.to === 'on');
    expect(seen).toEqual([
      { phase: 'start', from: 'off', to: 'on' },
      { phase: 'done', from: 'off', to: 'on' },
    ]);
  });

  it('Section 8: a synthetic property without an animation provider throws NG05105', () => {
    expect(() => {
      const fixture = TestBed.createComponent(LabM35LegacySpec);
      fixture.detectChanges();
    }).toThrowError(/NG05105/);
  });

  it('Section 8: provideNoopAnimations sets ANIMATION_MODULE_TYPE to NoopAnimations', () => {
    TestBed.configureTestingModule({ providers: [provideNoopAnimations()] });
    expect(TestBed.inject(ANIMATION_MODULE_TYPE)).toBe('NoopAnimations');
  });
});
