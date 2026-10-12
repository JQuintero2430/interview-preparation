import { Component, InputSignal, computed, forwardRef, input, linkedSignal, model, resource, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  applyWhen,
  disabled,
  email,
  form,
  FormField,
  hidden,
  min,
  minLength,
  readonly,
  required,
  schema,
  submit,
  validate,
  validateAsync,
  validateStandardSchema,
  validateTree,
} from '@angular/forms/signals';
import type { FormCheckboxControl, FormValueControl } from '@angular/forms/signals';

interface LabM26Pair {
  pw: string;
  confirm: string;
  company: boolean;
  vat: string;
}

interface LabM26User {
  name: string;
}

const lines: string[] = [];
const log = (value: unknown): void => {
  lines.push(String(value));
};

@Component({
  selector: 'lab-m26-q05-copy',
  imports: [FormField],
  template: '<input [formField]="f.name" /><output>{{ f.name().value() }}</output>',
})
class LabM26Q05Copy {
  readonly user = input<LabM26User>({ name: '' });
  protected readonly draft = signal(this.user());
  protected readonly f = form(this.draft);
}

@Component({
  selector: 'lab-m26-q05-linked',
  imports: [FormField],
  template: '<input [formField]="f.name" /><output>{{ f.name().value() }}</output>',
})
class LabM26Q05Linked {
  readonly user = input<LabM26User>({ name: '' });
  protected readonly draft = linkedSignal(() => this.user());
  protected readonly f = form(this.draft);
}

@Component({
  selector: 'lab-m26-q05-host',
  imports: [LabM26Q05Copy, LabM26Q05Linked],
  template: '<lab-m26-q05-copy [user]="user()" /><lab-m26-q05-linked [user]="user()" />',
})
class LabM26Q05Host {
  readonly user = signal<LabM26User>({ name: 'Ann' });
}

function compileOnly(user: InputSignal<LabM26User>): void {
  // @ts-expect-error a form needs a WritableSignal, and an input() is read-only (TS2345, recorded by compiling without this directive on 2026-10-11)
  form(user);
}

@Component({
  selector: 'lab-m26-q06-host',
  imports: [FormField],
  template: `
    <input id="n" [formField]="f.name" />
    <input id="a" type="number" [formField]="f.age" />
  `,
})
class LabM26Q06Host {
  readonly model = signal<{ name: string; age: number | null }>({ name: '', age: 20 });
  protected readonly f = form(this.model, (p) => {
    required(p.name);
    min(p.age, 18);
  });
}

@Component({
  selector: 'lab-m26-q06-text-model',
  imports: [FormField],
  template: '<input type="number" [formField]="f.age" />',
})
class LabM26Q06TextModel {
  readonly model = signal({ age: '' });
  protected readonly f = form(this.model);
}

function compileOnlyBoolean(): void {
  form(signal({ n: 1 }), (p) => {
    // @ts-expect-error a rule returns error objects or nothing, not a boolean (TS2322, "Type 'boolean' is not assignable to type 'ValidationResult<WithoutFieldTree>'", abridged, recorded by compiling without this directive on 2026-10-11)
    validate(p.n, () => true);
  });
}

function compileOnlyMinOnString(): void {
  form(signal({ s: '5', n: 5 as number | null }), (p) => {
    // @ts-expect-error min takes a number or null field (TS2345, "Argument of type 'SchemaPath<string, 1, Child>' is not assignable to parameter of type 'SchemaPath<number | null, 1, Child>'", abridged, recorded by compiling without this directive on 2026-10-11)
    min(p.s, 3);
    min(p.n, 3);
  });
}

@Component({
  selector: 'lab-m26-q16-host',
  imports: [FormField],
  template: `
    @if (show()) {
      <input id="vat" [formField]="f.vat" />
    }
  `,
})
class LabM26Q16Host {
  readonly show = signal(false);
  readonly model = signal({ vat: '' });
  readonly f = form(this.model, (p) => {
    required(p.vat);
  });
}

@Component({
  selector: 'lab-m26-q25-accessor',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => LabM26Q25Accessor), multi: true }],
  template: '',
})
class LabM26Q25Accessor implements ControlValueAccessor {
  readonly calls: string[] = [];
  change: (value: string) => void = () => undefined;

