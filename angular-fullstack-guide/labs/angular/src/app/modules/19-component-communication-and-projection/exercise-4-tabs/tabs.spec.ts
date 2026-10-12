import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Tab } from './tab';
import { TabsHost, probeCount } from './tabs-host';

// A tab with no lab-m19-tabs around it.
@Component({ selector: 'lab-m19-orphan', imports: [Tab], template: `<lab-m19-tab label="Lost" />` })
class Orphan {}

const root = (fixture: ComponentFixture<unknown>): HTMLElement => fixture.nativeElement as HTMLElement;

const buttons = (fixture: ComponentFixture<unknown>): HTMLButtonElement[] =>
  Array.from(root(fixture).querySelectorAll('button'));

const visible = (fixture: ComponentFixture<unknown>): boolean[] =>
  Array.from(root(fixture).querySelectorAll<HTMLElement>('lab-m19-tab')).map((tab) => !tab.hidden);

function render(): ComponentFixture<TabsHost> {
  const fixture = TestBed.createComponent(TabsHost);
  fixture.detectChanges();
  return fixture;
}

describe('E19.4 Tabs with content queries and model()', () => {
  beforeEach(() => {
    probeCount.created = 0;
  });

  it('one button per tab, labelled by its label input', () => {
    expect(buttons(render()).map((b) => b.textContent?.trim())).toEqual(['Overview', 'Details', 'Archived']);
  });

  it('[(selected)] writes the parent signal when a button is clicked and a parent write changes the active tab', () => {
    const fixture = render();
    buttons(fixture)[1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selected()).toBe(1);
    expect(visible(fixture)).toEqual([false, true, false]);
    fixture.componentInstance.selected.set(0);
    fixture.detectChanges();
    expect(visible(fixture)).toEqual([true, false, false]);
  });

  it('a disabled tab ignores clicks', () => {
    const fixture = render();
    const archived = buttons(fixture)[2];
    expect(archived.disabled).toBe(true);
    archived.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selected()).toBe(0);
    expect(visible(fixture)).toEqual([true, false, false]);
  });

  it("only the active tab's content is visible, and every tab component is constructed once", () => {
    const fixture = render();
    expect(visible(fixture)).toEqual([true, false, false]);
    expect(probeCount.created).toBe(3);
    buttons(fixture)[1].click();
    fixture.detectChanges();
    expect(visible(fixture)).toEqual([false, true, false]);
    expect(probeCount.created).toBe(3);
  });

  it('adding a tab with an @if adds a button and keeps the selection', () => {
    const fixture = render();
    buttons(fixture)[1].click();
    fixture.componentInstance.showExtra.set(true);
    fixture.detectChanges();
    expect(buttons(fixture).map((b) => b.textContent?.trim())).toEqual(['Overview', 'Details', 'Archived', 'Extra']);
    expect(fixture.componentInstance.selected()).toBe(1);
    expect(visible(fixture)).toEqual([false, true, false, false]);
  });

  it('a tab created outside lab-m19-tabs throws the injection error', () => {
    // The test build names the class `_Tabs`; the leading underscore is part of the observed text.
    let message = '';
    try {
      TestBed.createComponent(Orphan).detectChanges();
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toBe(
      'NG0201: No provider found for `_Tabs`. Source: DynamicTestModule. Find more at https://v22.angular.dev/errors/NG0201',
    );
  });
});
