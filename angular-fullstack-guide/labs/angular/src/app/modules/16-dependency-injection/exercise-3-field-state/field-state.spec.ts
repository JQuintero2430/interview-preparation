import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Field, FIELD_ID, FieldLabel, fieldStats, FieldState, Hint } from './field-state';

// Two fields in one host: the first has a kind attribute, the second has none.
@Component({
  selector: 'lab-e3-host',
  imports: [Field, Hint],
  template: `
    <lab-field kind="email"><lab-hint /></lab-field>
    <lab-field><lab-hint /></lab-field>
  `,
})
class Host {}

@Component({
  selector: 'lab-e3-toggle-host',
  imports: [Field],
  template: '@if (show()) { <lab-field /> }',
})
class ToggleHost {
  readonly show = signal(true);
}

describe('E16.3 A per-field validator through component providers', () => {
  beforeEach(() => {
    fieldStats.built = 0;
    fieldStats.destroyed = 0;
  });

  it('each lab-field has its own FieldState instance', () => {
    const fixture = TestBed.createComponent(Host);
    const [first, second] = fixture.debugElement
      .queryAll(By.directive(Field))
      .map((node) => node.componentInstance as Field);

    expect(first.state).not.toBe(second.state);
    expect(first.state.id).not.toBe(second.state.id);
    expect(fieldStats.built).toBe(2);
    expect(TestBed.inject(FieldState, null, { optional: true })).toBeNull();
  });

  it('the projected child sees FieldState and not FIELD_ID', () => {
    const fixture = TestBed.createComponent(Host);
    const fields = fixture.debugElement.queryAll(By.directive(Field));
    const hints = fixture.debugElement
      .queryAll(By.directive(Hint))
      .map((node) => node.componentInstance as Hint);

    expect(hints[0].state).toBe(fields[0].componentInstance.state);
    expect(hints[1].state).toBe(fields[1].componentInstance.state);
    expect(hints[0].fieldId).toBeNull();
    expect(hints[1].fieldId).toBeNull();
  });

  it("the field's own view directive sees both", () => {
    const fixture = TestBed.createComponent(Host);
    const fields = fixture.debugElement.queryAll(By.directive(Field));
    const labels = fixture.debugElement
      .queryAll(By.directive(FieldLabel))
      .map((node) => node.injector.get(FieldLabel));

    expect(labels[0].state).toBe(fields[0].componentInstance.state);
    expect(labels[0].fieldId).toBe('field-' + labels[0].state?.id);
    expect(labels[1].fieldId).toBe('field-' + labels[1].state?.id);
    expect(labels[0].fieldId).not.toBe(labels[1].fieldId);
    expect(TestBed.inject(FIELD_ID, null, { optional: true })).toBeNull();
  });

  it('FieldState.ngOnDestroy runs when its field is destroyed', () => {
    const fixture = TestBed.createComponent(ToggleHost);
    fixture.detectChanges();
    expect(fieldStats.destroyed).toBe(0);

    fixture.componentInstance.show.set(false);
    fixture.detectChanges();

    expect(fieldStats.destroyed).toBe(1);
  });

  it('the host attribute kind is read with HostAttributeToken, null when optional and absent', () => {
    const fixture = TestBed.createComponent(Host);
    const [first, second] = fixture.debugElement
      .queryAll(By.directive(Field))
      .map((node) => node.componentInstance as Field);

    expect(first.kind).toBe('email');
    expect(second.kind).toBeNull();
  });

  it('HOST_TAG_NAME returns the tag', () => {
    const fixture = TestBed.createComponent(Host);
    const field = fixture.debugElement.query(By.directive(Field)).componentInstance as Field;

    expect(field.tag).toBe('lab-field');
  });
});