  writeValue(value: string): void {
    this.calls.push(`writeValue('${value}')`);
  }
  registerOnChange(fn: (value: string) => void): void {
    this.calls.push('registerOnChange');
    this.change = fn;
  }
  registerOnTouched(): void {
    this.calls.push('registerOnTouched');
  }
  setDisabledState(isDisabled: boolean): void {
    this.calls.push(`setDisabledState(${isDisabled})`);
  }
}

@Component({
  selector: 'lab-m26-q25-host',
  imports: [FormField, LabM26Q25Accessor],
  template: '<lab-m26-q25-accessor [formField]="f.x" />',
})
class LabM26Q25Host {
  readonly model = signal({ x: 'a' });
  readonly f = form(this.model);
}

@Component({ selector: 'lab-m26-q26-both', template: '' })
class LabM26Q26Both implements FormValueControl<number> {
  readonly value = model(0);
  // @ts-expect-error a value control must not define checked (TS2416, "Type 'ModelSignal<boolean>' is not assignable to type 'undefined'", abridged, recorded by compiling without this directive on 2026-10-11)
  readonly checked = model(false);
}

@Component({ selector: 'lab-m26-q26-fixed', template: '' })
class LabM26Q26Fixed implements FormCheckboxControl {
  readonly checked = model(false);
  readonly choice = input(0);
}

function usernameForm(log: string[], user: string, aborted: boolean[] = [], debounceMs?: number) {
  const model = signal({ user });
  const f = form(model, (p) => {
    validateAsync(p.user, {
      params: ({ value }) => value(),
      debounce: debounceMs,
      factory: (params) =>
        resource({
          params,
          loader: async ({ params: name, abortSignal }) => {
            log.push(name);
            await new Promise<void>((done) => setTimeout(done, 100));
            aborted.push(abortSignal.aborted);
            return name === 'ann';
          },
        }),
      onSuccess: (taken) => (taken ? { kind: 'taken' } : undefined),
      onError: () => ({ kind: 'err' }),
    });
  });
  return { model, f };
}

