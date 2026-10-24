import { HttpClient, provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

interface LabM41Order {
  id: number;
}

/** A fake `fetch` that answers every call with one JSON order, shaped like our Spring endpoint. */
function orderFetch(): ReturnType<typeof vi.fn<typeof fetch>> {
  return vi.fn<typeof fetch>(
    async () =>
      new Response(JSON.stringify([{ id: 1 }]), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
  );
}

function setUp(): { http: HttpClient; stub: ReturnType<typeof orderFetch> } {
  const stub = orderFetch();
  vi.stubGlobal('fetch', stub);
  TestBed.configureTestingModule({ providers: [provideHttpClient()] });
  return { http: TestBed.inject(HttpClient), stub };
}

describe('Section 1: CORS on both sides', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('Section 1: withCredentials makes the fetch backend send credentials include', async () => {
    const { http, stub } = setUp();
    await firstValueFrom(http.get<LabM41Order[]>('http://localhost:8080/api/orders', { withCredentials: true }));
    expect(stub).toHaveBeenCalledTimes(1);
    expect(stub.mock.calls[0][1]?.credentials).toBe('include');
  });

  it("Section 1: without withCredentials the request leaves the credentials mode to fetch's default", async () => {
    const { http, stub } = setUp();
    await firstValueFrom(http.get<LabM41Order[]>('http://localhost:8080/api/orders'));
    expect(stub).toHaveBeenCalledTimes(1);
    expect(stub.mock.calls[0][1]?.credentials).toBeUndefined();
  });

  it('Section 1: a relative /api URL is sent as written, so a proxy can serve it from the same origin', async () => {
    const { http, stub } = setUp();
    const orders = await firstValueFrom(http.get<LabM41Order[]>('/api/orders'));
    expect(orders).toEqual([{ id: 1 }]);
    expect(String(stub.mock.calls[0][0])).toBe('/api/orders');
  });
});
