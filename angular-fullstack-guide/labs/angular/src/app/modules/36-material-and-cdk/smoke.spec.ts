import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Listbox, Option } from '@angular/aria/listbox';
import { CdkListbox, CdkOption } from '@angular/cdk/listbox';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'lab-m36-smoke',
  imports: [MatButton, CdkListbox, CdkOption, Listbox, Option],
  template: `
    <button matButton="filled" type="button">Save</button>
    <ul cdkListbox aria-label="CDK">
      <li cdkOption="a">A</li>
      <li cdkOption="b">B</li>
    </ul>
    <ul ngListbox aria-label="Aria">
      <li ngOption value="a" label="A">A</li>
      <li ngOption value="b" label="B">B</li>
    </ul>
  `,
})
class LabM36Smoke {}

// jsdom has no matchMedia, showPopover or execCommand; this host needs none of them (prediction F1; the run decides the title).
describe('Module 36 lab smoke', () => {
  it('Smoke: Material, CDK and Aria components render under jsdom', () => {
    const fixture = TestBed.createComponent(LabM36Smoke);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;

    expect(root.querySelector('button')?.classList.contains('mat-mdc-button-base')).toBe(true);
    const listboxes = root.querySelectorAll('[role="listbox"]');
    expect(listboxes.length).toBe(2);
    expect(root.querySelectorAll('[role="option"]').length).toBe(4);
  });
});
