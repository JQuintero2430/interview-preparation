import { Component, forwardRef, input, model, output, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FormField, disabled, form, min, transformedValue } from '@angular/forms/signals';
import type { FormCheckboxControl, FormValueControl, ValidationError } from '@angular/forms/signals';
import { LabM26LegacyAccessor, LabM26ValueControl } from '../legacy/legacy-apis';

@Component({
  selector: 'lab-m26-stepper',
  template: `
    <span id="status">{{ disabled() }}|{{ errors().length }}</span>
    <button id="inc" type="button" (click)="value.set(value() + 1)" (blur)="touch.emit()">
      {{ value() }}
    </button>
  `,
})
class LabM26Stepper implements FormValueControl<number> {
  readonly value = model(0);
  readonly disabled = input(false);
  readonly errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);
  readonly touch = output<void>();
}

@Component({
  selector: 'lab-m26-stepper-host',
  imports: [FormField, LabM26Stepper],
  template: `<lab-m26-stepper id="s" [formField]="f.qty" />`,
})
class LabM26StepperHost {
  readonly model = signal({ qty: 1, lock: false });
  readonly f = form(this.model, (p) => {
    min(p.qty, 3);
    disabled(p.qty, { when: ({ valueOf }) => valueOf(p.lock) });
  });
}

@Component({
  selector: 'lab-m26-toggle',
  template: `<button id="t" type="button" (click)="checked.set(!checked())">{{ checked() }}</button>`,
})
class LabM26Toggle implements FormCheckboxControl {
  readonly checked = model(false);
}

@Component({
  selector: 'lab-m26-toggle-host',
  imports: [FormField, LabM26Toggle],
  template: `<lab-m26-toggle [formField]="f.agree" />`,
})
class LabM26ToggleHost {
  readonly model = signal({ agree: false });
  readonly f = form(this.model);
}

@Component({
  selector: 'lab-m26-raw-number',
  template: `<input id="raw" [value]="raw()" (input)="typed($event)" />`,
})
class LabM26RawNumber implements FormValueControl<number | null> {
  readonly value = model<number | null>(null);
  protected readonly raw = transformedValue(this.value, {
    parse: (text: string) => {
      const parsed = text === '' ? null : Number(text);
      return Number.isNaN(parsed)
        ? { error: { kind: 'parse', message: `${text} is not a number` } }
        : { value: parsed };
    },
    format: (value: number | null) => value?.toString() ?? '',
  });

  protected typed(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.raw.set(event.target.value);
    }
  }
}

@Component({
  selector: 'lab-m26-raw-host',
  imports: [FormField, LabM26RawNumber],
  template: `<lab-m26-raw-number [formField]="f.n" />`,
})
class LabM26RawHost {
  readonly model = signal<{ n: number | null }>({ n: null });
  readonly f = form(this.model);
}

@Component({
  selector: 'lab-m26-both',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => LabM26Both), multi: true }],
  template: '',
})
class LabM26Both implements ControlValueAccessor {
  readonly value = model('');
  readonly log: string[] = [];
  writeValue(value: string): void {
    this.log.push(`writeValue:${value}`);
  }
  registerOnChange(): void {
    this.log.push('registerOnChange');
  }
  registerOnTouched(): void {
    this.log.push('registerOnTouched');
  }
}

@Component({
  selector: 'lab-m26-both-host',
  imports: [FormField, LabM26Both],
  template: `<lab-m26-both [formField]="f.x" />`,
})
class LabM26BothHost {
  readonly model = signal({ x: 'a' });
  readonly f = form(this.model);
}

@Component({
  selector: 'lab-m26-legacy-host',
  imports: [FormField, LabM26LegacyAccessor, LabM26ValueControl],
  template: `
    <lab-m26-legacy-accessor id="old" [formField]="f.old" />
    <lab-m26-value-control id="new" [formField]="f.fresh" />
  `,
})
class LabM26LegacyHost {
  readonly model = signal({ old: 'a', fresh: 'a' });
  readonly f = form(this.model);
}

async function mount<T>(type: new () => T): Promise<ComponentFixture<T>> {
  const fixture = TestBed.createComponent(type);
  fixture.autoDetectChanges();
  await fixture.whenStable();
  return fixture;
}

function el(fixture: ComponentFixture<unknown>, selector: string): HTMLElement {
  const found = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(selector);
  if (!found) {
    throw new Error(`missing ${selector}`);
  }
  return found;
}

