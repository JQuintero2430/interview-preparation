import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

@Component({
  selector: 'lab-m37-s2-consumer',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<m37-s2-unknown-widget [score]="3"></m37-s2-unknown-widget>`,
})
class LabM37S2Consumer {}

describe('Section 2: the consumer schema', () => {
  it('Section 2: a component with CUSTOM_ELEMENTS_SCHEMA compiles a template with an unknown element and property', () => {
    const fixture = TestBed.createComponent(LabM37S2Consumer);
    fixture.detectChanges();

    const widget = fixture.nativeElement.querySelector('m37-s2-unknown-widget') as HTMLElement & { score?: number };
    expect(widget).not.toBeNull();
    expect(widget.score).toBe(3);
  });
});
