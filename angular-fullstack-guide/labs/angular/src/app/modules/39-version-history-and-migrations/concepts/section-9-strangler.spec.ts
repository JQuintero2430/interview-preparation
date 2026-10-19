import { TestBed } from '@angular/core/testing';
import { Router, provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { LabM39OrderDetailPage } from '../migrated/order-detail-page';
import { LabM39OrderListPage } from '../migrated/order-list-page';
import { LEGACY_NAVIGATOR, LabM39LegacyHandoff, labM39StranglerRoutes } from './section-9-strangler';

interface Visit {
  url: string;
  text: string;
  component: unknown;
  handedOff: string[];
}

/** Navigates once with a fake legacy navigator that only records URLs. */
async function visit(url: string): Promise<Visit> {
  const handedOff: string[] = [];
  TestBed.configureTestingModule({
    providers: [
      provideRouter(labM39StranglerRoutes, withComponentInputBinding()),
      { provide: LEGACY_NAVIGATOR, useValue: { handOff: (next: string) => handedOff.push(next) } },
    ],
  });
  const harness = await RouterTestingHarness.create();
  await harness.navigateByUrl(url);
  harness.detectChanges();
  const result: Visit = {
    url: TestBed.inject(Router).url,
    text: harness.routeNativeElement?.textContent?.trim() ?? '',
    component: harness.routeDebugElement?.componentInstance,
    handedOff,
  };
  TestBed.resetTestingModule();
  return result;
}

describe('Section 9: the routing half of a strangler fig', () => {
  it('Section 9: the migrated paths render Angular components', async () => {
    const list = await visit('/orders');
    expect(list.component).toBeInstanceOf(LabM39OrderListPage);
    expect(list.text).toBe('Orders (Angular)');
    expect(list.handedOff).toEqual([]);

    const detail = await visit('/orders/42');
    expect(detail.component).toBeInstanceOf(LabM39OrderDetailPage);
    expect(detail.text).toBe('Order 42 (Angular)');
    expect(detail.handedOff).toEqual([]);
  });

  it('Section 9: every other path is handed to the legacy navigator with its full URL', async () => {
    const customer = await visit('/customers/42?tab=notes#top');
    expect(customer.component).toBeInstanceOf(LabM39LegacyHandoff);
    expect(customer.handedOff).toEqual(['/customers/42?tab=notes#top']);

    expect((await visit('/')).handedOff).toEqual(['/']);
    expect((await visit('/orders/42/edit')).handedOff).toEqual(['/orders/42/edit']);
  });
});
