import { TestBed } from '@angular/core/testing';
import { UiBadge } from 'ui-lib';

// 'ui-lib' resolves through tsconfig.json `paths` to dist/ui-lib, so `npx ng build ui-lib` runs first.
describe('Module 38 · section 5', () => {
  it('Section 5: the labs app imports UiBadge by package name from the built library', async () => {
    const fixture = TestBed.createComponent(UiBadge);
    fixture.componentRef.setInput('label', 'in stock');
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('span.ui-badge')?.textContent).toBe('in stock');
  });
});