describe('Q26 outputs', () => {
  it('Q26.03 a write through a field, a set on the model and f().value() === model()', () => {
    lines.length = 0;
    TestBed.runInInjectionContext(() => {
      const m = signal({ name: 'Ann', age: 30 });
      const f = form(m);
      f.name().value.set('Bob');
      log(JSON.stringify(m()));
      m.set({ name: 'Cy', age: 1 });
      log(f.name().value());
      log(f().value() === m());
    });
    expect(lines).toEqual(['{"name":"Bob","age":30}', 'Cy', 'true']);
  });

  it('Q26.03 a field write replaces the model object and a computed over the model sees it', () => {
    TestBed.runInInjectionContext(() => {
      const m = signal({ name: 'Ann', age: 30 });
      const upper = computed(() => m().name.toUpperCase());
      const f = form(m);
      const before = m();
      expect(upper()).toBe('ANN');
      f.name().value.set('Bob');
      expect(m()).not.toBe(before);
      expect(before).toEqual({ name: 'Ann', age: 30 });
      expect(upper()).toBe('BOB');
    });
  });

  it('Q26.05 form() does not accept an input()', () => {
    expect(typeof compileOnly).toBe('function');
  });

  it('Q26.05 a signal copied from an input keeps the default, a linkedSignal follows each user', async () => {
    const fixture = TestBed.createComponent(LabM26Q05Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const outputs = (): string[] =>
      Array.from(fixture.nativeElement.querySelectorAll('output'), (o) => (o as HTMLElement).textContent ?? '');
    const inputs = (): HTMLInputElement[] => Array.from(fixture.nativeElement.querySelectorAll('input'));
    expect(outputs()).toEqual(['', 'Ann']);
    inputs()[1].value = 'Ann edited';
    inputs()[1].dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(outputs()).toEqual(['', 'Ann edited']);
    fixture.componentInstance.user.set({ name: 'Bea' });
    await fixture.whenStable();
    expect(outputs()).toEqual(['', 'Bea']);
    expect(inputs().map((i) => i.value)).toEqual(['', 'Bea']);
  });

  it('Q26.06 a text input with required and a number input with min(18): attributes, values and classes', async () => {
    const fixture = TestBed.createComponent(LabM26Q06Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const text = fixture.nativeElement.querySelector('#n') as HTMLInputElement;
    const age = fixture.nativeElement.querySelector('#a') as HTMLInputElement;
    lines.length = 0;
    log(text.getAttribute('required'));
    log(age.getAttribute('min'));
    log(text.hasAttribute('aria-invalid'));
    log(JSON.stringify(text.className));
    age.value = '42';
    age.dispatchEvent(new Event('input'));
    log(`${typeof fixture.componentInstance.model().age}:${fixture.componentInstance.model().age}`);
    age.value = '';
    age.dispatchEvent(new Event('input'));
    log(fixture.componentInstance.model().age);
    expect(lines).toEqual(['', '18', 'false', '""', 'number:42', 'null']);
    expect(text.required).toBe(true);
  });

  it('Q26.06 a number input over a string model receives the string', async () => {
    const fixture = TestBed.createComponent(LabM26Q06TextModel);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const age = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    age.value = '42';
    age.dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.model().age).toBe('42');
  });

  it('Q26.09 required, min(18), email and minLength(3, { message }): field errors, root errors, summary and valid', () => {
    TestBed.runInInjectionContext(() => {
      const f = form(signal({ name: '', age: 10, mail: 'x' }), (p) => {
        required(p.name);
        min(p.age, 18);
        email(p.mail);
        minLength(p.name, 3, { message: 'short' });
      });
      lines.length = 0;
      log(f.name().errors().map((e) => e.kind).join(','));
      log(f.age().errors().map((e) => e.kind).join(','));
      log(f.mail().errors().map((e) => e.kind).join(','));
      log(f().errors().length);
      log(f().errorSummary().map((e) => e.kind).join(','));
      log(f().valid());
      expect(lines).toEqual(['required', 'min', 'email', '0', 'required,min,email', 'false']);
      expect(f.age().errors()).toMatchObject([{ kind: 'min', min: 18 }]);
      expect(f.name().required()).toBe(true);
      expect(f.age().min?.()).toBe(18);
      f.name().value.set('ab');
      expect(f.name().errors()).toMatchObject([{ kind: 'minLength', minLength: 3, message: 'short' }]);
    });
  });

  it('Q26.10 validate takes a function returning no error, one error or a list; a boolean is rejected at compile time', () => {
    TestBed.runInInjectionContext(() => {
      const f = form(signal({ n: 5 }), (p) => {
        validate(p.n, ({ value }) => (value() > 3 ? [{ kind: 'big' }, { kind: 'odd', message: 'odd' }] : undefined));
      });
      expect(f.n().errors().map((e) => e.kind)).toEqual(['big', 'odd']);
      expect(f.n().errors()[0].fieldTree).toBe(f.n);
      f.n().value.set(2);
      expect(f.n().errors()).toEqual([]);
    });
    expect(typeof compileOnlyBoolean).toBe('function');
  });

  it('Q26.11 min rejects a string field at compile time and reports on a number | null field', () => {
    TestBed.runInInjectionContext(() => {
      const f = form(signal({ n: 2 as number | null }), (p) => {
        min(p.n, 3);
      });
      expect(f.n().errors()).toMatchObject([{ kind: 'min', min: 3 }]);
      f.n().value.set(null);
      expect(f.n().errors()).toEqual([]);
    });
    expect(typeof compileOnlyMinOnString).toBe('function');
  });

  it('Q26.12 a schema rule and a Standard Schema validator both report on the same field', () => {
    TestBed.runInInjectionContext(() => {
      const standard = {
        '~standard': {
          version: 1 as const,
          vendor: 'lab',
          validate: (value: unknown) => {
            const v = value as { name: string };
            return v.name.length < 3 ? { issues: [{ message: 'too short', path: ['name'] }] } : { value };
          },
        },
      };
      const f = form(signal({ name: '' }), (p) => {
        required(p.name);
        validateStandardSchema(p, standard);
      });
      expect(f.name().errors().map((e) => e.kind)).toEqual(['required', 'standardSchema']);
      f.name().value.set('Ada');
      expect(f.name().errors()).toEqual([]);
    });
  });

  it('Q26.13 validate on confirm, validateTree targeting pw and applyWhen for the VAT number: where each error lands', () => {
    TestBed.runInInjectionContext(() => {
      const model = signal<LabM26Pair>({ pw: 'abc', confirm: 'abd', company: false, vat: '' });
      const f = form(model, (p) => {
        validate(p.confirm, ({ value, valueOf }) => (value() === valueOf(p.pw) ? undefined : { kind: 'mismatch' }));
        validateTree(p, ({ value, fieldTree }) =>
          value().pw === value().confirm ? undefined : { kind: 'treeMismatch', fieldTree: fieldTree.pw },
        );
        applyWhen(p, ({ valueOf }) => valueOf(p.company), schema<LabM26Pair>((q) => required(q.vat)));
      });
      lines.length = 0;
      log(f.confirm().errors().map((e) => e.kind).join(','));
      log(f.pw().errors().map((e) => e.kind).join(','));
      log(f().errors().length);
      log(f.vat().errors().length);
      log(f.vat().required());
      model.update((m) => ({ ...m, company: true }));
      log(f.vat().errors().map((e) => e.kind).join(','));
      log(f.vat().required());
      expect(lines).toEqual(['mismatch', 'treeMismatch', '0', '0', 'false', 'required', 'true']);
    });
  });

  it('Q26.14 a required field disabled, one hidden and one readonly report no errors until the condition turns false', () => {
    TestBed.runInInjectionContext(() => {
      const model = signal({ a: '', b: '', c: '', on: false });
      const f = form(model, (p) => {
        required(p.a);
        required(p.b);
        required(p.c);
        disabled(p.a, { when: ({ valueOf }) => !valueOf(p.on) });
        hidden(p.b, { when: ({ valueOf }) => !valueOf(p.on) });
        readonly(p.c, { when: ({ valueOf }) => !valueOf(p.on) });
      });
      lines.length = 0;
      log(f.a().errors().length);
      log(f.a().valid());
      log(f.b().errors().length);
      log(f.b().valid());
      log(f.c().errors().length);
      log(f.c().valid());
      log(f().valid());
      log(f.a().disabledReasons().length);
      expect(lines).toEqual(['0', 'true', '0', 'true', '0', 'true', 'true', '1']);
      model.update((m) => ({ ...m, on: true }));
      lines.length = 0;
      log(f.a().disabled());
      log(f.b().hidden());
      log(f.c().readonly());
      log(f().valid());
      expect(lines).toEqual(['false', 'false', 'false', 'false']);
    });
  });

  it('Q26.16 a field left out by @if keeps its error and blocks the root, the hidden rule clears both', async () => {
    const fixture = TestBed.createComponent(LabM26Q16Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const f = fixture.componentInstance.f;
    lines.length = 0;
    log(fixture.nativeElement.querySelector('#vat') === null);
    log(f.vat().hidden());
    log(f.vat().errors().map((e) => e.kind).join(','));
    log(f().valid());
    expect(lines).toEqual(['true', 'false', 'required', 'false']);
    TestBed.runInInjectionContext(() => {
      const model = signal({ vat: '', x: '' });
      const g = form(model, (p) => {
        required(p.vat);
        hidden(p.vat, { when: () => true });
        disabled(p.x, () => true);
      });
      lines.length = 0;
      log(g.vat().errors().length);
      log(g().valid());
      log(g.x().disabled());
      expect(lines).toEqual(['0', 'true', 'true']);
    });
  });

  it('Q26.17 a validateAsync username check: pending while loading, one loader call, then a taken error', async () => {
    vi.useFakeTimers();
    try {
      await TestBed.runInInjectionContext(async () => {
        const calls: string[] = [];
        const { f } = usernameForm(calls, 'ann');
        TestBed.tick();
        lines.length = 0;
        log(`pending ${f.user().pending()}, valid ${f.user().valid()}, invalid ${f.user().invalid()}`);
        await vi.advanceTimersByTimeAsync(150);
        TestBed.tick();
        log(`calls ${calls.join(',')}`);
        log(`pending ${f.user().pending()}`);
        log(`errors ${f.user().errors().map((e) => e.kind).join(',')}`);
        log(`valid ${f.user().valid()}`);
        expect(lines).toEqual([
          'pending true, valid false, invalid false',
          'calls ann',
          'pending false',
          'errors taken',
          'valid false',
        ]);
      });
    } finally {
      vi.useRealTimers();
    }
  });

  it('Q26.17 a value change while loading runs a second load and the first one finishes with its signal aborted', async () => {
    vi.useFakeTimers();
    try {
      await TestBed.runInInjectionContext(async () => {
        const calls: string[] = [];
        const aborted: boolean[] = [];
        const { model, f } = usernameForm(calls, 'ann', aborted);
        TestBed.tick();
        await vi.advanceTimersByTimeAsync(50);
        model.set({ user: 'bob' });
        TestBed.tick();
        await vi.advanceTimersByTimeAsync(200);
        TestBed.tick();
        expect(calls).toEqual(['ann', 'bob']);
        expect(aborted).toEqual([true, false]);
        expect(f.user().errors()).toEqual([]);
      });
    } finally {
      vi.useRealTimers();
    }
  });

  it('Q26.19 touching a field does not flush the debounce option of validateAsync, the loader waits for its delay', async () => {
    vi.useFakeTimers();
    try {
      await TestBed.runInInjectionContext(async () => {
        const calls: string[] = [];
        const { model, f } = usernameForm(calls, 'bob', [], 50);
        await vi.advanceTimersByTimeAsync(200);
        TestBed.tick();
        expect(calls).toEqual(['bob']);
        model.set({ user: 'cat' });
        f.user().markAsTouched();
        TestBed.tick();
        await vi.advanceTimersByTimeAsync(30);
        expect(f.user().touched()).toBe(true);
        expect(calls).toEqual(['bob']);
        await vi.advanceTimersByTimeAsync(40);
        expect(calls).toEqual(['bob', 'cat']);
      });
    } finally {
      vi.useRealTimers();
    }
  });

  it('Q26.21 an invalid submit, a valid one that returns a server error, then an edit: results, touched, submitting and errors', async () => {
    await TestBed.runInInjectionContext(async () => {
      const model = signal({ email: '' });
      const f = form(model, (p) => {
        required(p.email);
      });
      const calls: string[] = [];
      lines.length = 0;
      log(await submit(f, async () => {
        calls.push('invalid');
        return undefined;
      }));
      log(`calls ${calls.length}, touched ${f.email().touched()}`);
      model.set({ email: 'a@b' });
      let insideAction = false;
      log(await submit(f, async (field) => {
        insideAction = f().submitting();
        return { kind: 'server', message: 'taken', fieldTree: field.email };
      }));
      log(`submitting inside ${insideAction}, after ${f().submitting()}`);
      log(`errors ${f.email().errors().map((e) => `${e.kind}:${e.message}`).join(',')}`);
      model.set({ email: 'c@d' });
      log(`errors after edit ${f.email().errors().length}`);
      expect(lines).toEqual([
        'false',
        'calls 0, touched true',
        'false',
        'submitting inside true, after false',
        'errors server:taken',
        'errors after edit 0',
      ]);
    });
  });

  it('Q26.25 a ControlValueAccessor bound with formField: call order, a change from the accessor and a model write', async () => {
    const fixture = TestBed.createComponent(LabM26Q25Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const accessor = fixture.debugElement.children[0].componentInstance as LabM26Q25Accessor;
    const host = fixture.componentInstance;
    lines.length = 0;
    log(accessor.calls.join(', '));
    accessor.change('typed');
    await fixture.whenStable();
    log(`model ${host.model().x}, dirty ${host.f.x().dirty()}`);
    host.model.set({ x: 'prog' });
    await fixture.whenStable();
    log(accessor.calls.at(-1));
    expect(lines).toEqual([
      "registerOnChange, registerOnTouched, writeValue('a'), setDisabledState(false)",
      'model typed, dirty true',
      "writeValue('prog')",
    ]);
  });

  it('Q26.26 a control that declares both value and checked fails to compile', () => {
    expect([LabM26Q26Both, LabM26Q26Fixed]).toHaveLength(2);
  });
});
