import { ApiError, describeError, fieldErrors, readApiError } from './problem';

function problemResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/problem+json' } });
}

test('readApiError keeps the RFC 9457 members and the errors extension', async () => {
  const error = await readApiError(
    problemResponse(400, { type: 'about:blank', title: 'Bad Request', status: 400, errors: [{ field: 'name', message: 'must not be blank' }] }),
  );

  expect(error).toBeInstanceOf(ApiError);
  expect(error.status).toBe(400);
  expect(error.problem?.title).toBe('Bad Request');
  expect(error.problem?.errors).toEqual([{ field: 'name', message: 'must not be blank' }]);
});

test('a missing type is fine: Spring 7 omits it unless set, and absent means about:blank', async () => {
  const error = await readApiError(problemResponse(404, { title: 'Not Found', status: 404 }));

  expect(error.problem?.type).toBeUndefined();
  expect(error.message).toBe('Not Found');
});

test('a proxy HTML error page has no problem, only a status', async () => {
  const html = new Response('<h1>Bad gateway</h1>', { status: 502, headers: { 'Content-Type': 'text/html' } });

  const error = await readApiError(html);

  expect(error.status).toBe(502);
  expect(error.problem).toBeUndefined();
  expect(describeError(error)).toBe('HTTP 502');
});

test('problem+json that does not match the schema is treated as no problem', async () => {
  const error = await readApiError(problemResponse(400, { errors: 'nope' }));

  expect(error.problem).toBeUndefined();
});

test('fieldErrors keeps the first message per field and ignores other errors', async () => {
  const error = await readApiError(
    problemResponse(400, {
      errors: [
        { field: 'name', message: 'must not be blank' },
        { field: 'name', message: 'size must be between 0 and 60' },
        { field: 'email', message: 'must be a well-formed email address' },
      ],
    }),
  );

  expect(fieldErrors(error)).toEqual({ name: 'must not be blank', email: 'must be a well-formed email address' });
  expect(fieldErrors(new TypeError('Failed to fetch'))).toEqual({});
});
