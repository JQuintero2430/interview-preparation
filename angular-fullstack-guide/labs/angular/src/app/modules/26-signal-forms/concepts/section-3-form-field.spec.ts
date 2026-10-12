import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormField, form, min, provideSignalFormsConfig, required } from '@angular/forms/signals';
import { NG_STATUS_CLASSES } from '@angular/forms/signals/compat';

interface LabM26Binding {
  name: string;
  age: number | null;
}

@Component({
  selector: 'lab-m26-binding-host',
  imports: [FormField],
  template: `
    <input id="n" [formField]="f.name" />
    <input id="a" type="number" [formField]="f.age" />
    <p id="out">{{ f.name().value() }}|{{ f.name().touched() }}|{{ f.name().invalid() }}|{{ f.age().value() }}</p>
  `,
})
class LabM26BindingHost {
  readonly model = signal<LabM26Binding>({ name: '', age: 20 });
  protected readonly f = form(this.model, (p) => {
    required(p.name);
    min(p.age, 18);
  });
}

async function mount(): Promise<ComponentFixture<LabM26BindingHost>> {
  const fixture = TestBed.createComponent(LabM26BindingHost);
  fixture.autoDetectChanges();
  await fixture.whenStable();
  return fixture;
}

function query(fixture: ComponentFixture<LabM26BindingHost>, id: string): HTMLInputElement {
  return fixture.nativeElement.querySelector(`#${id}`) as HTMLInputElement;
}

function type(input: HTMLInputElement, value: string): void {
  input.value = value;
  input.dispatchEvent(new Event('input'));
}

describe('Section 3: binding with [formField]', () => {
  it('Section 3: typing updates the model through formField', async () => {
    const fixture = await mount();
    type(query(fixture, 'n'), 'Zed');
    await fixture.whenStable();
    expect(fixture.componentInstance.model().name).toBe('Zed');
    expect(query(fixture, 'out').textContent).toBe('Zed|false|false|20');
  });

  it('Section 3: a model update repaints the bound input', async () => {
    const fixture = await mount();
    fixture.componentInstance.model.update((m) => ({ ...m, name: 'Prog' }));
    await fixture.whenStable();
    expect(query(fixture, 'n').value).toBe('Prog');
    expect(query(fixture, 'out').textContent).toBe('Prog|false|false|20');
  });

  it('Section 3: a number input writes a number and null when cleared', async () => {
    const fixture = await mount();
    const age = query(fixture, 'a');
    type(age, '42');
    expect(fixture.componentInstance.model().age).toBe(42);
    expect(typeof fixture.componentInstance.model().age).toBe('number');
    type(age, '');
    expect(fixture.componentInstance.model().age).toBeNull();
  });

  it('Section 3: required and min rules become input attributes', async () => {
    const fixture = await mount();
    expect(query(fixture, 'n').required).toBe(true);
    expect(query(fixture, 'n').getAttribute('required')).toBe('');
    expect(query(fixture, 'a').getAttribute('min')).toBe('18');
  });

  it('Section 3: formField sets no aria-invalid and no status classes by default', async () => {
    const fixture = await mount();
    expect(query(fixture, 'n').hasAttribute('aria-invalid')).toBe(false);
    expect(query(fixture, 'n').className).toBe('');
  });

  it('Section 3: NG_STATUS_CLASSES restores the ng- status classes', async () => {
    TestBed.configureTestingModule({
      providers: [provideSignalFormsConfig({ classes: NG_STATUS_CLASSES })],
    });
    const fixture = await mount();
    const input = query(fixture, 'n');
    expect(input.className).toBe('ng-untouched ng-pristine ng-invalid');
    type(input, 'Zed');
    await fixture.whenStable();
    expect(input.classList.contains('ng-valid')).toBe(true);
    expect(input.classList.contains('ng-invalid')).toBe(false);
    expect(input.classList.contains('ng-dirty')).toBe(true);
  });

  it('Section 3: blur marks the field touched', async () => {
    const fixture = await mount();
    const input = query(fixture, 'n');
    expect(query(fixture, 'out').textContent).toContain('|false|');
    input.dispatchEvent(new Event('blur'));
    await fixture.whenStable();
    expect(query(fixture, 'out').textContent).toBe('|true|true|20');
  });
});
