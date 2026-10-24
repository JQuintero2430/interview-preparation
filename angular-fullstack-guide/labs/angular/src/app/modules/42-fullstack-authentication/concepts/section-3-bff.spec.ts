import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { LAB_M42_NAVIGATE, LabM42BffClient, LabM42TokenMediatedClient } from './bff-client';

/** Our stub of a token-mediating backend's session answer: RFC 10017 §6.2.2.1 puts the access token in it. */
const MEDIATED_SESSION = { accessToken: 'our-access-token' };

function setUp() {
  const navigate = vi.fn<(url: string) => void>();
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting(), { provide: LAB_M42_NAVIGATE, useValue: navigate }],
  });
  return { controller: TestBed.inject(HttpTestingController), navigate };
}

describe('Section 3: where the OAuth client runs', () => {
  it('Section 3: a BFF call goes to a relative /api URL with no Authorization header', async () => {
    const { controller } = setUp();
    const user = firstValueFrom(TestBed.inject(LabM42BffClient).me());

    const req = controller.expectOne('/api/me');
    expect(req.request.headers.has('Authorization')).toBe(false);
    expect(req.request.withCredentials).toBe(false);
    req.flush({ name: 'Ada' });

    expect(await user).toEqual({ name: 'Ada' });
    controller.verify();
  });

  it('Section 3: starting login navigates the whole page to /oauth2/authorization/<registration>', () => {
    const { controller, navigate } = setUp();

    TestBed.inject(LabM42BffClient).login();

    expect(navigate).toHaveBeenCalledOnce();
    expect(navigate).toHaveBeenCalledWith('/oauth2/authorization/idp');
    controller.verify();
  });

  it('Section 3: the token-mediating variant attaches the access token it was handed, the BFF variant never holds one', async () => {
    const { controller } = setUp();
    const mediated = TestBed.inject(LabM42TokenMediatedClient);
    const resumed = mediated.resumeSession();
    controller.expectOne('/bff/session').flush(MEDIATED_SESSION);
    await resumed;

    mediated.orders().subscribe();
    const direct = controller.expectOne('https://api.example.com/orders');
    expect(direct.request.headers.get('Authorization')).toBe('Bearer our-access-token');
    direct.flush([]);

    TestBed.inject(LabM42BffClient).orders().subscribe();
    const proxied = controller.expectOne('/api/orders');
    expect(proxied.request.headers.has('Authorization')).toBe(false);
    proxied.flush([]);
    controller.verify();
  });
});
