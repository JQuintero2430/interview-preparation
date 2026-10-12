import { ApplicationRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FreezeWhenHidden } from './freeze-when-hidden';
import { LivePanel, PanelChild } from './live-panel';
import { PanelHost } from './panel-host';

async function render() {
  const fixture = TestBed.createComponent(PanelHost);
  fixture.detectChanges();
  await fixture.whenStable();
  return { fixture, host: fixture.componentInstance };
}

const panelOf = (fixture: ComponentFixture<PanelHost>): LivePanel =>
  fixture.debugElement.query(By.directive(LivePanel)).componentInstance;

const childOf = (fixture: ComponentFixture<PanelHost>): PanelChild =>
  fixture.debugElement.query(By.directive(PanelChild)).componentInstance;

const freezeOf = (fixture: ComponentFixture<PanelHost>): FreezeWhenHidden =>
  fixture.debugElement.query(By.directive(FreezeWhenHidden)).injector.get(FreezeWhenHidden);

const shown = (fixture: ComponentFixture<PanelHost>, selector: string): string =>
  fixture.nativeElement.querySelector(selector)?.textContent ?? '';

async function hide({ fixture, host }: Awaited<ReturnType<typeof render>>): Promise<void> {
  host.hidden.set(true);
  await fixture.whenStable();
}

describe('E21.5 Freeze a live panel while it is hidden', () => {
  it('while hidden is true a signal change does not render', async () => {
    const state = await render();
    await hide(state);
    const runs = panelOf(state.fixture).runs;

    panelOf(state.fixture).value.set(1);
    await state.fixture.whenStable();

    expect(shown(state.fixture, '.value')).toBe('first:0');
    expect(panelOf(state.fixture).runs).toBe(runs);
  });

  it('a refresh() call renders the latest state once', async () => {
    const state = await render();
    await hide(state);
    const panel = panelOf(state.fixture);
    panel.value.set(1);
    panel.value.set(2);
    const before = panel.runs;

    freezeOf(state.fixture).refresh();
    expect(shown(state.fixture, '.value')).toBe('first:2');
    const after = panel.runs;
    expect(after).toBeGreaterThan(before);

    await state.fixture.whenStable();
    expect(panel.runs).toBe(after);
  });

  it('showing the panel again renders the latest state without an extra call', async () => {
    const state = await render();
    await hide(state);
    panelOf(state.fixture).value.set(5);
    await state.fixture.whenStable();
    expect(shown(state.fixture, '.value')).toBe('first:0');

    state.host.hidden.set(false);
    await state.fixture.whenStable();
    expect(shown(state.fixture, '.value')).toBe('first:5');
  });

  it('children of the panel freeze with it', async () => {
    const state = await render();
    await hide(state);

    childOf(state.fixture).count.set(7);
    await state.fixture.whenStable();
    expect(shown(state.fixture, '.child')).toBe('0');

    state.host.hidden.set(false);
    await state.fixture.whenStable();
    expect(shown(state.fixture, '.child')).toBe('7');
  });

  it('destroying a hidden panel leaves no error', async () => {
    const state = await render();
    await hide(state);

    state.host.shown.set(false);
    await state.fixture.whenStable();
    expect(() => TestBed.inject(ApplicationRef).tick()).not.toThrow();
    expect(state.fixture.nativeElement.querySelector('lab-m21-e5-panel')).toBeNull();
  });

  it("the panel inside an OnPush parent still follows the parent's inputs after reattach", async () => {
    const state = await render();
    await hide(state);
    state.host.title.set('second');
    await state.fixture.whenStable();
    expect(shown(state.fixture, '.value')).toBe('first:0');

    state.host.hidden.set(false);
    await state.fixture.whenStable();
    expect(shown(state.fixture, '.value')).toBe('second:0');

    state.host.title.set('third');
    await state.fixture.whenStable();
    expect(shown(state.fixture, '.value')).toBe('third:0');
  });
});
