import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Listbox, Option } from '@angular/aria/listbox';
import { Dialog } from '@angular/cdk/dialog';
import { CdkListbox, CdkOption } from '@angular/cdk/listbox';
import { MATERIAL_ANIMATIONS } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'lab-m36-size-dialog',
  template: `<p>Pick a size</p>`,
})
class LabM36SizeDialog {}

@Component({
  selector: 'lab-m36-two-listboxes',
  imports: [CdkListbox, CdkOption, Listbox, Option],
  template: `
    <ul cdkListbox aria-label="Size">
      @for (size of sizes; track size) {
        <li [cdkOption]="size">{{ size }}</li>
      }
    </ul>
    <ul ngListbox aria-label="Size">
      @for (size of sizes; track size) {
        <li ngOption [value]="size" [label]="size">{{ size }}</li>
      }
    </ul>
  `,
})
class LabM36TwoListboxes {
  protected readonly sizes = ['S', 'M', 'L'];
}

describe('Section 1: three layers', () => {
  it('Section 1: MatDialog opens its content in a CDK dialog container', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: MATERIAL_ANIMATIONS, useValue: { animationsDisabled: true } }],
    });
    const ref = TestBed.inject(MatDialog).open(LabM36SizeDialog);
    TestBed.tick();

    // MatDialog.open delegates to the CDK Dialog service, which records the same dialog under the same id.
    expect(TestBed.inject(Dialog).openDialogs.map((dialog) => dialog.id)).toEqual([ref.id]);

    // MatDialogContainer extends CdkDialogContainer, so the host carries both components' static classes.
    const container = document.querySelector('mat-dialog-container');
    expect(container?.classList.contains('mat-mdc-dialog-container')).toBe(true);
    expect(container?.classList.contains('cdk-dialog-container')).toBe(true);
    expect(container?.getAttribute('role')).toBe('dialog');
    expect(container?.querySelector('lab-m36-size-dialog')?.textContent).toBe('Pick a size');
  });

  it('Section 1: an Aria listbox and a CDK listbox expose the same listbox role on plain markup', async () => {
    const fixture = TestBed.createComponent(LabM36TwoListboxes);
    fixture.detectChanges();
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    const [cdk, aria] = Array.from(root.querySelectorAll('ul'));

    for (const list of [cdk, aria]) {
      expect(list?.getAttribute('role')).toBe('listbox');
      expect(list?.getAttribute('aria-multiselectable')).toBe('false');
      expect(list?.getAttribute('aria-orientation')).toBe('vertical');
      expect(Array.from(list?.children ?? []).map((item) => item.getAttribute('role'))).toEqual(['option', 'option', 'option']);
    }
    // The CDK host gets its own class; the Aria host gets none, so every style is the author's.
    expect(cdk?.classList.contains('cdk-listbox')).toBe(true);
    expect(aria?.classList.length).toBe(0);
  });
});
