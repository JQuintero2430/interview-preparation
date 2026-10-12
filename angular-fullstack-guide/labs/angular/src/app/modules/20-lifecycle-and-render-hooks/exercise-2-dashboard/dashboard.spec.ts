import { isSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  BrokenListDashboard,
  BrokenTitleDashboard,
  BrokenTotalDashboard,
} from './legacy/broken-dashboard';
import { Dashboard } from './dashboard';
import { DashboardHost } from './dashboard-host';
import { DashboardTitle, TitleSlot } from './title-slot';

const textOf = (fixture: ComponentFixture<unknown>): string =>
  (fixture.nativeElement as HTMLElement).textContent?.replace(/\s+/g, ' ').trim() ?? '';

const errorOf = (action: () => void): string => {
  try {
    action();
  } catch (error) {
    return (error as Error).message;
  }
  return '';
};

function renderFixed() {
  const fixture = TestBed.createComponent(DashboardHost);
  fixture.detectChanges();
  const dashboard: Dashboard = fixture.debugElement.query(
    By.directive(Dashboard),
  ).componentInstance;
  const slot: TitleSlot = fixture.debugElement.query(By.directive(TitleSlot)).componentInstance;
  return { fixture, dashboard, slot };
}

describe('E20.2 Remove the ExpressionChangedAfterItHasBeenCheckedError from a dashboard', () => {
  it("each of the broken dashboard's two NG0100 sources throws NG0100 in the spec", () => {
    const title = TestBed.createComponent(BrokenTitleDashboard);
    expect(errorOf(() => title.detectChanges())).toContain(
      "NG0100: ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked. Previous value: 'Untitled'. Current value: 'Sales'.",
    );
    title.destroy();
    const total = TestBed.createComponent(BrokenTotalDashboard);
    expect(errorOf(() => total.detectChanges())).toContain(
      "Previous value: 'Total 30 (read 1)'. Current value: 'Total 30 (read 2)'.",
    );
  });

  it('the fixed dashboard renders the child-provided title through a service signal without an error', () => {
    const { fixture, dashboard } = renderFixed();
    const title = fixture.debugElement.query(By.directive(Dashboard)).injector.get(DashboardTitle);
    expect(title.text()).toBe('Sales');
    expect(dashboard).toBeTruthy();
  });

  it('the derived total is a read-only signal and renders the same value on every pass', () => {
    const { fixture, dashboard } = renderFixed();
    expect(isSignal(dashboard.total)).toBe(true);
    expect('set' in dashboard.total).toBe(false);
    for (let pass = 0; pass < 3; pass++) {
      fixture.detectChanges();
      expect(textOf(fixture)).toContain('Total 30');
    }
  });

  it('a replaced list reaches the child, while an in-place edit is not announced and shows nothing', () => {
    const { fixture, dashboard } = renderFixed();
    expect(textOf(fixture)).toContain('2 items');
    (dashboard.items() as number[]).push(1);
    fixture.detectChanges();
    expect(textOf(fixture)).toContain('2 items');
    dashboard.add();
    fixture.detectChanges();
    expect(textOf(fixture)).toContain('4 items');
    expect(textOf(fixture)).toContain('Total 36');

    const broken = TestBed.createComponent(BrokenListDashboard);
    broken.detectChanges();
    broken.componentInstance.add();
    broken.detectChanges();
    expect(broken.componentInstance.count).toBe(2);
    expect(textOf(broken)).toBe('2 items');
  });

  it('the fixed dashboard shows the child title in the same detectChanges pass', () => {
    const fixture = TestBed.createComponent(DashboardHost);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h2').textContent).toBe('Sales');
  });

  it('the fixed components hold no state outside signals', () => {
    const { dashboard, slot } = renderFixed();
    const outsideSignals = (instance: object) =>
      Object.entries(instance)
        // __ngContext__ is the link Angular adds to every instance in development mode.
        .filter(
          ([key, value]) =>
            key !== '__ngContext__' && !isSignal(value) && !(value instanceof DashboardTitle),
        )
        .map(([key]) => key);
    expect(outsideSignals(dashboard)).toEqual([]);
    expect(outsideSignals(slot)).toEqual([]);
  });
});
