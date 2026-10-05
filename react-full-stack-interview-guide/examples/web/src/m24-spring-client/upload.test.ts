import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { API_ORIGIN } from './contract';
import { createApiClient } from './http';
import { createSession } from './session';
import { UploadError, uploadFile } from './upload';

const S3_URL = 'https://my-bucket.s3.eu-west-1.amazonaws.com/uploads/abc-cat.png';
const log: string[] = [];
let apiBody: unknown;
let s3Auth: string | null;
let s3Status = 200;

const server = setupServer(
  http.post(`${API_ORIGIN}/api/uploads`, async ({ request }) => {
    log.push('POST /api/uploads');
    apiBody = await request.json();
    return HttpResponse.json({ uploadUrl: `${S3_URL}?X-Amz-Signature=abc`, key: 'uploads/abc-cat.png', headers: { 'Content-Type': 'image/png' } });
  }),
  http.put(S3_URL, ({ request }) => {
    log.push(`PUT s3 ${request.headers.get('content-type')}`);
    s3Auth = request.headers.get('authorization');
    return new HttpResponse(null, { status: s3Status });
  }),
  http.post(`${API_ORIGIN}/api/uploads/confirm`, async ({ request }) => {
    log.push(`POST /api/uploads/confirm ${JSON.stringify(await request.json())}`);
    return HttpResponse.json({ status: 'stored' });
  }),
);

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
beforeEach(() => {
  log.length = 0;
  s3Status = 200;
  s3Auth = null;
});
afterAll(() => server.close());

function setup() {
  const session = createSession(API_ORIGIN);
  session.setAccessToken('my-jwt');
  return createApiClient({ baseUrl: API_ORIGIN, auth: session });
}

const file = new File(['hello'], 'cat.png', { type: 'image/png' });

test('request URL, PUT to S3, then confirm, in that order', async () => {
  await expect(uploadFile(setup(), file)).resolves.toEqual({ key: 'uploads/abc-cat.png' });

  expect(apiBody).toEqual({ filename: 'cat.png', contentType: 'image/png', size: 5 });
  expect(log).toEqual(['POST /api/uploads', 'PUT s3 image/png', 'POST /api/uploads/confirm {"key":"uploads/abc-cat.png"}']);
});

test('the S3 request never carries our bearer token', async () => {
  await uploadFile(setup(), file);

  expect(s3Auth).toBeNull();
});

test('an expired URL (403 from S3) rejects with UploadError and never confirms', async () => {
  s3Status = 403;

  await expect(uploadFile(setup(), file)).rejects.toThrow(UploadError);
  expect(log).toEqual(['POST /api/uploads', 'PUT s3 image/png']);
});
