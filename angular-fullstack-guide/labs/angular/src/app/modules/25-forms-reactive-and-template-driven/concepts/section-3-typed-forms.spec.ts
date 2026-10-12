import { TestBed } from '@angular/core/testing';
import { FormBuilder, FormControl, FormGroup, FormRecord, NonNullableFormBuilder, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import {
  labM25GroupWithValidators,
  labM25LegacyGroupWithValidator,
  labM25LegacyUntypedProfile,
  labM25TypedProfile,
} from '../legacy/legacy-apis';

describe('Section 3: typed forms, FormBuilder and NonNullableFormBuilder', () => {
  it('Section 3: optional keys can be added and removed at run time', () => {
    const group = new FormGroup<{ name: FormControl<string>; nickname?: FormControl<string> }>({
      name: new FormControl('Ann', { nonNullable: true }),
    });
    group.addControl('nickname', new FormControl('Annie', { nonNullable: true }));
    expect(group.value).toEqual({ name: 'Ann', nickname: 'Annie' });
    group.removeControl('nickname');
    expect(group.value).toEqual({ name: 'Ann' });
    expect(group.contains('nickname')).toBe(false);
  });

  it('Section 3: a required key and an unknown key are rejected by the compiler, not at run time', () => {
    const group = new FormGroup({ name: new FormControl('Ann', { nonNullable: true }) });
    // @ts-expect-error TS2769: no overload accepts the key 'extra', which the group's type does not declare
    group.addControl('extra', new FormControl('x'));
    // @ts-expect-error TS2769: 'name' is a required key, so the group's type cannot lose it
    group.removeControl('name');
    // The calls above ran: the compiler stopped nothing at run time.
    expect(Object.keys(group.controls)).toEqual(['extra']);
  });

  it('Section 3: a FormRecord accepts keys known only at run time', () => {
    const record = new FormRecord<FormControl<boolean>>({});
    const keysFromServer = ['read', 'write'];
    for (const key of keysFromServer) {
      record.addControl(key, new FormControl(key === 'read', { nonNullable: true }));
    }
    expect(record.value).toEqual({ read: true, write: false });
    record.removeControl('read');
    expect(record.value).toEqual({ write: false });
  });

  it("Section 3: a FormRecord checks its control type at compile time and a FormRecord is a FormGroup", () => {
    const record = new FormRecord<FormControl<boolean | null>>({});
    // @ts-expect-error TS2345: a FormControl<string | null> is not a FormControl<boolean | null>
    record.addControl('note', new FormControl('str'));
    expect(record instanceof FormGroup).toBe(true);
    expect(record.contains('note')).toBe(true);
  });

  it('Section 3: FormBuilder.record builds a FormRecord from plain values', () => {
    const record = TestBed.inject(NonNullableFormBuilder).record({ a: 1, b: 2 });
    expect(record instanceof FormRecord).toBe(true);
    expect(record.value).toEqual({ a: 1, b: 2 });
  });

  it('Section 3: FormBuilder controls are nullable and the group value is Partial', () => {
    const group = TestBed.inject(FormBuilder).group({ n: 1 });
    // @ts-expect-error TS2322: number | null | undefined is not assignable to number
    const n: number = group.value.n;
    expect(n).toBe(1);
    const maybe: number | null | undefined = group.value.n;
    expect(maybe).toBe(1);
    group.reset();
    expect(group.value).toEqual({ n: null });
  });

  it('Section 3: NonNullableFormBuilder controls reset to their initial values', () => {
    for (const builder of [TestBed.inject(NonNullableFormBuilder), TestBed.inject(FormBuilder).nonNullable]) {
      const group = builder.group({ x: 'init' });
      group.setValue({ x: 'z' });
      group.reset();
      expect(group.value).toEqual({ x: 'init' });
      const typed: string = group.controls.x.value;
      expect(typed).toBe('init');
    }
  });

  it('Section 3: a control built explicitly inside a non-nullable builder stays nullable', () => {
    const group = TestBed.inject(NonNullableFormBuilder).group({ who: new FormControl('Alex') });
    group.reset();
    expect(group.value).toEqual({ who: null });
  });

  it('Section 3: a typed group rejects an unknown key that an UntypedFormGroup accepts', () => {
    const typed = labM25TypedProfile();
    // @ts-expect-error TS2551: Property 'emial' does not exist on the group's value type (the compiler suggests 'email')
    expect(typed.value.emial).toBeUndefined();
    const untyped: UntypedFormGroup = labM25LegacyUntypedProfile();
    expect(untyped.value.emial).toBeUndefined();
    expect(untyped.controls['zzz']).toBeUndefined();
    expect(new UntypedFormBuilder().group({ a: 'x' }) instanceof FormGroup).toBe(true);
  });

  it('Section 3: the legacy { validator } option and { validators } build the same group validation', () => {
    for (const group of [labM25LegacyGroupWithValidator(), labM25GroupWithValidators()]) {
      expect(group.errors).toBeNull();
      group.controls.name.setValue('');
      expect(group.errors).toEqual({ nameRequired: true });
    }
  });
});
