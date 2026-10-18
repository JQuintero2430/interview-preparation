import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LabM31Dashboard } from './dashboard';
import { LabM31EntityList } from './entity-list';
import { LAB_M31_ENTITY_COUNT, LabM31EntityStore } from './entity-store';
import { LabM31RunCounter } from './run-counter';

/** Renders the dashboard, waits for the first stable point and zeroes the counts. */
async function renderDashboard(): Promise<ComponentFixture<LabM31Dashboard>> {
  const fixture = TestBed.createComponent(LabM31Dashboard);
  fixture.detectChanges();
  await fixture.whenStable();
  TestBed.inject(LabM31RunCounter).reset();
  return fixture;
}

/** Writes the unrelated `clock` signal `times` times, letting the scheduler refresh after each write. */
async function tickClock(fixture: ComponentFixture<LabM31Dashboard>, times: number): Promise<void> {
  for (let i = 0; i < times; i++) {
    fixture.componentInstance.clock.update((n) => n + 1);
    await fixture.whenStable();
  }
}

describe('Section 3: runtime cost of a change', () => {
  it('Section 3: a template method runs on every check of its view', async () => {
    const fixture = await renderDashboard();
    const runs = TestBed.inject(LabM31RunCounter);

    await tickClock(fixture, 3);

    expect(runs.method).toBe(3);
  });

  it('Section 3: a computed over the rows does not run when an unrelated signal changes', async () => {
    const fixture = await renderDashboard();
    const runs = TestBed.inject(LabM31RunCounter);

    await tickClock(fixture, 3);
    expect(runs.computed).toBe(0);

    fixture.componentInstance.query.set('Row 1');
    await fixture.whenStable();
    expect(runs.computed).toBe(1);
  });

  it('Section 3: a pure pipe runs again only when its input reference changes', async () => {
    const fixture = await renderDashboard();
    const runs = TestBed.inject(LabM31RunCounter);
    const host: HTMLElement = fixture.nativeElement;

    await tickClock(fixture, 2);
    expect(runs.pipe).toBe(0);

    fixture.componentInstance.rows().push({ id: 100, name: 'Row 100', amount: 1 });
    await tickClock(fixture, 1);
    expect(runs.pipe).toBe(0);
    expect(host.textContent).toContain('Total: 100');

    fixture.componentInstance.rows.update((list) => [...list]);
    await fixture.whenStable();
    expect(runs.pipe).toBe(1);
    expect(host.textContent).toContain('Total: 101');
  });

  it('Section 3: one changed entity re-runs a list-wide selector over all rows', () => {
    const store = TestBed.inject(LabM31EntityStore);
    const runs = TestBed.inject(LabM31RunCounter);
    expect(store.labels()).toHaveLength(LAB_M31_ENTITY_COUNT);
    runs.reset();

    store.rename(42, 'Renamed');
    const labels = store.labels();

    expect(runs.selectorRows).toBe(100);
    expect(labels[42]).toBe('#42 Renamed');
  });

  it("Section 3: one changed entity re-runs only that row's computed", async () => {
    const runs = TestBed.inject(LabM31RunCounter);
    const fixture = TestBed.createComponent(LabM31EntityList);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(runs.rowComputed).toBe(100);
    runs.reset();

    TestBed.inject(LabM31EntityStore).rename(42, 'Renamed');
    await fixture.whenStable();

    const host: HTMLElement = fixture.nativeElement;
    expect(runs.rowComputed).toBe(1);
    expect(host.textContent).toContain('#42 Renamed');
  });
});
