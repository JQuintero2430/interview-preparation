import { checkCors, needsPreflight, type CorsAnswer, type CorsRequest } from './cors-model';

const origin = 'https://app.example.com';
const get: CorsRequest = { origin, method: 'GET' };
const ok = (headers: Record<string, string>): CorsAnswer => ({ status: 200, headers });
const allowOrigin = ok({ 'Access-Control-Allow-Origin': origin });

describe('E09.1 CORS decision model', () => {
  it('a GET, HEAD or POST with only safelisted headers and a safelisted Content-Type is simple (no preflight)', () => {
    expect(needsPreflight(get)).toBe(false);
    expect(needsPreflight({ origin, method: 'HEAD', headers: { Accept: 'text/html', 'accept-language': 'en' } })).toBe(false);
    expect(needsPreflight({ origin, method: 'POST', headers: { 'Content-Type': 'text/plain;charset=UTF-8' } })).toBe(false);
    expect(needsPreflight({ origin, method: 'POST', headers: { 'content-type': 'multipart/form-data; boundary=x' } })).toBe(false);
  });

  it('another method, a custom header or Content-Type: application/json needs a preflight', () => {
    expect(needsPreflight({ origin, method: 'PUT' })).toBe(true);
    expect(needsPreflight({ origin, method: 'GET', headers: { 'X-Trace': '1' } })).toBe(true);
    expect(needsPreflight({ origin, method: 'POST', headers: { 'Content-Type': 'application/json' } })).toBe(true);
  });

  it('the response is readable only if Access-Control-Allow-Origin is * or exactly the request origin', () => {
    expect(checkCors({ request: get, response: allowOrigin }).readable).toBe(true);
    expect(checkCors({ request: get, response: ok({ 'access-control-allow-origin': '*' }) }).readable).toBe(true);
    const other = checkCors({ request: get, response: ok({ 'Access-Control-Allow-Origin': 'https://other.example.com' }) });
    expect(other).toMatchObject({ sent: true, readable: false });
    expect(checkCors({ request: get, response: ok({}) }).readable).toBe(false);
  });

  it('with credentials, * is rejected and Access-Control-Allow-Credentials: true is required', () => {
    const request = { ...get, credentials: true };
    expect(checkCors({ request, response: ok({ 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Credentials': 'true' }) }).readable).toBe(false);
    expect(checkCors({ request, response: allowOrigin }).readable).toBe(false);
    expect(checkCors({ request, response: ok({ 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Credentials': 'true' }) }).readable).toBe(true);
  });

  it('a preflight answer must allow the method and every non-safelisted header (names case-insensitive), otherwise the real request is not sent', () => {
    const request: CorsRequest = { origin, method: 'PUT', headers: { 'X-Trace': '1', 'Content-Type': 'application/json' } };
    const preflight = (extra: Record<string, string>): CorsAnswer => ({ status: 204, headers: { 'Access-Control-Allow-Origin': origin, ...extra } });
    const allowed = preflight({ 'Access-Control-Allow-Methods': 'GET, PUT', 'Access-Control-Allow-Headers': 'content-type, x-TRACE' });
    expect(checkCors({ request, preflight: allowed, response: allowOrigin })).toMatchObject({ sent: true, readable: true });
    const noMethod = preflight({ 'Access-Control-Allow-Methods': 'GET', 'Access-Control-Allow-Headers': 'content-type, x-trace' });
    const noHeader = preflight({ 'Access-Control-Allow-Methods': 'PUT', 'Access-Control-Allow-Headers': 'content-type' });
    expect(checkCors({ request, preflight: noMethod, response: allowOrigin })).toMatchObject({ sent: false, readable: false });
    expect(checkCors({ request, preflight: noHeader, response: allowOrigin })).toMatchObject({ sent: false, readable: false });
    expect(checkCors({ request, preflight: { ...allowed, status: 500 }, response: allowOrigin }).sent).toBe(false);
    expect(checkCors({ request, response: allowOrigin }).sent).toBe(false);
  });
});
