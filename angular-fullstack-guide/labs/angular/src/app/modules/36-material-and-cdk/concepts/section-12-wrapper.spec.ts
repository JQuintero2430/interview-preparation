import { Component, booleanAttribute, computed, input, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatButton } from '@angular/material/button';

type LabM36DsButtonKind = 'primary' | 'secondary';

// The design system's vocabulary, mapped once to Material's appearances.
const APPEARANCE_BY_KIND: Record<LabM36DsButtonKind, 'filled' | 'outlined'> = {
  primary: 'filled',
  secondary: 'outlined',
};

@Component({
  selector: 'lab-m36-ds-button',
  imports: [MatButton],
  template: `<button type="button" [matButton]="appearance()" [disabled]="disabled()"><ng-content /></button>`,
})
class LabM36DsButton {
  readonly kind = input<LabM36DsButtonKind>('primary');
  readonly disabled = input(false, { transform: booleanAttribute });
  protected readonly appearance = computed(() => APPEARANCE_BY_KIND[this.kind()]);
}

@Component({
  selector: 'lab-m36-ds-button-host',
  imports: [LabM36DsButton],
  template: `<lab-m36-ds-button [kind]="kind()" [disabled]="disabled()">Save</lab-m36-ds-button>`,
})
class LabM36DsButtonHost {
  readonly kind = signal<LabM36DsButtonKind>('primary');
  readonly disabled = signal(false);
}

describe('Section 12: a design-system wrapper', () => {
  it('Section 12: a design-system button wrapper renders a Material button and forwards its disabled input', () => {
    const fixture = TestBed.createComponent(LabM36DsButtonHost);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    const button = root.querySelector('lab-m36-ds-button button');

    // The wrapper renders Material's button: its base class and the filled appearance's classes.
    expect(button?.classList.contains('mat-mdc-button-base')).toBe(true);
    expect(button?.classList.contains('mat-mdc-unelevated-button')).toBe(true);
    expect(button?.textContent?.trim()).toBe('Save');
    // Enabled: MatButtonBase binds attr.disabled to null, so the attribute is absent.
    expect(button?.hasAttribute('disabled')).toBe(false);
    expect(button?.classList.contains('mat-mdc-button-disabled')).toBe(false);

    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    // Disabled reaches the native button; aria-disabled stays unset because disabledInteractive is off.
    expect(button?.hasAttribute('disabled')).toBe(true);
    expect(button?.classList.contains('mat-mdc-button-disabled')).toBe(true);
    expect(button?.getAttribute('aria-disabled')).toBeNull();

    // A new kind swaps Material's appearance classes behind the same public input.
    fixture.componentInstance.kind.set('secondary');
    fixture.detectChanges();
    expect(button?.classList.contains('mat-mdc-outlined-button')).toBe(true);
    expect(button?.classList.contains('mat-mdc-unelevated-button')).toBe(false);
  });
});
