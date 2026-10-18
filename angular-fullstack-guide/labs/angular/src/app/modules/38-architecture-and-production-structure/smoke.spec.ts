import { TestBed } from '@angular/core/testing';
import { UiBadge } from 'ui-lib';

// 'ui-lib' resolves through tsconfig.json `paths` to dist/ui-lib, so `npx ng build ui-lib` runs first.
describe('Module 38 lab smoke', () => {
  it('Smoke: the labs project renders UiBadge imported from the built ui-lib package', async () => {
    const fixture = TestBed.createComponent(UiBadge);
    fixture.componentRef.setInput('label', 'new');
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('span.ui-badge')?.textContent).toBe('new');
  });
});
