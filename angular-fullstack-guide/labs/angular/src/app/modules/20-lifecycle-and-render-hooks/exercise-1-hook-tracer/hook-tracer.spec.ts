import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HookLog } from './hook-log';
import { TracedNode } from './traced-node';
import { TracerHost } from './tracer-host';

const GROUPS = [
  'onChanges',
  'onInit',
  'doCheck',
  'afterContentInit',
  'afterContentChecked',
  'afterViewInit',
  'afterViewChecked',
];

function render() {
  const fixture = TestBed.createComponent(TracerHost);
  const log = TestBed.inject(HookLog);
  fixture.detectChanges();
  const parent: TracedNode = fixture.debugElement.query(By.directive(TracedNode)).componentInstance;
  return { fixture, log, parent, host: fixture.componentInstance };
}

describe('E20.1 Trace the lifecycle of a component tree', () => {
  it('on the first render the constructors come first and the hooks follow the order of the documented groups', () => {
    const { log } = render();
    const entries = log.entries();
    expect(entries.slice(0, 3)).toEqual(['ctor', 'ctor', 'ctor']);
    expect(entries.slice(3).includes('ctor')).toBe(false);
    for (const name of ['parent', 'sib', 'leaf']) {
      const positions = GROUPS.map((hook) => entries.indexOf(`${name}.${hook}`));
      expect(positions).toEqual([...positions].sort((a, b) => a - b));
      expect(positions.every((position) => position > 2)).toBe(true);
    }
  });

  it('the "after" hooks run deepest first (a leaf before its parent)', () => {
    const entries = render().log.entries();
    for (const hook of ['afterViewInit', 'afterViewChecked']) {
      expect(entries.indexOf(`leaf.${hook}`)).toBeLessThan(entries.indexOf(`parent.${hook}`));
    }
  });

  it("a projected node's pre-order hooks run after its host's and before its host's own child's", () => {
    const entries = render().log.entries();
    const at = (line: string) => entries.indexOf(line);
    expect(at('parent.doCheck')).toBeLessThan(at('sib.onChanges'));
    expect(at('sib.doCheck')).toBeLessThan(at('leaf.onChanges'));
  });

  it("a change read only by a parent's template runs the child's check hooks and not the parent's own", () => {
    const { fixture, log, parent } = render();
    const before = log.entries().length;
    parent.count.set(1);
    fixture.detectChanges();
    expect(log.entries().slice(before)).toEqual([
      'leaf.doCheck',
      'leaf.afterContentChecked',
      'leaf.afterViewChecked',
    ]);
  });

  it('removing the tree runs ngOnDestroy deepest first', () => {
    const { fixture, log, host } = render();
    const before = log.entries().length;
    host.shown.set(false);
    fixture.detectChanges();
    expect(log.entries().slice(before)).toEqual([
      'leaf.onDestroy',
      'sib.onDestroy',
      'parent.onDestroy',
    ]);
  });

  it('the recorded log of the whole story equals a literal expected array', () => {
    const { fixture, log, parent, host } = render();
    parent.count.set(1);
    fixture.detectChanges();
    host.shown.set(false);
    fixture.detectChanges();
    expect(log.entries()).toEqual([
      // first render: constructors, then one pass
      'ctor',
      'ctor',
      'ctor',
      'parent.onChanges',
      'parent.onInit',
      'parent.doCheck',
      'sib.onChanges',
      'sib.onInit',
      'sib.doCheck',
      'sib.afterContentInit',
      'sib.afterContentChecked',
      'parent.afterContentInit',
      'parent.afterContentChecked',
      'leaf.onChanges',
      'leaf.onInit',
      'leaf.doCheck',
      'leaf.afterContentInit',
      'leaf.afterContentChecked',
      'leaf.afterViewInit',
      'leaf.afterViewChecked',
      'sib.afterViewInit',
      'sib.afterViewChecked',
      'parent.afterViewInit',
      'parent.afterViewChecked',
      // parent.count.set(1)
      'leaf.doCheck',
      'leaf.afterContentChecked',
      'leaf.afterViewChecked',
      // host.shown.set(false)
      'leaf.onDestroy',
      'sib.onDestroy',
      'parent.onDestroy',
    ]);
  });
});
