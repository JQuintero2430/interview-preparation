import { expectTypeOf, vi } from 'vitest';
import { ContractError, HttpError, createApiClient, userSchema, type User, type UserWire } from './apiClient';

const wireUser: UserWire = {
  id: 1,
  name: 'Ada',
  email: 'ada@example.com',
  role: 'admin',
  joined: '2026-01-02T03:04:05Z',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const fetchMock = vi.fn<typeof fetch>();
beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

const api = createApiClient('http://api.test');

describe('typed API client (runtime)', () => {
  it('parses and transforms a valid response (ISO string becomes a Date)', async () => {
    fetchMock.mockResolvedValue(json(wireUser));
    const user = await api.getUser(1);
    expect(user.joined).toBeInstanceOf(Date);
    expect(user.name).toBe('Ada');
    expect(fetchMock).toHaveBeenCalledWith('http://api.test/users/1', undefined);
  });

  it('throws ContractError when the server breaks the contract, with the Zod issues attached', async () => {
    fetchMock.mockResolvedValue(json({ ...wireUser, role: 'root' }));
    const error = await api.getUser(1).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ContractError);
    expect((error as ContractError).issues.issues[0]?.path).toEqual(['role']);
  });

  it('throws HttpError with the status for non-2xx responses', async () => {
    // A Response body can be read once, so hand out a fresh one per call.
    fetchMock.mockImplementation(() => Promise.resolve(json({ title: 'Not found' }, 404)));
    await expect(api.getUser(9)).rejects.toMatchObject({ name: 'HttpError', status: 404 });
    await expect(api.getUser(9)).rejects.toBeInstanceOf(HttpError);
  });

  it('validates every element of a list', async () => {
    fetchMock.mockResolvedValue(json([wireUser, { ...wireUser, id: -1 }]));
    await expect(api.listUsers()).rejects.toBeInstanceOf(ContractError);
  });

  it('createUser rejects invalid input before any request is sent', async () => {
    await expect(api.createUser({ name: 'Ada', email: 'not-an-email' })).rejects.toThrow();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('createUser POSTs the validated body as JSON', async () => {
    fetchMock.mockResolvedValue(json(wireUser, 201));
    await api.createUser({ name: 'Ada', email: 'ada@example.com' });
    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe('http://api.test/users');
    expect(init?.method).toBe('POST');
    expect(JSON.parse(String(init?.body))).toEqual({ name: 'Ada', email: 'ada@example.com' });
  });
});

describe('typed API client (compile-time, checked by tsc)', () => {
  it('output type is derived from the schema, input type is the wire shape', () => {
    expectTypeOf(api.getUser).returns.resolves.toEqualTypeOf<User>();
    expectTypeOf<User['joined']>().toEqualTypeOf<Date>();
    expectTypeOf<UserWire['joined']>().toEqualTypeOf<string>();
    expectTypeOf(api.listUsers).returns.resolves.toEqualTypeOf<User[]>();
  });

  it('safeParse on unknown input is the only way to get a User out of untrusted JSON', () => {
    const result = userSchema.safeParse(wireUser);
    if (result.success) expectTypeOf(result.data).toEqualTypeOf<User>();
    expect(result.success).toBe(true);
  });

  it('createUser input is checked statically too', () => {
    // @ts-expect-error - email is required
    const bad = () => api.createUser({ name: 'Ada' });
    expect(bad).toBeTypeOf('function');
  });
});
