import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Heavy, PanelHost, UntitledHost, bodyCounts } from './panel-host';

// The anti-pattern: an @if around <ng-content> hides the projected nodes but does not defer them.
@Component({
  selector: 'lab-m19-gated-panel',
  template: `@if (open()) { <ng-content /> }`,
})
class GatedPanel {
  readonly open = signal(false);
}

@Component({
  selector: 'lab-m19-gated-host',
  imports: [GatedPanel, Heavy],
  template: `<lab-m19-gated-panel><lab-m19-heavy /></lab-m19-gated-panel>`,
})
class GatedHost {}

const root = (fixture: ComponentFixture<unknown>): HTMLElement => fixture.nativeElement as HTMLElement;

const toggle = (fixture: ComponentFixture<unknown>): void => {
  root(fixture).querySelector<HTMLButtonElement>('.toggle')?.click();
  fixture.detectChanges();
};

describe('E19.2 A panel whose body is not created until it is opened', () => {
  beforeEach(() => {
    bodyCounts.created = 0;
    bodyCounts.destroyed = 0;
  });

  it('the fallback title shows when no title is projected and the projected title replaces it', () => {
    const untitled = TestBed.createComponent(UntitledHost);
    untitled.detectChanges();
    expect(root(untitled).querySelector('header')?.textContent).toContain('Untitled');
    const titled = TestBed.createComponent(PanelHost);
    titled.detectChanges();
    const header = root(titled).querySelector('header')?.textContent ?? '';
    expect(header).toContain('Details');
    expect(header).not.toContain('Untitled');
  });

  it('the body component is not constructed while the panel is closed', () => {
    const fixture = TestBed.createComponent(PanelHost);
    fixture.detectChanges();
    expect(bodyCounts.created).toBe(0);
    expect(root(fixture).querySelector('lab-m19-heavy')).toBeNull();
  });

  it('opening constructs it once and closing destroys it, and reopening constructs a new one', () => {
    const fixture = TestBed.createComponent(PanelHost);
    fixture.detectChanges();
    toggle(fixture);
    expect(bodyCounts).toEqual({ created: 1, destroyed: 0 });
    toggle(fixture);
    expect(bodyCounts).toEqual({ created: 1, destroyed: 1 });
    toggle(fixture);
    expect(bodyCounts).toEqual({ created: 2, destroyed: 1 });
  });

  it('the same body placed behind an @if around <ng-content> is constructed at the first render (the anti-pattern)', () => {
    const fixture = TestBed.createComponent(GatedHost);
    fixture.detectChanges();
    expect(bodyCounts.created).toBe(1);
    expect(root(fixture).querySelector('lab-m19-heavy')).toBeNull();
  });

  it('[(open)] writes the parent signal', () => {
    const fixture = TestBed.createComponent(PanelHost);
    fixture.detectChanges();
    toggle(fixture);
    expect(fixture.componentInstance.open()).toBe(true);
    fixture.componentInstance.open.set(false);
    fixture.detectChanges();
    expect(root(fixture).querySelector('lab-m19-heavy')).toBeNull();
  });

  it("the body's expressions read the declaring host's fields", () => {
    const fixture = TestBed.createComponent(PanelHost);
    fixture.detectChanges();
    toggle(fixture);
    expect(root(fixture).querySelector('.owner')?.textContent).toBe('host-field');
    fixture.componentInstance.owner.set('changed');
    fixture.detectChanges();
    expect(root(fixture).querySelector('.owner')?.textContent).toBe('changed');
  });
});
