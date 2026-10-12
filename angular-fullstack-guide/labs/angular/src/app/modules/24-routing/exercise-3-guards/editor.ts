import { Component, computed, signal } from '@angular/core';

/** What `confirmLeave` needs from a component: whether leaving would lose work. */
export interface LabM24HasUnsavedChanges {
  dirty(): boolean;
}

@Component({
  selector: 'lab-m24-editor',
  template: '<textarea (input)="text.set($any($event.target).value)"></textarea>',
})
export class LabM24Editor implements LabM24HasUnsavedChanges {
  readonly text = signal('');
  private readonly saved = signal('');
  readonly dirty = computed(() => this.text() !== this.saved());

  save(): void {
    this.saved.set(this.text());
  }
}
