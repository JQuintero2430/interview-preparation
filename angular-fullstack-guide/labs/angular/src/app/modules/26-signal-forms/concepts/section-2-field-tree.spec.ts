import { Injector, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { applyEach, email, form, min, required } from '@angular/forms/signals';

interface LabM26Nested {
  a: string;
  b: { c: string };
}

interface LabM26Row {
  n: string;
}

const nested = (): LabM26Nested => ({ a: 'x', b: { c: 'y' } });

describe('Section 2: the field tree', () => {
  it('Section 2: the field tree has one key per model property', () => {
    TestBed.runInInjectionContext(() => {
      const f = form(signal(nested()));
      expect(Object.keys(f)).toEqual(['a', 'b']);
      expect(Object.keys(f.b)).toEqual(['c']);
      expect(f.b.c().value()).toBe('y');
      expect(typeof f.a).toBe('function');
      // The field must be called first: without the call the property has no `value`.
      // @ts-expect-error TS2339 (recorded by compiling without this directive): a field is a function, not a state
      const wrongRead = () => f.a.value();
      expect(wrongRead).toThrow(TypeError);
    });
  });

  it('Section 2: a programmatic write does not mark the field dirty', () => {
    TestBed.runInInjectionContext(() => {
      const f = form(signal(nested()));
      f.b.c().value.set('z');
      expect(f.b.c().value()).toBe('z');
      expect(f().dirty()).toBe(false);
      expect(f.b.c().dirty()).toBe(false);
      f.b.c().markAsDirty();
      expect(f.b.c().dirty()).toBe(true);
    });
  });

  it('Section 2: markAsTouched on the root marks every descendant', () => {
    TestBed.runInInjectionContext(() => {
      const f = form(signal(nested()));
      f().markAsTouched();
      expect(f.a().touched()).toBe(true);
      expect(f.b.c().touched()).toBe(true);
    });
  });

  it('Section 2: markAsTouched with skipDescendants marks only the field itself', () => {
    TestBed.runInInjectionContext(() => {
      const f = form(signal(nested()));
      f().markAsTouched({ skipDescendants: true });
      expect(f().touched()).toBe(true);
      expect(f.a().touched()).toBe(false);
    });
  });

  it('Section 2: reset clears touched and dirty and keeps the model', () => {
    TestBed.runInInjectionContext(() => {
      const model = signal(nested());
      const f = form(model);
      f.b.c().value.set('z');
      f.b.c().markAsDirty();
      f().markAsTouched();
      expect(f().touched()).toBe(true);
      f().reset();
      expect(f().touched()).toBe(false);
      expect(f.b.c().dirty()).toBe(false);
      expect(f.a().touched()).toBe(false);
      expect(model()).toEqual({ a: 'x', b: { c: 'z' } });
    });
  });

  it('Section 2: reset with a value writes the model', () => {
    TestBed.runInInjectionContext(() => {
      const model = signal(nested());
      const f = form(model);
      f().reset({ a: 'r', b: { c: 'r' } });
      expect(model()).toEqual({ a: 'r', b: { c: 'r' } });
      expect(f.a().value()).toBe('r');
    });
  });

  it('Section 2: the root errors() is empty while errorSummary() lists the descendants', () => {
    TestBed.runInInjectionContext(() => {
      const f = form(signal({ name: '', age: 10, mail: 'x' }), (p) => {
        required(p.name);
        min(p.age, 18);
        email(p.mail);
      });
      expect(f().errors()).toEqual([]);
      expect(f().errorSummary().map((e) => e.kind)).toEqual(['required', 'min', 'email']);
      expect(f().valid()).toBe(false);
      expect(f.name().errors().map((e) => e.kind)).toEqual(['required']);
    });
  });

  it('Section 2: form outside an injection context throws NG0203', () => {
    expect(() => form(signal({ a: 1 }))).toThrow(/NG0203/);
  });

  it('Section 2: form with an injector option works outside an injection context', () => {
    const model = signal({ a: 1 });
    const f = form(model, { injector: TestBed.inject(Injector) });
    f.a().value.set(2);
    expect(model()).toEqual({ a: 2 });
  });

  it('Section 2: a field tree over an array exposes items by index', () => {
    TestBed.runInInjectionContext(() => {
      const model = signal<{ items: LabM26Row[] }>({ items: [{ n: 'a' }, { n: '' }] });
      const f = form(model, (p) => {
        applyEach(p.items, (row) => required(row.n));
      });
      expect(f.items.length).toBe(2);
      expect(f.items[0].n().value()).toBe('a');
      expect(f.items[1].n().errors().map((e) => e.kind)).toEqual(['required']);
      expect(f.items[1]().keyInParent()).toBe('1');
      model.update((m) => ({ items: [...m.items, { n: 'c' }] }));
      expect(f.items.length).toBe(3);
      f.items[2].n().value.set('d');
      expect(model().items[2].n).toBe('d');
      expect(Object.getOwnPropertySymbols(model().items[2])).toHaveLength(1);
    });
  });
});
