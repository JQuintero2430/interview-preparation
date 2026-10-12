import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

// Interpolation: every value is turned into text; null and undefined become empty text.
@Component({
  selector: 'lab-interpolation-values',
  template: `
    <p id="nothing">[{{ nothing }}]</p>
    <p id="missing">[{{ missing }}]</p>
    <p id="zero">[{{ zero }}]</p>
    <p id="no">[{{ no }}]</p>
    <p id="list">[{{ list }}]</p>
    <p id="plain">[{{ plain }}]</p>
    <p id="custom">[{{ custom }}]</p>
    <p id="attr" title="a-{{ missing }}-b"></p>
  `,
})
class InterpolationValues {
  protected readonly nothing = null;
  protected readonly missing = undefined;
  protected readonly zero = 0;
  protected readonly no = false;
  protected readonly list = [1, [2, 3]];
  protected readonly plain = { a: 1 };
  protected readonly custom = { toString: () => 'custom text' };
}

// The operators the CHANGELOG adds in 19.0, 19.2, 20.0, 21.0 and 21.2.
class Stamp {}

@Component({
  selector: 'lab-operator-values',
  template: `
    <p id="typeof">{{ typeof n }}</p>
    <p id="literal">{{ \`n=\${n}\` }}</p>
    <p id="power">{{ 2 ** 3 }}</p>
    <p id="in">{{ 'a' in record }}</p>
    <p id="void">[{{ void 0 }}]</p>
    <p id="tagged">{{ tag\`raw text\` }}</p>
    <p id="regex">{{ /\\d+/.test('a1') }}</p>
    <p id="instanceof">{{ stamp instanceof Stamp }}</p>
    <p id="arrow">{{ items.filter(i => i > 1).length }}</p>
    <p id="coalesce">{{ missing ?? 'fallback' }}</p>
    <p id="spread">{{ [...items, 4].length }}</p>
  `,
})
class OperatorValues {
  protected readonly n = 1;
  protected readonly record = { a: 1 };
  protected readonly items = [1, 2, 3];
  protected readonly missing: string | undefined = undefined;
  protected readonly Stamp = Stamp;
  protected readonly stamp = new Stamp();
  protected readonly tag = (strings: TemplateStringsArray) => strings.raw[0];
}

@Component({
  selector: 'lab-power-values',
  template: `
    <p id="chain">{{ 2 ** 3 ** 2 }}</p>
    <p id="grouped">{{ (2 ** 3) ** 2 }}</p>
  `,
})
class PowerValues {}

// A template variable shadows a member of the same name; this. always reads the member.
@Component({
  selector: 'lab-shadow-values',
  template: `
    @let n = 5;
    <p id="shadow">{{ n }}|{{ this.n }}|{{ this.in }}</p>
  `,
})
class ShadowValues {
  protected readonly n = 1;
  protected readonly in = 'member in';
}

function render<T>(type: new () => T) {
  const fixture = TestBed.createComponent(type);
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

function texts(root: HTMLElement): Record<string, string> {
  return Object.fromEntries(
    Array.from(root.querySelectorAll('p[id]')).map((p) => [p.id, p.textContent ?? '']),
  );
}

describe('Section 2: interpolation and template expressions', () => {
  it('Section 2: interpolation converts null and undefined to empty text and objects through toString', () => {
    const root = render(InterpolationValues);

    expect(texts(root)).toEqual({
      nothing: '[]',
      missing: '[]',
      zero: '[0]',
      no: '[false]',
      list: '[1,2,3]',
      plain: '[[object Object]]',
      custom: '[custom text]',
      attr: '',
    });
    expect(root.querySelector<HTMLElement>('#attr')?.title).toBe('a--b');
  });

  it('Section 2: the v19 to v21 operators evaluate in a template', () => {
    const root = render(OperatorValues);

    expect(texts(root)).toEqual({
      typeof: 'number',
      literal: 'n=1',
      power: '8',
      in: 'true',
      void: '[]',
      tagged: 'raw text',
      regex: 'true',
      instanceof: 'true',
      arrow: '2',
      coalesce: 'fallback',
      spread: '4',
    });
  });

  it('Section 2: exponentiation is right associative', () => {
    const root = render(PowerValues);

    expect(texts(root)).toEqual({ chain: '512', grouped: '64' });
  });

  it('Section 2: a template variable shadows a member and this. reads the member', () => {
    const root = render(ShadowValues);

    expect(texts(root)).toEqual({ shadow: '5|1|member in' });
  });
});
