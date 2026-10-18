import { Dir, Directionality } from '@angular/cdk/bidi';
import { Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';

// Section 11 claims about CDK `Directionality` (`@angular/cdk` 22.2.1): it reads the document's `dir` once, in its
// constructor, and the `Dir` directive provides its own value to the elements below it. The document is shared by
// every test of the file, so each test restores `<html dir>`.
@Component({
  selector: 'lab-m34-dir-child',
  template: `<span>{{ directionality.value }}</span>`,
})
class LabM34DirChild {
  protected readonly directionality = inject(Directionality);
}

@Component({
  selector: 'lab-m34-dir-host',
  imports: [Dir, LabM34DirChild],
  template: `<section dir="rtl"><lab-m34-dir-child /></section>`,
})
class LabM34DirHost {}

describe('Section 11: Directionality', () => {
  afterEach(() => document.documentElement.removeAttribute('dir'));

  it('Section 11: Directionality reads rtl from the document', () => {
    document.documentElement.dir = 'rtl';

    expect(TestBed.inject(Directionality).value).toBe('rtl');
  });

  it('Section 11: Directionality does not follow a later change of the html dir attribute', () => {
    const directionality = TestBed.inject(Directionality);
    document.documentElement.dir = 'rtl';

    expect(directionality.value).toBe('ltr');
  });

  it('Section 11: the Dir directive reports its own direction to children', () => {
    const fixture = TestBed.createComponent(LabM34DirHost);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('span').textContent).toBe('rtl');
    expect(TestBed.inject(Directionality).value).toBe('ltr');
  });
});
