import { TestBed } from '@angular/core/testing';
import { Clipboard } from '@angular/cdk/clipboard';
import { BreakpointObserver, Breakpoints, type BreakpointState } from '@angular/cdk/layout';

// Under jsdom `window.matchMedia` is undefined and `document.execCommand` is missing, so both CDK services take their fallback paths.
describe('Section 8: the smaller primitives under jsdom', () => {
  it('Section 8: under jsdom BreakpointObserver never matches', () => {
    // Vitest lists `matchMedia` among the window keys it defines on the global, but jsdom has no value for it.
    expect(typeof window.matchMedia).toBe('undefined');
    const observer = TestBed.inject(BreakpointObserver);
    const states: BreakpointState[] = [];

    observer.observe(Breakpoints.Handset).subscribe((state) => states.push(state));

    // Handset is two queries joined by a comma; each is reported on its own and neither matches.
    expect(observer.isMatched(Breakpoints.Handset)).toBe(false);
    expect(states).toEqual([
      {
        matches: false,
        breakpoints: {
          '(max-width: 599.98px) and (orientation: portrait)': false,
          '(max-width: 959.98px) and (orientation: landscape)': false,
        },
      },
    ]);
  });

  it('Section 8: under jsdom Clipboard.copy returns false', () => {
    expect('execCommand' in document).toBe(false);
    const clipboard = TestBed.inject(Clipboard);

    // The textarea is created and selected, `execCommand` is not a function, the `try` swallows the TypeError.
    expect(clipboard.copy('hello')).toBe(false);
    expect(document.querySelector('textarea')).toBeNull();
  });
});
