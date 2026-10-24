// Section 7 claims, about our model (handshake-guard.ts) of Spring's origin check, the masked CSRF token on CONNECT,
// a token ChannelInterceptor and message authorization. Nothing here runs Spring, opens a connection or reads a clock:
// random bytes come from a fixed source and the token check is a fake.
import {
  authenticateConnect,
  authorizationInterceptor,
  csrfInterceptor,
  handshake,
  inbound,
  maskToken,
  matchers,
  type HandshakeRequest,
  type InboundMessage,
  type Principal,
  type RandomBytes,
  type Rule,
  type SessionAttributes,
} from './handshake-guard';
import type { StompFrame } from './stomp-frame';

const COOKIE_TOKEN = '0f8fad5b-d9cb-469f-a165-70867728950e'; // a UUID, as CookieCsrfTokenRepository generates
const fixedRandom =
  (seed: number): RandomBytes =>
  (size) =>
    Uint8Array.from({ length: size }, (_, index) => (seed + index * 31) % 256);

const app: HandshakeRequest = { origin: 'https://app.example.com', scheme: 'https', host: 'app.example.com', port: 443 };
const attributes: SessionAttributes = { expectedCsrfToken: COOKIE_TOKEN };
const user: Principal = { name: 'ana', roles: ['USER'] };

// The rules of the section's Java snippet, in the same order.
const rules: readonly Rule[] = [
  { matches: matchers.nullDest(), decision: 'authenticated' },
  { matches: matchers.subscribeDest('/user/queue/errors'), decision: 'authenticated' },
  { matches: matchers.subscribeDest('/topic/prices'), decision: 'authenticated' },
  { matches: matchers.dest('/app/**'), decision: { hasRole: 'USER' } },
  { matches: matchers.types('MESSAGE', 'SUBSCRIBE'), decision: 'denyAll' },
  { matches: matchers.any(), decision: 'denyAll' },
];

const connect = (headers: Record<string, string>): StompFrame => ({
  command: 'CONNECT',
  headers: { 'accept-version': '1.2', host: 'app.example.com', ...headers },
  body: '',
});

describe('Module 43 · section 7', () => {
  it('Section 7: a handshake from another origin is refused with 403 unless the origin is allowed', () => {
    expect(handshake(app, [])).toEqual({ status: 101, attributes: {} });
    expect(handshake({ ...app, origin: 'https://evil.example' }, [])).toEqual({ status: 403 });
    expect(handshake({ ...app, origin: 'https://admin.example.com' }, ['https://admin.example.com']).status).toBe(101);
    // No Origin header (not a browser) passes: the check guards browsers only.
    expect(handshake({ scheme: 'https', host: 'app.example.com', port: 443 }, []).status).toBe(101);

    // Behind a TLS-terminating proxy the servlet request is http on 8080 until forwarded headers rewrite it.
    expect(handshake({ ...app, scheme: 'http', port: 8080 }, []).status).toBe(403);

    // The CSRF handshake interceptor copies the raw token the handshake request loaded.
    expect(handshake({ ...app, csrfToken: COOKIE_TOKEN }, [])).toEqual({ status: 101, attributes });
  });

  it('Section 7: CONNECT with the raw cookie token fails and with the masked token passes', () => {
    const csrfOnly = [csrfInterceptor];
    const raw = inbound({ frame: connect({ 'X-XSRF-TOKEN': COOKIE_TOKEN }), attributes }, csrfOnly);
    expect(raw).toEqual({
      error: { command: 'ERROR', headers: { message: `Invalid CSRF Token '${COOKIE_TOKEN}'` }, body: '' },
      closeCode: 1002,
    });

    const first = maskToken(COOKIE_TOKEN, fixedRandom(1));
    const second = maskToken(COOKIE_TOKEN, fixedRandom(2));
    expect(first).not.toBe(second);
    expect(first).toHaveLength(96); // 72 bytes: the token's 36 random bytes, then the token XOR those bytes
    for (const masked of [first, second]) {
      expect(inbound({ frame: connect({ 'X-XSRF-TOKEN': masked }), attributes }, csrfOnly)).toHaveProperty('accepted');
    }

    // CSRF off on HTTP: the handshake copied no token, so every CONNECT fails, whatever it sends.
    expect(inbound({ frame: connect({ 'X-XSRF-TOKEN': first }), attributes: {} }, csrfOnly)).toMatchObject({
      error: { headers: { message: 'Could not verify the provided CSRF token because no token was found to compare.' } },
    });
  });

  it('Section 7: CONNECT with an expired JWT is refused and with a valid one sets the user', () => {
    // Our fake decoder; the expiry is decided by the token's name, so no clock is read.
    const verify = (token: string): Principal => {
      if (token !== 'valid-jwt') throw new Error('Jwt expired');
      return user;
    };
    const channel = [(message: InboundMessage) => authenticateConnect(message, verify), authorizationInterceptor(rules)];

    const expired = inbound({ frame: connect({ Authorization: 'Bearer expired-jwt' }), attributes }, channel);
    expect(expired).toMatchObject({ error: { command: 'ERROR', headers: { message: 'Jwt expired' } }, closeCode: 1002 });

    const valid = inbound({ frame: connect({ Authorization: 'Bearer valid-jwt' }), attributes }, channel);
    expect(valid).toMatchObject({ accepted: { user } });

    // Ordered after the authorization interceptor, ours would set the user too late: the CONNECT is denied.
    const late = inbound({ frame: connect({ Authorization: 'Bearer valid-jwt' }), attributes }, [...channel].reverse());
    expect(late).toMatchObject({ error: { headers: { message: 'Access Denied' } } });
  });

  it('Section 7: a SEND to a broker destination is denied by the message rules', () => {
    const authorize = [authorizationInterceptor(rules)];
    const frame = (command: string, destination: string): StompFrame => ({ command, headers: { destination }, body: '' });
    const as = (message: StompFrame) => inbound({ frame: message, attributes, user }, authorize);

    expect(as(frame('SEND', '/topic/prices'))).toMatchObject({ error: { headers: { message: 'Access Denied' } } });
    expect(as(frame('SUBSCRIBE', '/topic/prices'))).toHaveProperty('accepted');
    expect(as(frame('SEND', '/app/room.1'))).toHaveProperty('accepted');
    expect(as(frame('SUBSCRIBE', '/queue/orders'))).toHaveProperty('error');
    expect(inbound({ frame: frame('SEND', '/app/room.1'), attributes }, authorize)).toHaveProperty('error');
  });
});
