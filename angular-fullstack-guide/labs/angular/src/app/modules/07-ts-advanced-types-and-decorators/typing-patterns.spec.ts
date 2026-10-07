import { booleanAttribute, Component, inject, input, InjectionToken, InputSignal, InputSignalWithTransform, output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRouteSnapshot, ResolveFn, Route } from '@angular/router';
import { TestBed } from '@angular/core/testing';

// Fails to compile (TS2322 on `true`) unless A and B are the same type; checked by `tsc -p tsconfig.spec.json`.
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;

interface ApiConfig {
  baseUrl: string;
  retries: number;
}
interface User {
  id: string;
  name: string;
}

const API_CONFIG = new InjectionToken<ApiConfig>('api config', { factory: () => ({ baseUrl: '/api', retries: 2 }) });
const UNTYPED = new InjectionToken('untyped');

@Component({
  selector: 'lab-picker',
  template: `@for (item of items(); track $index) {
    <button type="button" (click)="picked.emit(item)">{{ label()(item) }}</button>
  }`,
})
class Picker<T> {
  readonly items = input.required<T[]>();
  readonly label = input.required<(item: T) => string>();
  readonly picked = output<T>();
}

@Component({
  selector: 'lab-picker-host',
  imports: [Picker],
  template: `<lab-picker [items]="users" [label]="nameOf" (picked)="chosen = $event" />`,
})
class PickerHost {
  readonly users: User[] = [
    { id: 'u-1', name: 'Ann' },
    { id: 'u-2', name: 'Bo' },
  ];
  readonly nameOf = (user: User) => user.name;
  chosen: User | undefined;
}

// `$any(users)` removes the check of the `items` binding, so `T` is inferred from `label` alone: `number`.
@Component({
  selector: 'lab-picker-any-host',
  imports: [Picker],
  template: `<lab-picker [items]="$any(users)" [label]="countLabel" (picked)="chosen = $event" />`,
})
class PickerAnyHost {
  readonly users: User[] = [{ id: 'u-1', name: 'Ann' }];
  readonly countLabel = (count: number) => String(count);
  chosen: number | undefined;
}

@Component({ selector: 'lab-inputs', template: '' })
class Inputs {
  readonly size = input<number>();
  readonly id = input.required<string>();
  readonly disabled = input(false, { transform: booleanAttribute });
}

describe('Section 9: typing patterns in Angular code', () => {
  it('Section 9: a typed InjectionToken makes inject() return its type; an untyped one gives unknown', () => {
    TestBed.runInInjectionContext(() => {
      const config = inject(API_CONFIG);
      // Only its type is checked: UNTYPED has no provider, so calling this would throw NullInjectorError.
      const injectUntyped = () => inject(UNTYPED);
      const typed: Equal<typeof config, ApiConfig> = true;
      const unknownToken: Equal<ReturnType<typeof injectUntyped>, unknown> = true;
      expect([typed, unknownToken, config.retries]).toEqual([true, true, 2]);
    });
  });

  it('Section 9: a FormControl is nullable unless nonNullable, because reset() sets null', () => {
    const nullable = new FormControl('ann@example.com');
    const nonNullable = new FormControl('ann@example.com', { nonNullable: true });
    const types: [Equal<typeof nullable, FormControl<string | null>>, Equal<typeof nonNullable, FormControl<string>>] = [true, true];
    nullable.reset();
    nonNullable.reset();
    expect([...types, nullable.value, nonNullable.value]).toEqual([true, true, null, 'ann@example.com']);
  });

  it('Section 9: group value is Partial because disabled controls are left out; getRawValue() keeps them', () => {
    const form = new FormBuilder().nonNullable.group({ email: 'ann@example.com', plan: 'free' });
    form.controls.plan.disable();
    const value = form.value;
    const raw = form.getRawValue();
    const types: [Equal<typeof value, Partial<{ email: string; plan: string }>>, Equal<typeof raw, { email: string; plan: string }>] = [
      true,
      true,
    ];
    // @ts-expect-error TS2322: a Partial value is not a full one.
    const full: { email: string; plan: string } = form.value;
    expect([types, value, raw, full]).toEqual([[true, true], { email: 'ann@example.com' }, { email: 'ann@example.com', plan: 'free' }, value]);
    expect(form instanceof FormGroup).toBe(true);
  });

  it('Section 9: input() types: optional adds undefined, required does not, and transform separates write and read types', () => {
    const fixture = TestBed.createComponent(Inputs);
    fixture.componentRef.setInput('id', 'u-1');
    fixture.componentRef.setInput('disabled', '');
    const inputs = fixture.componentInstance;
    const types: [
      Equal<typeof inputs.size, InputSignal<number | undefined>>,
      Equal<typeof inputs.id, InputSignal<string>>,
      Equal<typeof inputs.disabled, InputSignalWithTransform<boolean, unknown>>,
    ] = [true, true, true];
    expect([...types, inputs.size(), inputs.id(), inputs.disabled()]).toEqual([true, true, true, undefined, 'u-1', true]);
  });

  it('Section 9: ResolveFn<T> checks what a resolver returns', () => {
    const userResolver: ResolveFn<User> = () => ({ id: 'u-1', name: 'Ann' });
    // @ts-expect-error TS2322: the resolver must return a User (or an Observable or Promise of one, or a RedirectCommand).
    const wrongResolver: ResolveFn<User> = () => ({ id: 'u-1' });
    expect([typeof userResolver, typeof wrongResolver]).toEqual(['function', 'function']);
  });

  it('Section 9: a generic component keeps its item type: the host receives the clicked User', async () => {
    const fixture = TestBed.createComponent(PickerHost);
    await fixture.whenStable();
    const buttons = (fixture.nativeElement as HTMLElement).querySelectorAll('button');
    buttons[1]?.click();
    expect([buttons.length, buttons[0]?.textContent, fixture.componentInstance.chosen]).toEqual([2, 'Ann', { id: 'u-2', name: 'Bo' }]);
  });

  it('Section 9: $any() on one binding stops it constraining T, so a label for numbers compiles next to User items', async () => {
    const fixture = TestBed.createComponent(PickerAnyHost);
    await fixture.whenStable();
    const button = (fixture.nativeElement as HTMLElement).querySelector('button');
    button?.click();
    // `chosen` is typed `number | undefined` (T was inferred as `number`), but the value that arrives is the User.
    expect([button?.textContent, fixture.componentInstance.chosen]).toEqual(['[object Object]', { id: 'u-1', name: 'Ann' }]);
  });

  it('Section 9: route data is untyped on the consumer side: its values are any, whatever the resolver returns', () => {
    const userResolver: ResolveFn<User> = () => ({ id: 'u-1', name: 'Ann' });
    const route: Route = { path: 'u', data: { user: { id: 'u-1', name: 'Ann' } }, resolve: { user: userResolver } };
    const routeValueIsAny: Equal<NonNullable<Route['data']>[string], any> = true;
    const snapshotValueIsAny: Equal<ActivatedRouteSnapshot['data'][string], any> = true;
    const asUser: User | undefined = route.data?.['user'];
    const asNumber: number | undefined = route.data?.['user']; // compiles too: any fits every type
    expect([routeValueIsAny, snapshotValueIsAny, asUser, asNumber]).toEqual([true, true, asUser, asUser]);
  });
});
