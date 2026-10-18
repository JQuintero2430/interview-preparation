import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { LabM30TodosApi } from '../demo/todos-api';
import { LabM30TodosPage } from '../demo/todos-page';

describe('Section 1: the cheaper level', () => {
  it('Section 1: the empty-title rule is checked in a component test without a browser', async () => {
    const api = { list: vi.fn(() => of([])), create: vi.fn(), remove: vi.fn() };
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: LabM30TodosApi, useValue: api }],
    });
    const fixture = TestBed.createComponent(LabM30TodosPage);
    await fixture.whenStable();
    const page: HTMLElement = fixture.nativeElement;

    page.querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
    await fixture.whenStable();

    expect(navigator.userAgent).toContain('jsdom');
    expect(page.querySelector('[role="alert"]')?.textContent).toBe('Title is required');
    expect(page.querySelector('#lab-m30-title')?.getAttribute('aria-invalid')).toBe('true');
    expect(api.create).not.toHaveBeenCalled();
  });
});
