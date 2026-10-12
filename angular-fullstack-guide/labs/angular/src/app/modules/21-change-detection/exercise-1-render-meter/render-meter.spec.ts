import { ApplicationRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MeterLeaf } from './meter-node';
import { MeterTree } from './meter-tree';
import { RenderMeter } from './render-meter';

// The literal table of Exercise 21.6: trigger -> names of the templates that ran (sorted, never counted).
const TABLE = {
  signalInLeaf: ['par-leaf'],
  markForCheck: ['par', 'par-eager', 'par-leaf', 'root'],
  click: ['par', 'par-eager', 'par-leaf', 'root'],
  newReference: ['par-eager', 'probe', 'root'],
  inPlaceEdit: ['par-eager', 'root'],
};

type Trigger = keyof typeof TABLE;

function leaf(fixture: ComponentFixture<MeterTree>, name: string) {
  return fixture.debugElement
    .queryAll(By.directive(MeterLeaf))
    .find((element) => (element.componentInstance as MeterLeaf).name() === name)!;
}

function fire(trigger: Trigger, fixture: ComponentFixture<MeterTree>): void {
  const tree = fixture.componentInstance;
  const parLeaf = leaf(fixture, 'par-leaf');
  const actions: Record<Trigger, () => void> = {
    signalInLeaf: () => (parLeaf.componentInstance as MeterLeaf).n.set(1),
    markForCheck: () => (parLeaf.componentInstance as MeterLeaf).cdr.markForCheck(),
    click: () => parLeaf.query(By.css('button')).nativeElement.click(),
    newReference: () => {
      tree.data = { n: 3 };
      tree.tick.update((count) => count + 1);
    },
    inPlaceEdit: () => {
      tree.data.n = 2;
      tree.tick.update((count) => count + 1);
    },
  };
  actions[trigger]();
}

async function refreshedBy(trigger?: Trigger): Promise<readonly string[]> {
  const fixture = TestBed.createComponent(MeterTree);
  fixture.detectChanges();
  const meter = TestBed.inject(RenderMeter);
  meter.reset();
  if (trigger) {
    fire(trigger, fixture);
  } else {
    TestBed.inject(ApplicationRef).tick();
  }
  await fixture.whenStable();
  return meter.ranSince();
}

describe('E21.1 Meter the refreshes of a component tree', () => {
  it('a signal written in a leaf refreshes only that leaf', async () => {
    const ran = await refreshedBy('signalInLeaf');
    expect(ran).toContain('par-leaf');
    for (const name of ['root', 'par', 'par-eager', 'par-eager-leaf', 'sib', 'probe']) {
      expect(ran).not.toContain(name);
    }
  });

  it('markForCheck in a leaf refreshes the leaf and its ancestors and not an OnPush sibling', async () => {
    const ran = await refreshedBy('markForCheck');
    expect(ran).toEqual(expect.arrayContaining(['par-leaf', 'par', 'root']));
    expect(ran).not.toContain('sib');
  });

  it('a click in an OnPush leaf refreshes the path to the root and the Eager sibling and not the OnPush sibling', async () => {
    const ran = await refreshedBy('click');
    expect(ran).toEqual(expect.arrayContaining(['par-leaf', 'par', 'root', 'par-eager']));
    expect(ran).not.toContain('sib');
  });

  it('a new input reference refreshes the child and an in-place edit does not', async () => {
    expect(await refreshedBy('newReference')).toContain('probe');
    expect(await refreshedBy('inPlaceEdit')).not.toContain('probe');
  });

  it('with no trigger nothing runs', async () => {
    expect(await refreshedBy()).toEqual([]);
  });

  it('the table "trigger to refreshed set" equals a literal object in the spec', async () => {
    const observed: Record<string, readonly string[]> = {};
    for (const trigger of Object.keys(TABLE) as Trigger[]) {
      observed[trigger] = await refreshedBy(trigger);
    }
    expect(observed).toEqual(TABLE);
  });
});
