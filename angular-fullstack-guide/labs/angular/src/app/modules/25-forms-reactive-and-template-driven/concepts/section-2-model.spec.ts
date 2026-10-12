import { FormArray, FormControl, FormGroup, FormRecord, Validators } from '@angular/forms';
import { labM25LegacyInitialValueIsDefault, labM25NonNullableControl } from '../legacy/legacy-apis';

function pair(): FormGroup<{ a: FormControl<string | null>; b: FormControl<string | null> }> {
  return new FormGroup({ a: new FormControl('x'), b: new FormControl('y') });
}

function messageOf(action: () => void): string {
  try {
    action();
  } catch (error) {
    return (error as Error).message;
  }
  return 'no error';
}

describe('Section 2: the reactive model', () => {
  it('Section 2: setValue requires every key and rejects unknown keys', () => {
    const group = pair();
    expect(messageOf(() => group.setValue({ a: '1' } as never))).toContain('NG01002');
    expect(messageOf(() => group.setValue({ a: '1', b: '2', c: '3' } as never))).toContain('NG01001');
    group.setValue({ a: '1', b: '2' });
    expect(group.value).toEqual({ a: '1', b: '2' });
  });

  it('Section 2: patchValue ignores unknown keys', () => {
    const group = pair();
    group.patchValue({ a: 'p', c: 'q' } as never);
    expect(group.value).toEqual({ a: 'p', b: 'y' });
  });

  it("Section 2: a setValue that throws on an extra key leaves the group's value stale", () => {
    const group = pair();
    expect(messageOf(() => group.setValue({ a: '1', b: '2', c: '3' } as never))).toContain('NG01001');
    expect(group.get('a')?.value).toBe('1');
    expect(group.get('b')?.value).toBe('2');
    expect(group.value).toEqual({ a: 'x', b: 'y' });
    expect(group.getRawValue()).toEqual({ a: '1', b: '2' });
  });

  it("Section 2: a child change recomputes the parent's value and keeps untouched siblings' objects", () => {
    const city = new FormControl('Lima');
    const root = new FormGroup({
      address: new FormGroup({ city }),
      profile: new FormGroup({ name: new FormControl('Ann') }),
    });
    const before = root.value;
    city.setValue('Quito');
    expect(root.value).not.toBe(before);
    expect(before.address).toEqual({ city: 'Lima' });
    expect(root.value.address).toEqual({ city: 'Quito' });
    expect(root.value.profile).toBe(before.profile);
  });

  it('Section 2: reset returns null, or the initial value for a non-nullable control', () => {
    const nullable = new FormControl('a');
    nullable.setValue('b');
    nullable.reset();
    expect(nullable.value).toBeNull();
    const nonNullable = new FormControl('a', { nonNullable: true });
    nonNullable.setValue('b');
    nonNullable.reset();
    expect(nonNullable.value).toBe('a');
  });

  it("Section 2: a disabled control leaves the group's value", () => {
    const group = new FormGroup({ a: new FormControl('A'), b: new FormControl({ value: 'B', disabled: true }) });
    expect(group.value).toEqual({ a: 'A' });
    expect(group.getRawValue()).toEqual({ a: 'A', b: 'B' });
    expect(group.status).toBe('VALID');
    group.controls.b.enable();
    expect(group.value).toEqual({ a: 'A', b: 'B' });
  });

  it("Section 2: a disabled control is skipped by validators and by its parent's status", () => {
    const name = new FormControl('', { validators: Validators.required });
    const group = new FormGroup({ name, age: new FormControl(3) });
    expect(group.status).toBe('INVALID');
    name.disable();
    expect(name.status).toBe('DISABLED');
    expect(name.errors).toBeNull();
    expect(group.status).toBe('VALID');
  });

  it('Section 2: a fully disabled group is neither valid nor invalid', () => {
    const group = new FormGroup({ a: new FormControl('A'), b: new FormControl({ value: 'B', disabled: true }) });
    group.disable();
    expect(group.status).toBe('DISABLED');
    expect(group.valid).toBe(false);
    expect(group.invalid).toBe(false);
    expect(group.value).toEqual({ a: 'A', b: 'B' });
  });

  it("Section 2: a group whose controls are all disabled leaves its parent's value too", () => {
    const inner = new FormGroup({ x: new FormControl('X') });
    const root = new FormGroup({ inner, name: new FormControl('Ann') });
    inner.controls.x.disable();
    expect(inner.status).toBe('DISABLED');
    expect(root.value).toEqual({ name: 'Ann' });
    expect(root.getRawValue()).toEqual({ inner: { x: 'X' }, name: 'Ann' });
  });

  it('Section 2: a FormRecord is a FormGroup with dynamic keys, and get() reads paths and indexes', () => {
    const record = new FormRecord<FormControl<boolean | null>>({});
    record.addControl('news', new FormControl(true));
    record.addControl('offers', new FormControl(false));
    expect(record instanceof FormGroup).toBe(true);
    expect(record.value).toEqual({ news: true, offers: false });
    const form = new FormGroup({
      user: new FormGroup({ name: new FormControl('Ann') }),
      items: new FormArray([new FormControl('first')]),
    });
    expect(form.get('user.name')?.value).toBe('Ann');
    expect(form.get(['items', 0])?.value).toBe('first');
    expect(form.get('user.missing')).toBeNull();
  });

  it('Section 2: the legacy initialValueIsDefault option behaves like nonNullable on reset', () => {
    const legacy = labM25LegacyInitialValueIsDefault();
    const migrated = labM25NonNullableControl();
    for (const control of [legacy, migrated]) {
      control.setValue('changed');
      control.reset();
      expect(control.value).toBe('start');
    }
  });
});
