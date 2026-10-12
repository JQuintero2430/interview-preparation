// labs/angular/src/app/modules/13-components-and-templates/outputs/q13-outputs.spec.ts
// Each test reproduces one "Output" question from Module 13 and asserts the exact text the answer
// claims. If Angular changes behaviour, this file fails first.
import { Component, signal, ViewEncapsulation } from '@angular/core';
import { TestBed } from '@angular/core/testing';

describe('Module 13 output questions', () => {
  it('Q13.05 interpolation renders null and undefined as empty text and the rest through toString', () => {
    @Component({
      selector: 'lab-q05',
      template: `<p>[{{ nothing }}][{{ missing }}][{{ zero }}][{{ no }}][{{ list }}][{{ plain }}]</p>`,
    })
    class Q05 {
      protected readonly nothing = null;
      protected readonly missing = undefined;
      protected readonly zero = 0;
      protected readonly no = false;
      protected readonly list = [1, [2, 3]];
      protected readonly plain = { a: 1 };
    }

    const fixture = TestBed.createComponent(Q05);
    fixture.detectChanges();

    const printed = (fixture.nativeElement as HTMLElement).querySelector('p')?.textContent;
    expect(printed).toBe('[][][0][false][1,2,3][[object Object]]');
  });

  it('Q13.06 the v19 to v20 operators evaluate in a template and ** is right associative', () => {
    @Component({
      selector: 'lab-q06',
      template: "<p>[{{ 2 ** 3 ** 2 }}][{{ 'a' in o }}][{{ typeof n }}][{{ void 0 }}][{{ `n=${n}` }}]</p>",
    })
    class Q06 {
      protected readonly o = { a: 1 };
      protected readonly n = 1;
    }

    const fixture = TestBed.createComponent(Q06);
    fixture.detectChanges();

    const printed = (fixture.nativeElement as HTMLElement).querySelector('p')?.textContent;
    expect(printed).toBe('[512][true][number][][n=1]');
  });

  it('Q13.07 optional chaining on a null receiver is undefined and the migration aid keeps null', () => {
    interface User {
      readonly name: string;
    }

    @Component({
      selector: 'lab-q07',
      template: `<p>[{{ u()?.name === undefined }}][{{ u()?.name === null }}][{{ $safeNavigationMigration(u()?.name) === null }}]</p>`,
    })
    class Q07 {
      protected readonly u = signal<User | null>(null);
    }

    const fixture = TestBed.createComponent(Q07);
    fixture.detectChanges();

    const printed = (fixture.nativeElement as HTMLElement).querySelector('p')?.textContent;
    expect(printed).toBe('[true][false][true]');
  });

  it('Q13.11 a property binding writes the text undefined or null, an attribute binding removes the attribute', async () => {
    @Component({
      selector: 'lab-q11',
      template: `
        <p id="prop" [title]="t()"></p>
        <p id="attr" [attr.title]="t()"></p>
      `,
    })
    class Q11 {
      readonly t = signal<string | null | undefined>(undefined);
    }

    const fixture = TestBed.createComponent(Q11);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const seen = async (value: string | null | undefined) => {
      fixture.componentInstance.t.set(value);
      await fixture.whenStable();
      return {
        prop: root.querySelector('#prop')?.getAttribute('title'),
        attr: root.querySelector('#attr')?.getAttribute('title'),
      };
    };

    expect(await seen(undefined)).toEqual({ prop: 'undefined', attr: null });
    expect(await seen(null)).toEqual({ prop: 'null', attr: null });
    expect(await seen('')).toEqual({ prop: '', attr: '' });
  });

  it('Q13.13 a class object and a style object mutated in place stay unchanged until a new object arrives', async () => {
    @Component({
      selector: 'lab-q13',
      template: `<p [class]="flags()" [style]="st()">{{ tick() }}</p>`,
    })
    class Q13 {
      readonly flags = signal<Record<string, boolean>>({ active: false });
      readonly st = signal<Record<string, string>>({ color: 'red' });
      readonly tick = signal(0);
    }

    const fixture = TestBed.createComponent(Q13);
    fixture.detectChanges();
    const target = (fixture.nativeElement as HTMLElement).querySelector('p') as HTMLElement;
    const view = () => `class="${target.className}" style="${target.getAttribute('style')}"`;
    const bump = async () => {
      fixture.componentInstance.tick.update((n) => n + 1);
      await fixture.whenStable();
    };
    const steps: string[] = [view()];

    fixture.componentInstance.flags()['active'] = true;
    fixture.componentInstance.st()['color'] = 'blue';
    await bump();
    steps.push(view());

    fixture.componentInstance.flags.update((flags) => ({ ...flags }));
    fixture.componentInstance.st.update((st) => ({ ...st }));
    await bump();
    steps.push(view());

    expect(steps).toEqual([
      'class="" style="color: red;"',
      'class="" style="color: red;"',
      'class="active" style="color: blue;"',
    ]);
  });

  it('Q13.15 key filters run enter only for plain Enter, shift.enter for Shift+Enter and code.keya for the A key', () => {
    @Component({
      selector: 'lab-q15',
      template: `
        <input
          (keydown.enter)="ran.push('enter')"
          (keydown.shift.enter)="ran.push('shiftEnter')"
          (keydown.code.keya)="ran.push('codeA')"
        />
      `,
    })
    class Q15 {
      readonly ran: string[] = [];
    }

    const fixture = TestBed.createComponent(Q15);
    fixture.detectChanges();
    const field = (fixture.nativeElement as HTMLElement).querySelector('input') as HTMLInputElement;
    const press = (init: KeyboardEventInit) =>
      field.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init }));

    press({ key: 'Enter', code: 'Enter' });
    press({ key: 'Enter', code: 'Enter', shiftKey: true });
    press({ key: 'a', code: 'KeyA' });

    expect(fixture.componentInstance.ran).toEqual(['enter', 'shiftEnter', 'codeA']);
  });

  it('Q13.22 a parent and a host binding on one element: the static role of the parent wins, the host wins id, title and data-k, the parent wins class and style', () => {
    @Component({
      selector: 'lab-q22-child',
      template: ``,
      host: {
        role: 'presentation',
        '[id]': '"host-id"',
        '[class.ok]': 'true',
        '[style.color]': '"red"',
        '[title]': '"host-title"',
        '[attr.data-k]': '"host"',
      },
    })
    class Q22Child {}

    @Component({
      selector: 'lab-q22',
      imports: [Q22Child],
      template: `
        <lab-q22-child
          role="group"
          [id]="'parent-id'"
          [class.ok]="false"
          [style.color]="'blue'"
          [title]="'parent-title'"
          [attr.data-k]="'parent'"
        />
      `,
    })
    class Q22 {}

    const fixture = TestBed.createComponent(Q22);
    fixture.detectChanges();

    const host = (fixture.nativeElement as HTMLElement).querySelector('lab-q22-child') as HTMLElement;
    const printed = [
      `role="${host.getAttribute('role')}"`,
      `id="${host.getAttribute('id')}"`,
      `title="${host.getAttribute('title')}"`,
      `data-k="${host.getAttribute('data-k')}"`,
      `ok=${host.classList.contains('ok')}`,
      `style="${host.getAttribute('style')}"`,
    ].join(' ');
    expect(printed).toBe(
      'role="group" id="host-id" title="host-title" data-k="host" ok=false style="color: blue;"',
    );
  });

  it('Q13.28 a ViewEncapsulation.None h2 rule styles the unstyled sibling, and stops when the component is destroyed', () => {
    @Component({
      selector: 'lab-q28-a',
      template: `<h2>A</h2>`,
      encapsulation: ViewEncapsulation.None,
      styles: `
        h2 {
          color: red;
        }
      `,
    })
    class Q28A {}

    @Component({
      selector: 'lab-q28-b',
      template: `<h2>B</h2>`,
      styles: `
        h2 {
          color: green;
        }
      `,
    })
    class Q28B {}

    @Component({ selector: 'lab-q28-c', template: `<h2>C</h2>` })
    class Q28C {}

    @Component({
      selector: 'lab-q28-host',
      imports: [Q28B, Q28C],
      template: `<lab-q28-b /><lab-q28-c />`,
    })
    class Q28Host {}

    const colorOf = (root: HTMLElement) => getComputedStyle(root.querySelector('h2') as HTMLElement).color;

    // B and C first, so that B's style precedes A's in the head: B can only win by specificity.
    const rest = TestBed.createComponent(Q28Host);
    rest.detectChanges();
    const a = TestBed.createComponent(Q28A);
    a.detectChanges();
    const restRoot = rest.nativeElement as HTMLElement;
    const c = restRoot.querySelector('lab-q28-c') as HTMLElement;
    const b = restRoot.querySelector('lab-q28-b') as HTMLElement;

    const before = `A=${colorOf(a.nativeElement)} B=${colorOf(b)} C=${colorOf(c)}`;
    a.destroy();
    const after = `C=${colorOf(c)} B=${colorOf(b)}`;

    expect(before).toBe('A=rgb(255, 0, 0) B=rgb(0, 128, 0) C=rgb(255, 0, 0)');
    expect(after).toBe('C=rgb(0, 0, 0) B=rgb(0, 128, 0)');
  });
});