function type(fixture: ComponentFixture<unknown>, selector: string, text: string): void {
  const input = el(fixture, selector) as HTMLInputElement;
  input.value = text;
  input.dispatchEvent(new Event('input'));
}

describe('Section 8: custom controls', () => {
  it('Section 8: a value model control writes the field', async () => {
    const fixture = await mount(LabM26StepperHost);
    expect(el(fixture, '#inc').textContent?.trim()).toBe('1');
    el(fixture, '#inc').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.model().qty).toBe(2);
    fixture.componentInstance.model.set({ qty: 7, lock: false });
    await fixture.whenStable();
    expect(el(fixture, '#inc').textContent?.trim()).toBe('7');
  });

  it('Section 8: a checked model control writes a boolean field', async () => {
    const fixture = await mount(LabM26ToggleHost);
    el(fixture, '#t').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.model().agree).toBe(true);
    expect(fixture.componentInstance.f.agree().dirty()).toBe(true);
  });

  it('Section 8: the touch output marks the field touched', async () => {
    const fixture = await mount(LabM26StepperHost);
    const qty = fixture.componentInstance.f.qty;
    expect(qty().touched()).toBe(false);
    el(fixture, '#inc').dispatchEvent(new Event('blur'));
    await fixture.whenStable();
    expect(qty().touched()).toBe(true);
    expect(qty().dirty()).toBe(false);
  });

  it('Section 8: formField binds disabled and errors into the control', async () => {
    const fixture = await mount(LabM26StepperHost);
    expect(el(fixture, '#status').textContent).toBe('false|1');
  });

  it('Section 8: a disabled field hands the control no errors', async () => {
    const fixture = await mount(LabM26StepperHost);
    fixture.componentInstance.model.set({ qty: 1, lock: true });
    await fixture.whenStable();
    expect(el(fixture, '#status').textContent).toBe('true|0');
  });

  it('Section 8: a ControlValueAccessor bound with formField gets writeValue and setDisabledState', async () => {
    const fixture = await mount(LabM26LegacyHost);
    const accessor = fixture.debugElement.children[0].componentInstance as LabM26LegacyAccessor;
    expect(accessor.log).toEqual([
      'registerOnChange',
      'registerOnTouched',
      'writeValue:a',
      'setDisabledState:false',
    ]);
    fixture.componentInstance.model.set({ old: 'prog', fresh: 'a' });
    await fixture.whenStable();
    expect(accessor.log.at(-1)).toBe('writeValue:prog');
  });

  it('Section 8: a change from the accessor updates the model and marks it dirty', async () => {
    const fixture = await mount(LabM26LegacyHost);
    const field = fixture.componentInstance.f.old;
    expect(field().dirty()).toBe(false);
    type(fixture, '#old #inner', 'typed');
    await fixture.whenStable();
    expect(fixture.componentInstance.model().old).toBe('typed');
    expect(field().dirty()).toBe(true);
  });

  it('Section 8: the value model replacement of an accessor writes and touches the same way', async () => {
    const fixture = await mount(LabM26LegacyHost);
    const field = fixture.componentInstance.f.fresh;
    type(fixture, '#new #inner', 'typed');
    el(fixture, '#new #inner').dispatchEvent(new Event('blur'));
    await fixture.whenStable();
    expect(fixture.componentInstance.model().fresh).toBe('typed');
    expect(field().dirty()).toBe(true);
    expect(field().touched()).toBe(true);
  });

  it('Section 8: a component with a value model and an accessor is bound as an accessor', async () => {
    const fixture = await mount(LabM26BothHost);
    const both = fixture.debugElement.children[0].componentInstance as LabM26Both;
    expect(both.log).toEqual(['registerOnChange', 'registerOnTouched', 'writeValue:a']);
    expect(both.value()).toBe('');
  });

  it('Section 8: transformedValue reports a parse error', async () => {
    const fixture = await mount(LabM26RawHost);
    const field = fixture.componentInstance.f.n;
    type(fixture, '#raw', '12');
    await fixture.whenStable();
    expect(fixture.componentInstance.model().n).toBe(12);
    expect(field().errors()).toEqual([]);
    type(fixture, '#raw', 'abc');
    await fixture.whenStable();
    expect(field().errors().map((e) => e.kind)).toEqual(['parse']);
    expect(fixture.componentInstance.model().n).toBe(12);
  });
});
