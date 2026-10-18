/// <reference types="@angular/localize" />

// `ng test` adds `@angular/localize/init` to the TestBed setup itself: this spec imports nothing from the package.
describe('Module 34 lab smoke', () => {
  it('Smoke: $localize is defined in ng test without an import', () => {
    expect(typeof $localize).toBe('function');
    expect($localize`a${1}b`).toBe('a1b');
  });
});
