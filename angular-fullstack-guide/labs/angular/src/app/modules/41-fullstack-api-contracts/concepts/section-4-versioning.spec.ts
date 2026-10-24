import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { LAB_M41_API_VERSION, LabM41DeprecationLog, apiVersionInterceptor } from './api-version.interceptor';

/** Our example's tolerant mapping: a status this client has never seen gets a neutral label. */
const STATUS_LABELS = new Map([
  ['PLACED', 'Placed'],
  ['SHIPPED', 'Shipped'],
]);

function statusLabel(status: string): string {
  return STATUS_LABELS.get(status) ?? 'Unknown status';
}

describe('Section 4: evolving the contract', () => {
  function setUp(): { http: HttpClient; controller: HttpTestingController } {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([apiVersionInterceptor])), provideHttpClientTesting()],
    });
    return { http: TestBed.inject(HttpClient), controller: TestBed.inject(HttpTestingController) };
  }

  it('Section 4: the version interceptor sets the version header on API requests only', () => {
    const { http, controller } = setUp();
    http.get('/api/orders').subscribe();
    http.get('/assets/logo.svg').subscribe();
    http.get('https://cdn.example.com/api/orders').subscribe();
    expect(controller.expectOne('/api/orders').request.headers.get('X-Version')).toBe(LAB_M41_API_VERSION);
    expect(controller.expectOne('/assets/logo.svg').request.headers.has('X-Version')).toBe(false);
    expect(controller.expectOne('https://cdn.example.com/api/orders').request.headers.has('X-Version')).toBe(false);
  });

  it('Section 4: a Deprecation response header is reported once per endpoint', () => {
    const { http, controller } = setUp();
    const log = TestBed.inject(LabM41DeprecationLog);
    const deprecated = { headers: { Deprecation: '@1688169599' } };
    http.get('/api/orders/1').subscribe();
    controller.expectOne('/api/orders/1').flush({}, deprecated);
    http.get('/api/orders/1').subscribe();
    controller.expectOne('/api/orders/1').flush({}, deprecated);
    expect(log.entries()).toEqual([{ endpoint: 'GET /api/orders/1', deprecation: '@1688169599' }]);
    http.get('/api/orders').subscribe();
    controller.expectOne('/api/orders').flush([], deprecated);
    http.get('/api/customers').subscribe();
    controller.expectOne('/api/customers').flush([]);
    expect(log.entries().map((entry) => entry.endpoint)).toEqual(['GET /api/orders/1', 'GET /api/orders']);
  });

  it('Section 4: an unknown status value maps to the fallback label instead of throwing', () => {
    const { http, controller } = setUp();
    let label = '';
    http.get<{ status: string }>('/api/orders/2').subscribe((order) => {
      label = statusLabel(order.status);
    });
    controller.expectOne('/api/orders/2').flush({ status: 'REFUNDED' });
    expect(label).toBe('Unknown status');
    expect(statusLabel('SHIPPED')).toBe('Shipped');
  });
});
