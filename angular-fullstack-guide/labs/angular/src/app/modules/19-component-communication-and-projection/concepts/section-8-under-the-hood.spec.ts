import { Component, computed, input, model, output, reflectComponentType, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LegacyWidget } from '../legacy/migration-sample/legacy-widget';

// --- The public mirror of the compiled definition ---

@Component({
  selector: 'lab-m19-s8-def',
  template: `<ng-content select="[title]">T</ng-content><ng-content />`,
})
class Def {
  readonly label = input.required<string>();
  readonly n = input(0, { alias: 'count' });
  readonly v = model(0);
  readonly done = output<number>();
}

// --- A query signal that a computed reads ---

@Component({
  selector: 'lab-m19-s8-query',
  template: `
    @if (show()) {
      <span #b>b</span>
    }
  `,
})
class QueryHost {
  readonly show = signal(false);
  readonly b = viewChild('b');
  evaluations = 0;
  readonly found = computed(() => {
    this.evaluations++;
    return this.b() !== undefined;
  });
}

// --- The wildcard slot comes first in the template ---

@Component({
  selector: 'lab-m19-s8-wild',
  template: `<main><ng-content /></main><header><ng-content select="[a]" /></header>`,
})
class Wild {}

@Component({
  selector: 'lab-m19-s8-wild-host',
  imports: [Wild],
  template: `<lab-m19-s8-wild><h1 a>A</h1><span>loose</span></lab-m19-s8-wild>`,
})
class WildHost {}

@Component({
  selector: 'lab-m19-s8-strict',
  template: `<header><ng-content select="[a]" /></header>`,
})
class Strict {}

@Component({
  selector: 'lab-m19-s8-strict-host',
  imports: [Strict],
  template: `<lab-m19-s8-strict><h1 a>A</h1><span>loose</span></lab-m19-s8-strict>`,
})
class StrictHost {}

function markup(type: new () => unknown): string {
  const fixture = TestBed.createComponent(type);
  fixture.detectChanges();
  return fixture.nativeElement.innerHTML.replace(/<!--.*?-->/g, '');
}

describe('Section 8: under the hood', () => {
  it('Section 8: reflectComponentType reports inputs, outputs and ngContentSelectors', () => {
    const mirror = reflectComponentType(Def)!;
    expect(mirror.selector).toBe('lab-m19-s8-def');
    expect(mirror.isStandalone).toBe(true);
    expect(mirror.ngContentSelectors).toEqual(['[title]', '*']);
    expect(mirror.inputs.map((i) => [i.propName, i.templateName, i.isSignal])).toEqual([
      ['label', 'label', true],
      ['n', 'count', true],
      ['v', 'v', true],
    ]);
    expect(mirror.outputs.map((o) => [o.propName, o.templateName])).toEqual([
      ['v', 'vChange'],
      ['done', 'done'],
    ]);

    const legacy = reflectComponentType(LegacyWidget)!;
    expect(legacy.inputs.find((i) => i.propName === 'toneClass')).toMatchObject({ templateName: 'tone', isSignal: false });
    expect(legacy.outputs.find((o) => o.propName === 'closed')?.templateName).toBe('closed');
  });

  it('Section 8: a query signal re-evaluates when its element appears', () => {
    const fixture = TestBed.createComponent(QueryHost);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    expect(host.found()).toBe(false);
    expect(host.found()).toBe(false);
    expect(host.evaluations).toBe(1);

    host.show.set(true);
    fixture.detectChanges();
    expect(host.found()).toBe(true);
    expect(host.evaluations).toBe(2);
  });

  it('Section 8: the wildcard slot only receives nodes that no other slot matches', () => {
    expect(markup(WildHost)).toBe('<lab-m19-s8-wild><main><span>loose</span></main><header><h1 a="">A</h1></header></lab-m19-s8-wild>');
  });

  it('Section 8: a node that matches no slot is not projected when there is no wildcard', () => {
    const html = markup(StrictHost);
    expect(html).toContain('<h1 a="">A</h1>');
    expect(html).not.toContain('loose');
  });
});
