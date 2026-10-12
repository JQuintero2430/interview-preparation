import { Component, Type, reflectComponentType } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Timing, TimingItem } from '../legacy/migration-sample/decorator-behaviors';
import { LegacyWidget } from '../legacy/migration-sample/legacy-widget';
import { LegacyWidgetHost } from '../legacy/migration-sample/legacy-widget-host';
import { MigratedWidget } from '../migrated/migrated-widget';
import { MigratedWidgetHost } from '../migrated/migrated-widget-host';

@Component({
  selector: 'lab-m19-s6-timing-host',
  imports: [Timing, TimingItem],
  template: `
    <lab-m19-s6-timing [step]="3"><span labM19S6Item></span></lab-m19-s6-timing>
  `,
})
class TimingHost {}

function timing(): { log: string[]; q: Timing; detect: () => void } {
  const fixture = TestBed.createComponent(TimingHost);
  fixture.detectChanges();
  const q = fixture.debugElement.children[0]!.componentInstance as Timing;
  return { log: q.log, q, detect: () => fixture.detectChanges() };
}

function text(el: Element): string {
  return [...el.querySelectorAll('p')].map((p) => (p.textContent ?? '').trim()).join('|');
}

function pick(root: HTMLElement): void {
  const buttons = root.querySelectorAll('button');
  buttons[0]!.click();
  buttons[1]!.click();
}

describe('Section 6: decorator forms and the migrated sample', () => {
  it('Section 6: @ViewChild static true resolves in ngOnInit and a dynamic one after the view is created', () => {
    const { log, q, detect } = timing();
    expect(log.find((l) => l.startsWith('init'))).toContain('static=true dynamic=false');
    expect(log.find((l) => l.startsWith('view'))).toContain('dynamic=true');

    q.show.set(true);
    detect();
    expect(q.dynamicA?.nativeElement.tagName).toBe('SPAN');
    expect(q.staticB).toBeUndefined();
    expect(q.bs.length).toBe(1);
  });

  it('Section 6: @ContentChild is empty in ngOnInit and set when ngAfterContentInit runs', () => {
    const { log } = timing();
    expect(log.find((l) => l.startsWith('init'))).toContain('item=false items=false');
    expect(log.find((l) => l.startsWith('content'))).toBe('content item=true items=1');
  });

  it('Section 6: QueryList changes emits when an @if adds an item', () => {
    const { q, detect } = timing();
    const lengths: number[] = [];
    q.bs.changes.subscribe((list: typeof q.bs) => lengths.push(list.length));
    expect(q.bs.length).toBe(0);

    q.show.set(true);
    detect();
    expect(lengths).toEqual([1]);
    expect(q.bs.first.nativeElement.textContent).toBe('b');

    q.show.set(false);
    detect();
    expect(lengths).toEqual([1, 0]);
  });

  it('Section 6: a decorator input setter runs before ngOnInit', () => {
    const { log } = timing();
    expect(log.slice(0, 3).map((l) => l.split(' ')[0])).toEqual(['constructor', 'setter:3', 'init']);
  });

  it('Section 6: the migrated sample renders the same text as the legacy sample', () => {
    const legacy = TestBed.createComponent(LegacyWidgetHost);
    legacy.detectChanges();
    const migrated = TestBed.createComponent(MigratedWidgetHost);
    migrated.detectChanges();
    const before = text(legacy.nativeElement);
    expect(before).toContain('max=9 readonly=true|value=1 tone=warm step=2|');
    expect(before).toContain('tag=H4 slots=2 first=one doubled=0|1');
    expect(text(migrated.nativeElement)).toBe(before);

    pick(legacy.nativeElement);
    pick(migrated.nativeElement);
    legacy.detectChanges();
    migrated.detectChanges();
    expect(text(legacy.nativeElement)).toContain('value=9');
    expect(text(legacy.nativeElement)).toContain('doubled=18');
    expect(text(migrated.nativeElement)).toBe(text(legacy.nativeElement));
    expect(migrated.componentInstance.score).toBe(9);
    expect(migrated.componentInstance.closedCount).toBe(1);
  });

  it('Section 6: reflectComponentType marks migrated inputs as signals and skipped inputs as decorators', () => {
    const flags = (type: Type<unknown>) =>
      Object.fromEntries(
        reflectComponentType(type)!.inputs.map((i) => [i.propName, [i.templateName, i.isSignal]]),
      );
    expect(flags(MigratedWidget)).toEqual({
      label: ['label', true],
      max: ['max', true],
      readonly: ['readonly', true],
      value: ['value', false],
      toneClass: ['tone', true],
      step: ['step', false],
    });
    expect(Object.values(flags(LegacyWidget)).every(([, isSignal]) => isSignal === false)).toBe(true);
  });
});
