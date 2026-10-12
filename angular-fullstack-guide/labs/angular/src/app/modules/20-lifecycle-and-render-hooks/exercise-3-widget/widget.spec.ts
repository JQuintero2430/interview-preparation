import { ApplicationRef, ComponentRef, EnvironmentInjector, createComponent } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Chart } from './chart';
import { ChartHost } from './chart-host';
import { ChartLog } from './fake-chart';

let width = 300;

beforeEach(() => {
  width = 300;
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
    () => ({ width }) as DOMRect,
  );
});

afterEach(() => vi.restoreAllMocks());

function attachedChart(): ComponentRef<Chart> {
  const ref = createComponent(Chart, { environmentInjector: TestBed.inject(EnvironmentInjector) });
  ref.setInput('data', [1, 2, 3]);
  TestBed.inject(ApplicationRef).attachView(ref.hostView);
  return ref;
}

function render(): { fixture: ComponentFixture<ChartHost>; host: ChartHost; log: ChartLog } {
  const fixture = TestBed.createComponent(ChartHost);
  fixture.detectChanges();
  return { fixture, host: fixture.componentInstance, log: TestBed.inject(ChartLog) };
}

describe('E20.3 Wrap a non-Angular widget with render hooks', () => {
  it('nothing is created before the first render and the chart is created once after it', () => {
    const log = TestBed.inject(ChartLog);
    const ref = attachedChart();
    expect(log.charts).toHaveLength(0);
    TestBed.inject(ApplicationRef).tick();
    expect(log.charts).toHaveLength(1);
    TestBed.inject(ApplicationRef).tick();
    expect(log.charts).toHaveLength(1);
    ref.destroy();
  });

  it('the write phase runs before the read phase in one render (recorded order)', () => {
    const { fixture, log } = render();
    expect(log.entries).toEqual(['write', 'read', 'read']);
    fixture.destroy();
    width = 0;
    TestBed.createComponent(ChartHost).detectChanges();
    expect(log.entries.slice(3)).toEqual(['write', 'read']);
  });

  it('a changed data updates the chart without creating a second one', () => {
    const { fixture, host, log } = render();
    expect(log.charts[0].calls.update).toBe(0);
    host.data.set([4, 5]);
    fixture.detectChanges();
    expect(log.charts).toHaveLength(1);
    expect(log.charts[0].calls.update).toBe(1);
    expect(log.charts[0].data).toEqual([4, 5]);
  });

  it('the measured size is exposed as a signal and updates after a later render', () => {
    const { fixture, host, log } = render();
    const chart = fixture.debugElement.children[0].componentInstance as Chart;
    expect(chart.size()).toBe(300);
    expect(log.charts[0].width).toBe(300);
    width = 500;
    host.data.set([7]);
    fixture.detectChanges();
    expect(chart.size()).toBe(500);
    expect(log.charts[0].width).toBe(500);
  });

  it('destroying the component destroys the chart once and stops further updates', () => {
    const { fixture, host, log } = render();
    host.shown.set(false);
    fixture.detectChanges();
    expect(log.charts[0].calls.destroy).toBe(1);
    host.data.set([9]);
    fixture.detectChanges();
    expect(log.charts[0].calls.update).toBe(0);
    expect(log.charts[0].calls.destroy).toBe(1);
  });

  it('a component destroyed before its first render never creates a chart', () => {
    const log = TestBed.inject(ChartLog);
    const ref = attachedChart();
    ref.destroy();
    TestBed.inject(ApplicationRef).tick();
    expect(log.charts).toHaveLength(0);
    expect(log.entries).toEqual([]);
  });
});
